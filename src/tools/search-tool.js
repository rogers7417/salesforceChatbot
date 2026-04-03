/**
 * LangChain Tool: 매장/업체 검색
 * 기존 모듈: search-salesforce.js, search-slack.js, summarize.js, format.js
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { searchAccounts, searchByKeyword } = require('../search-salesforce');
const { searchSlackMessages } = require('../search-slack');
const { summarize } = require('../summarize');
const { formatSearchResult, formatAccountList } = require('../format');
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

const searchTool = tool(
  async ({ keyword, subIntent }) => {
    const intent = subIntent || 'general';

    if (intent === 'install') {
      const { accessToken, instanceUrl } = await getSalesforceToken();
      const escaped = escapeSoqlString(keyword);
      const query = `
        SELECT Name, Account__r.Name, InstallationDate__c, InstallationType__c,
               InstallationStage__c, InstallationStatus__c, Owner.Name,
               ServiceTerritory__r.Name, NumbeofTablets__c, CompletedDate__c
        FROM Installation__c
        WHERE Account__r.Name LIKE '%${escaped}%'
        ORDER BY InstallationDate__c DESC
        LIMIT 20
      `.replace(/\s+/g, ' ').trim();
      const result = await soqlQuery(instanceUrl, accessToken, query);
      const records = result.records || [];
      if (records.length === 0) return `"${keyword}" 관련 설치 정보가 없습니다.`;
      let msg = `🔧 *"${keyword}" 설치 현황* (${records.length}건)\n\n\`\`\`\n`;
      records.forEach(r => {
        msg += `• ${r.Account__r?.Name || r.Name} / ${r.InstallationType__c || '-'} / ${r.InstallationStage__c || '-'} / ${r.InstallationDate__c || '-'} / 담당: ${r.Owner?.Name || '-'}\n`;
      });
      msg += '```\n';
      return msg;
    }

    if (intent === 'contract') {
      const { accessToken, instanceUrl } = await getSalesforceToken();
      const escaped = escapeSoqlString(keyword);
      const query = `
        SELECT Name, ContractType__c, ContractStatus__c,
               ContractDateStart__c, ContractDateEnd__c,
               TotalAmount__c, TotalTablet__c, PaymentType__c,
               Account__r.Name
        FROM Contract__c
        WHERE Account__r.Name LIKE '%${escaped}%'
        ORDER BY ContractDateStart__c DESC
        LIMIT 20
      `.replace(/\s+/g, ' ').trim();
      const result = await soqlQuery(instanceUrl, accessToken, query);
      const records = result.records || [];
      if (records.length === 0) return `"${keyword}" 관련 계약 정보가 없습니다.`;
      let msg = `📋 *"${keyword}" 계약 현황* (${records.length}건)\n\n\`\`\`\n`;
      records.forEach(r => {
        const amount = r.TotalAmount__c ? `${(r.TotalAmount__c / 10000).toFixed(0)}만원` : '-';
        msg += `• ${r.Account__r?.Name || r.Name} / ${r.ContractType__c || '-'} / ${r.ContractStatus__c || '-'} / ${r.ContractDateStart__c || '?'}~${r.ContractDateEnd__c || '?'} / ${amount}\n`;
      });
      msg += '```\n';
      return msg;
    }

    if (intent === 'history') {
      const { accessToken, instanceUrl } = await getSalesforceToken();
      const escaped = escapeSoqlString(keyword);
      const query = `
        SELECT Subject, Status, Type, ActivityDate, Owner.Name, Account.Name
        FROM Task
        WHERE Account.Name LIKE '%${escaped}%'
        ORDER BY ActivityDate DESC
        LIMIT 20
      `.replace(/\s+/g, ' ').trim();
      const result = await soqlQuery(instanceUrl, accessToken, query);
      const records = result.records || [];
      if (records.length === 0) return `"${keyword}" 관련 활동 이력이 없습니다.`;
      let msg = `📝 *"${keyword}" 활동 이력* (${records.length}건)\n\n\`\`\`\n`;
      records.forEach(r => {
        msg += `• ${r.ActivityDate || '-'} | ${r.Subject || '-'} | ${r.Type || '-'} | ${r.Status || '-'} | ${r.Owner?.Name || '-'}\n`;
      });
      msg += '```\n';
      return msg;
    }

    // general: 기존 로직
    const [sfData, slackMessages] = await Promise.all([
      searchByKeyword(keyword),
      searchSlackMessages(keyword),
    ]);

    const hasData =
      sfData.accounts.length > 0 ||
      sfData.leads.length > 0 ||
      sfData.opportunities.length > 0;

    if (!hasData && slackMessages.length === 0) {
      return `"${keyword}" 관련 검색 결과가 없습니다.`;
    }

    let result = formatSearchResult(keyword, sfData, slackMessages);

    if (slackMessages.length > 0 || hasData) {
      try {
        const summary = await summarize(keyword, sfData, slackMessages);
        result += `\n📝 *요약*\n\`\`\`\n${summary}\n\`\`\`\n`;
      } catch (err) {
        console.error('[요약 실패]', err.message);
      }
    }

    return result;
  },
  {
    name: 'search',
    description:
      '매장명, 업체명, 키워드로 Salesforce와 Slack을 통합 검색합니다. ' +
      'Account, Lead, Opportunity 정보와 Slack 대화를 검색하고 요약합니다. ' +
      'subIntent로 특정 영역만 조회할 수 있습니다: ' +
      '"install"은 설치 현황(Installation__c), "contract"는 계약 정보(Contract__c), "history"는 활동 이력(Task), "general"은 전체 검색입니다. ' +
      '"OO 매장 검색", "OO 현황", "OO 설치 현황", "OO 계약 정보", "OO 이력" 등의 질문에 사용합니다. ' +
      '조회 필드 - Account: Name(상호), Owner.Name, Phone / ' +
      'Lead: Name, Company, Status, Owner.Name, CreatedDate, Phone, Email / ' +
      'Opportunity: Name, StageName, Amount, CloseDate, Owner.Name, Account.Name',
    schema: z.object({
      keyword: z.string().describe('검색할 매장명, 업체명, 또는 키워드'),
      subIntent: z
        .enum(['general', 'install', 'contract', 'history'])
        .optional()
        .default('general')
        .describe('검색 의도. general=전체검색, install=설치현황, contract=계약정보, history=활동이력'),
    }),
  }
);

module.exports = { searchTool };
