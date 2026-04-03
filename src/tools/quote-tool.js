/**
 * LangChain Tool: 견적 정보 조회
 * 기존 모듈: salesforce.js (getSalesforceToken, soqlQuery)
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

const quoteTool = tool(
  async ({ keyword }) => {
    const { accessToken, instanceUrl } = await getSalesforceToken();
    const escaped = escapeSoqlString(keyword);

    const query = `
      SELECT Name, Status, OpportunityId, Opportunity.Name,
             AccountId, Account.Name,
             ru_TotalAmounts__c, ru_FinalTotalAmount__c,
             PaymentTypeQuote__c, ExpirationDate
      FROM Quote
      WHERE Account.Name LIKE '%${escaped}%'
         OR Opportunity.Name LIKE '%${escaped}%'
      ORDER BY CreatedDate DESC
      LIMIT 20
    `.replace(/\s+/g, ' ').trim();

    const result = await soqlQuery(instanceUrl, accessToken, query);
    const records = result.records || [];

    if (records.length === 0) {
      return `"${keyword}" 관련 견적 정보를 찾을 수 없습니다.`;
    }

    let msg = `📄 *"${keyword}" 견적 정보* (${records.length}건)\n\n`;
    msg += '```\n';
    records.forEach(r => {
      const totalAmount = r.ru_TotalAmounts__c ? `${(r.ru_TotalAmounts__c / 10000).toFixed(0)}만원` : '-';
      const finalAmount = r.ru_FinalTotalAmount__c ? `${(r.ru_FinalTotalAmount__c / 10000).toFixed(0)}만원` : '-';
      msg += `• ${r.Name}\n`;
      msg += `  매장: ${r.Account?.Name || '-'} / 영업기회: ${r.Opportunity?.Name || '-'}\n`;
      msg += `  상태: ${r.Status || '-'} / 만료: ${r.ExpirationDate || '-'}\n`;
      msg += `  약정금액: ${totalAmount} / 최종금액: ${finalAmount} / 납부: ${r.PaymentTypeQuote__c || '-'}\n\n`;
    });
    msg += '```\n';

    return msg;
  },
  {
    name: 'quote',
    description:
      '매장/영업기회의 견적서 정보를 조회합니다. 견적 현황, 견적 금액, 납부방법 등의 질문에 사용합니다. ' +
      '"OO 견적", "OO 견적서", "OO 견적 금액", "OO 납부방법" 등의 질문에 사용합니다. ' +
      '조회 필드 - Quote: Name(견적서 이름), Status(상태), ' +
      'Opportunity.Name(영업기회), Account.Name(매장명), ' +
      'ru_TotalAmounts__c(총 약정금액), ru_FinalTotalAmount__c(최종 총금액), ' +
      'PaymentTypeQuote__c(납부방법), ExpirationDate(만료 일자)',
    schema: z.object({
      keyword: z.string().describe('검색할 매장명 또는 영업기회명'),
    }),
  }
);

module.exports = { quoteTool };
