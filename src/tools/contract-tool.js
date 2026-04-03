/**
 * LangChain Tool: 계약 정보 조회
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

const contractTool = tool(
  async ({ keyword }) => {
    const { accessToken, instanceUrl } = await getSalesforceToken();
    const escaped = escapeSoqlString(keyword);

    const query = `
      SELECT Name, ContractType__c, ContractStatus__c,
             ContractDateStart__c, ContractDateEnd__c,
             TotalAmount__c, TotalTablet__c, PaymentType__c,
             Account__r.Name, Opportunity__r.Name,
             OperationStatus__c, Service_StartDate__c, Service_EndDate__c
      FROM Contract__c
      WHERE Account__r.Name LIKE '%${escaped}%'
      ORDER BY ContractDateStart__c DESC
      LIMIT 20
    `.replace(/\s+/g, ' ').trim();

    const result = await soqlQuery(instanceUrl, accessToken, query);
    const records = result.records || [];

    if (records.length === 0) {
      return `"${keyword}" 관련 계약 정보를 찾을 수 없습니다.`;
    }

    let msg = `📋 *"${keyword}" 계약 정보* (${records.length}건)\n\n`;
    msg += '```\n';
    records.forEach(r => {
      const amount = r.TotalAmount__c ? `${(r.TotalAmount__c / 10000).toFixed(0)}만원` : '-';
      const tablets = r.TotalTablet__c ? `${r.TotalTablet__c}대` : '-';
      // 계약명에서 지점명 추출 또는 영업기회명 사용
      const branchName = r.Opportunity__r?.Name || r.Name || r.Account__r?.Name;
      msg += `• ${branchName}\n`;
      msg += `  유형: ${r.ContractType__c || '-'} / 상태: ${r.ContractStatus__c || '-'}\n`;
      msg += `  기간: ${r.ContractDateStart__c || '?'} ~ ${r.ContractDateEnd__c || '?'}\n`;
      msg += `  금액: ${amount} / 태블릿: ${tablets} / 납부: ${r.PaymentType__c || '-'}\n\n`;
    });
    msg += '```\n';

    return msg;
  },
  {
    name: 'contract',
    description:
      '매장/파트너사의 계약 정보를 조회합니다. 계약 현황, 계약 만료, 재계약, 계약유형 등의 질문에 사용합니다. ' +
      '"OO 계약", "OO 계약 만료일", "OO 재계약", "OO 계약 현황" 등의 질문에 사용합니다. ' +
      '조회 필드 - Contract__c: Name(계약명), Account__r.Name(상호), ' +
      'ContractType__c(계약유형: 신규/재계약(HW)/재계약(SW)/재계약(AS)/양도양수/추가), ' +
      'ContractStatus__c(계약상태: 계약서명완료/계약만료/요청취소/계약해지/양도양수), ' +
      'ContractDateStart__c(계약시작일), ContractDateEnd__c(계약만료일), ' +
      'TotalAmount__c(총 약정금액), TotalTablet__c(최종 총 태블릿대수), PaymentType__c(납부방법)',
    schema: z.object({
      keyword: z.string().describe('검색할 매장명 또는 파트너사명'),
    }),
  }
);

module.exports = { contractTool };
