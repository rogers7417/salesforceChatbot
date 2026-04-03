/**
 * Tool: account_lookup
 * 매장 관련 전체 데이터를 한번에 조회 → LLM이 질문에 맞게 답변
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getSalesforceToken, soqlQuery } = require('../salesforce');
const { searchSlackThreaded } = require('../search-slack');
const Anthropic = require('@anthropic-ai/sdk');

const aiClient = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

function escapeSoqlString(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/[()（）\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
}

const accountLookupTool = tool(
  async ({ keyword, question }) => {
    const { accessToken, instanceUrl } = await getSalesforceToken();

    // 브랜드명 + 지점명 분리
    const branchMatch = keyword.match(/[（(](.+?)[)）]/);
    const brandOnly = keyword.replace(/[（(].+?[)）]/g, '').trim();
    const escapedBrand = escapeSoqlString(brandOnly);

    // 1. Account 찾기 (지점 구분)
    let accountId;
    let accountData;

    if (branchMatch) {
      const branchName = escapeSoqlString(branchMatch[1]);
      const oppResult = await soqlQuery(instanceUrl, accessToken, `
        SELECT AccountId, Account.Name, Account.Owner.Name, Account.Phone,
               Account.OperationStatus__c, Account.ContractTabletQuantity__c,
               Account.ActivableTabletNumber__c
        FROM Opportunity WHERE Name LIKE '%${escapedBrand}%${branchName}%' LIMIT 1
      `.replace(/\s+/g, ' ').trim());

      if (oppResult.records?.length > 0) {
        const opp = oppResult.records[0];
        accountId = opp.AccountId;
        accountData = `이름: ${opp.Account?.Name}, 담당: ${opp.Account?.Owner?.Name || '-'}, 전화: ${opp.Account?.Phone || '-'}, 운영상태: ${opp.Account?.OperationStatus__c || '-'}, 활성태블릿: ${opp.Account?.ActivableTabletNumber__c || 0}대, 계약태블릿: ${opp.Account?.ContractTabletQuantity__c || 0}대`;
      }
    }

    if (!accountId) {
      const accResult = await soqlQuery(instanceUrl, accessToken, `
        SELECT Id, Name, Owner.Name, Phone, OperationStatus__c,
               ContractTabletQuantity__c, ActivableTabletNumber__c
        FROM Account WHERE Name LIKE '%${escapedBrand}%' LIMIT 3
      `.replace(/\s+/g, ' ').trim());

      if (accResult.records?.length === 0) {
        return `"${keyword}" 매장을 찾을 수 없습니다.`;
      }
      const acc = accResult.records[0];
      accountId = acc.Id;
      accountData = `이름: ${acc.Name}, 담당: ${acc.Owner?.Name || '-'}, 전화: ${acc.Phone || '-'}, 운영상태: ${acc.OperationStatus__c || '-'}, 활성태블릿: ${acc.ActivableTabletNumber__c || 0}대`;
    }

    // 2. 전체 데이터 병렬 조회
    const [leads, opps, contracts, installs, orders, slackData] = await Promise.all([
      soqlQuery(instanceUrl, accessToken, `
        SELECT Name, Company, Status, CreatedDate, IsConverted, ConvertedDate,
               Owner.Name, LeadSource, LossReason__c, PartnerName__r.Name, Phone
        FROM Lead WHERE Company LIKE '%${escapedBrand}%' OR ConvertedAccountId = '${accountId}'
        ORDER BY CreatedDate DESC LIMIT 10
      `.replace(/\s+/g, ' ').trim()),

      soqlQuery(instanceUrl, accessToken, `
        SELECT Name, StageName, Amount, CloseDate, CreatedDate, Owner.Name,
               IsClosed, IsWon, Loss_Reason__c, AgeInDays
        FROM Opportunity WHERE AccountId = '${accountId}'
        ORDER BY CreatedDate DESC LIMIT 10
      `.replace(/\s+/g, ' ').trim()),

      soqlQuery(instanceUrl, accessToken, `
        SELECT Name, ContractType__c, ContractStatus__c,
               ContractDateStart__c, ContractDateEnd__c,
               TotalAmount__c, TotalTablet__c, PaymentType__c, Opportunity__r.Name
        FROM Contract__c WHERE Account__c = '${accountId}'
        ORDER BY ContractDateStart__c DESC LIMIT 10
      `.replace(/\s+/g, ' ').trim()),

      soqlQuery(instanceUrl, accessToken, `
        SELECT Name, InstallationType__c, InstallationStage__c,
               InstallationDate__c, CompletedDate__c,
               ServiceTerritory__r.Name, NumbeofTablets__c, Opportunity__r.Name
        FROM Installation__c WHERE Account__c = '${accountId}'
        ORDER BY InstallationDate__c DESC LIMIT 10
      `.replace(/\s+/g, ' ').trim()),

      soqlQuery(instanceUrl, accessToken, `
        SELECT Name, Status, OutputDate__c, ru_ItemQty__c,
               Brand_Branch__c, Opportunity.Name
        FROM Order WHERE AccountId = '${accountId}'
        ORDER BY CreatedDate DESC LIMIT 10
      `.replace(/\s+/g, ' ').trim()),

      searchSlackThreaded(keyword, 20),
    ]);

    // 3. 전체 데이터를 텍스트로 구성
    let context = `[Account]\n${accountData}\n\n`;

    if (leads.records?.length > 0) {
      context += `[Lead] ${leads.totalSize}건\n`;
      leads.records.forEach(l => {
        const partner = l.PartnerName__r?.Name ? `, 소개: ${l.PartnerName__r.Name}` : '';
        context += `  ${l.CreatedDate?.slice(0, 10)} ${l.Company || l.Name} / ${l.Status} / 유입: ${l.LeadSource || '-'} / 담당: ${l.Owner?.Name || '-'}${partner}\n`;
        if (l.IsConverted) context += `    → 전환: ${l.ConvertedDate}\n`;
        if (l.LossReason__c) context += `    → 종료사유: ${l.LossReason__c}\n`;
      });
      context += '\n';
    }

    if (opps.records?.length > 0) {
      context += `[영업기회] ${opps.totalSize}건\n`;
      opps.records.forEach(o => {
        const amount = o.Amount ? `${(o.Amount / 10000).toFixed(0)}만원` : '-';
        context += `  ${o.CreatedDate?.slice(0, 10)} ${o.Name} / ${o.StageName} / ${amount} / 마감: ${o.CloseDate || '-'} / 경과: ${o.AgeInDays || 0}일 / 담당: ${o.Owner?.Name || '-'}\n`;
        if (o.Loss_Reason__c) context += `    → 취소사유: ${o.Loss_Reason__c}\n`;
      });
      context += '\n';
    }

    if (contracts.records?.length > 0) {
      context += `[계약] ${contracts.totalSize}건\n`;
      contracts.records.forEach(c => {
        const amount = c.TotalAmount__c ? `${(c.TotalAmount__c / 10000).toFixed(0)}만원` : '-';
        context += `  ${c.Opportunity__r?.Name || c.Name} / ${c.ContractType__c || '-'} / ${c.ContractStatus__c || '-'} / ${c.TotalTablet__c || '-'}대 / ${amount} / ${c.ContractDateStart__c || '?'}~${c.ContractDateEnd__c || '?'} / ${c.PaymentType__c || '-'}\n`;
      });
      context += '\n';
    }

    if (installs.records?.length > 0) {
      context += `[설치] ${installs.totalSize}건\n`;
      installs.records.forEach(i => {
        context += `  ${i.InstallationDate__c || '-'} ${i.Opportunity__r?.Name || i.Name} / ${i.InstallationType__c || '-'} / ${i.InstallationStage__c || '-'} / ${i.NumbeofTablets__c || '-'}대 / 업체: ${i.ServiceTerritory__r?.Name || '-'} / 완료: ${i.CompletedDate__c || '-'}\n`;
      });
      context += '\n';
    }

    if (orders.records?.length > 0) {
      context += `[출고] ${orders.totalSize}건\n`;
      orders.records.forEach(o => {
        context += `  ${o.OutputDate__c || '-'} ${o.Brand_Branch__c || o.Name} / ${o.Status || '-'} / ${o.ru_ItemQty__c || 0}개\n`;
      });
      context += '\n';
    }

    if (slackData.threads?.length > 0) {
      context += `[Slack 대화] ${slackData.threads.length}개 대화\n`;
      slackData.threads.slice(0, 8).forEach(t => {
        context += `  ${t.date} #${t.channel} (${t.messageCount}건)\n`;
        t.conversation.slice(0, 3).forEach(c => {
          context += `    ${c.user}: ${(c.text || '').replace(/\n/g, ' ').slice(0, 150)}\n`;
        });
      });
    }

    // 4. LLM에 전체 데이터 + 질문을 넣어서 답변 생성
    const userQuestion = question || keyword;
    const aiResponse = await aiClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `아래는 "${keyword}" 매장의 Salesforce + Slack 전체 데이터입니다.

사용자 질문: "${userQuestion}"

이 데이터를 바탕으로 질문에 맞게 답변해주세요.

응답 규칙:
- 마크다운 기호 사용하지 마 (**, ##, 백틱 등)
- 일반 텍스트, 줄바꿈, 들여쓰기로 구분
- 숫자와 핵심 정보 위주로 간결하게
- 질문과 관련 없는 데이터는 생략
- Slack 대화가 있으면 최근 활동으로 요약

${context}`
      }],
    });

    return aiResponse.content[0].text;
  },
  {
    name: 'account_lookup',
    description:
      '매장/업체의 전체 데이터(Account, Lead, 영업기회, 계약, 설치, 출고, Slack 대화)를 한번에 조회하고 질문에 맞게 답변합니다. ' +
      '매장명과 함께 구체적인 질문이 있을 때 사용합니다. ' +
      '"OO 계약 현황", "OO 설치 누가 했어?", "OO 최근에 무슨 일 있었어?", "OO 현황", "OO 파이프라인" 등 모든 매장 관련 질문에 사용합니다. ' +
      '단순 매장명만 입력해도 전체 현황을 요약합니다.',
    schema: z.object({
      keyword: z.string().describe('검색할 매장명 (예: 소박한밥상(서산점))'),
      question: z.string().optional().describe('사용자의 원래 질문 (예: 계약 조건이 뭐야?)'),
    }),
  }
);

module.exports = { accountLookupTool };
