/**
 * LangChain Tool: 고객 여정 조회
 * 매장의 전체 여정을 타임라인으로 보여줍니다.
 * Lead 인입 → 전환 → 영업기회 → 계약 → 출고 → 설치 → 운영
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getSalesforceToken, soqlQuery } = require('../salesforce');

// SOQL 문자열 이스케이프
function escapeSoqlString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/[()（）\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const journeyTool = tool(
  async ({ keyword }) => {
    const { accessToken, instanceUrl } = await getSalesforceToken();
    const escaped = escapeSoqlString(keyword);

    // 1. Account 검색
    const accountResult = await soqlQuery(instanceUrl, accessToken, `
      SELECT Id, Name, Owner.Name, Phone, OperationStatus__c,
             ContractTabletQuantity__c, ActivableTabletNumber__c, CreatedDate
      FROM Account
      WHERE Name LIKE '%${escaped}%'
      LIMIT 5
    `.replace(/\s+/g, ' ').trim());

    const accounts = accountResult.records || [];
    if (accounts.length === 0) {
      return `"${keyword}" 매장을 찾을 수 없습니다.`;
    }

    const account = accounts[0];
    const accountId = account.Id;
    const accountName = account.Name;

    // 2. 관련 데이터 병렬 조회
    const [leadResult, oppResult, contractResult, installResult, orderResult] = await Promise.all([
      soqlQuery(instanceUrl, accessToken, `
        SELECT Name, Company, Status, CreatedDate, IsConverted, ConvertedDate,
               ConvertedAccountId, Owner.Name, LeadSource, LossReason__c, PartnerName__r.Name
        FROM Lead
        WHERE Company LIKE '%${escaped}%' OR ConvertedAccountId = '${accountId}'
        ORDER BY CreatedDate ASC
        LIMIT 10
      `.replace(/\s+/g, ' ').trim()),

      soqlQuery(instanceUrl, accessToken, `
        SELECT Name, StageName, Amount, CloseDate, CreatedDate,
               Owner.Name, IsClosed, IsWon, Loss_Reason__c
        FROM Opportunity
        WHERE AccountId = '${accountId}'
        ORDER BY CreatedDate ASC
        LIMIT 10
      `.replace(/\s+/g, ' ').trim()),

      soqlQuery(instanceUrl, accessToken, `
        SELECT Name, ContractType__c, ContractStatus__c,
               ContractDateStart__c, ContractDateEnd__c,
               TotalAmount__c, TotalTablet__c, PaymentType__c
        FROM Contract__c
        WHERE Account__c = '${accountId}'
        ORDER BY ContractDateStart__c ASC
        LIMIT 10
      `.replace(/\s+/g, ' ').trim()),

      soqlQuery(instanceUrl, accessToken, `
        SELECT Name, InstallationType__c, InstallationStage__c,
               InstallationDate__c, CompletedDate__c,
               ServiceTerritory__r.Name, NumbeofTablets__c
        FROM Installation__c
        WHERE Account__c = '${accountId}'
        ORDER BY InstallationDate__c ASC
        LIMIT 10
      `.replace(/\s+/g, ' ').trim()),

      soqlQuery(instanceUrl, accessToken, `
        SELECT Name, Status, OutputDate__c, ru_ItemQty__c,
               MasterTabletAmount__c, Brand_Branch__c
        FROM Order
        WHERE AccountId = '${accountId}'
        ORDER BY CreatedDate ASC
        LIMIT 10
      `.replace(/\s+/g, ' ').trim()),
    ]);

    const leads = leadResult.records || [];
    const opps = oppResult.records || [];
    const contracts = contractResult.records || [];
    const installations = installResult.records || [];
    const orders = orderResult.records || [];

    // 3. 타임라인 구성
    const timeline = [];

    // Lead 이벤트
    leads.forEach(l => {
      const partner = l.PartnerName__r?.Name ? ` / 소개: ${l.PartnerName__r.Name}` : '';
      timeline.push({
        date: l.CreatedDate?.slice(0, 10) || '-',
        sortDate: l.CreatedDate || '',
        stage: 'Lead 인입',
        detail: `${l.Company || l.Name} / ${l.Status} / 유입: ${l.LeadSource || '-'} / 담당: ${l.Owner?.Name || '-'}${partner}`,
      });
      if (l.IsConverted && l.ConvertedDate) {
        timeline.push({
          date: l.ConvertedDate?.slice(0, 10) || '-',
          sortDate: l.ConvertedDate || '',
          stage: 'Lead 전환',
          detail: `${l.Company || l.Name} → Account/Opportunity 생성`,
        });
      }
      if (l.Status === '종료' && l.LossReason__c) {
        timeline.push({
          date: l.CreatedDate?.slice(0, 10) || '-',
          sortDate: l.CreatedDate || '',
          stage: 'Lead 종료',
          detail: `사유: ${l.LossReason__c}`,
        });
      }
    });

    // Opportunity 이벤트
    opps.forEach(o => {
      timeline.push({
        date: o.CreatedDate?.slice(0, 10) || '-',
        sortDate: o.CreatedDate || '',
        stage: '영업기회 생성',
        detail: `${o.Name} / ${o.StageName} / ${o.Amount ? (o.Amount / 10000).toFixed(0) + '만원' : '금액미정'} / 담당: ${o.Owner?.Name || '-'}`,
      });
      if (o.IsClosed) {
        timeline.push({
          date: o.CloseDate || '-',
          sortDate: o.CloseDate || '',
          stage: o.IsWon ? 'Closed Won' : 'Closed Lost',
          detail: `${o.Name}${o.Loss_Reason__c ? ' / 사유: ' + o.Loss_Reason__c : ''}`,
        });
      }
    });

    // Contract 이벤트
    contracts.forEach(c => {
      const amount = c.TotalAmount__c ? `${(c.TotalAmount__c / 10000).toFixed(0)}만원` : '-';
      timeline.push({
        date: c.ContractDateStart__c || '-',
        sortDate: c.ContractDateStart__c || '',
        stage: '계약 체결',
        detail: `${c.ContractType__c || '-'} / ${c.ContractStatus__c || '-'} / ${c.TotalTablet__c ? c.TotalTablet__c + '대' : '-'} / ${amount} / ~${c.ContractDateEnd__c || '?'}`,
      });
    });

    // Order 이벤트
    orders.forEach(o => {
      timeline.push({
        date: o.OutputDate__c || '-',
        sortDate: o.OutputDate__c || '',
        stage: '출고',
        detail: `${o.Brand_Branch__c || o.Name} / ${o.Status || '-'} / ${o.ru_ItemQty__c ? o.ru_ItemQty__c + '개' : '-'}`,
      });
    });

    // Installation 이벤트
    installations.forEach(i => {
      timeline.push({
        date: i.InstallationDate__c || '-',
        sortDate: i.InstallationDate__c || '',
        stage: '설치',
        detail: `${i.InstallationType__c || '-'} / ${i.InstallationStage__c || '-'} / ${i.NumbeofTablets__c ? i.NumbeofTablets__c + '대' : '-'} / 업체: ${i.ServiceTerritory__r?.Name || '-'}${i.CompletedDate__c ? ' / 완료: ' + i.CompletedDate__c : ''}`,
      });
    });

    // 현재 운영 상태
    if (account.OperationStatus__c) {
      timeline.push({
        date: '-',
        sortDate: 'zzz',
        stage: '현재 운영',
        detail: `상태: ${account.OperationStatus__c} / 활성 태블릿: ${account.ActivableTabletNumber__c || 0}대 / 계약 태블릿: ${account.ContractTabletQuantity__c || 0}대`,
      });
    }

    // 시간순 정렬
    timeline.sort((a, b) => (a.sortDate || '').localeCompare(b.sortDate || ''));

    // 4. 포맷팅
    let msg = `🗺️ *"${accountName}" 고객 여정*\n`;
    msg += `담당: ${account.Owner?.Name || '-'} / 전화: ${account.Phone || '-'}\n\n`;

    if (timeline.length === 0) {
      msg += '```\n여정 정보가 없습니다.\n```\n';
      return msg;
    }

    msg += '```\n';
    timeline.forEach((t, i) => {
      const connector = i < timeline.length - 1 ? '│' : ' ';
      const bullet = i === 0 ? '●' : (i === timeline.length - 1 ? '◉' : '├');
      msg += `${bullet} [${t.date}] ${t.stage}\n`;
      msg += `${connector}   ${t.detail}\n`;
      if (i < timeline.length - 1) msg += `│\n`;
    });
    msg += '```\n';

    msg += `\n총 Lead ${leads.length}건, 영업기회 ${opps.length}건, 계약 ${contracts.length}건, 출고 ${orders.length}건, 설치 ${installations.length}건`;

    return msg;
  },
  {
    name: 'get_customer_journey',
    description:
      '매장의 전체 여정을 보여줍니다. Lead 인입 → 전환 → 영업기회 → 계약 → 출고 → 설치 → 운영 순서로 타임라인 형태로 정리합니다. ' +
      '"OO 매장 여정", "OO 히스토리", "OO 전체 이력", "OO 어떻게 진행됐어?", "OO 타임라인" 등의 질문에 사용합니다. ' +
      '매장의 처음부터 현재까지의 전체 과정을 한눈에 파악할 때 유용합니다. ' +
      '조회 오브젝트: Account, Lead(IsConverted, ConvertedDate, ConvertedAccountId, LeadSource, LossReason__c, PartnerName__r.Name), ' +
      'Opportunity(StageName, Amount, CloseDate, Loss_Reason__c), ' +
      'Contract__c(ContractType__c, ContractStatus__c, ContractDateStart__c, ContractDateEnd__c, TotalTablet__c, TotalAmount__c), ' +
      'Order(Status, OutputDate__c, ru_ItemQty__c, Brand_Branch__c), ' +
      'Installation__c(InstallationType__c, InstallationStage__c, InstallationDate__c, CompletedDate__c, ServiceTerritory__r.Name, NumbeofTablets__c)',
    schema: z.object({
      keyword: z.string().describe('검색할 매장명 또는 업체명'),
    }),
  }
);

module.exports = { journeyTool };
