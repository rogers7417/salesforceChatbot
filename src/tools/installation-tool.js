/**
 * LangChain Tool: 설치 정보 조회
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

// 날짜 필터 변환
function getDateFilter(dateStr) {
  if (!dateStr) return null;
  if (dateStr === 'today') return 'InstallationDate__c = TODAY';
  if (dateStr === 'tomorrow') return 'InstallationDate__c = TOMORROW';
  if (dateStr === 'this_week') return 'InstallationDate__c = THIS_WEEK';
  if (dateStr === 'this_month') return 'InstallationDate__c = THIS_MONTH';
  if (dateStr === 'yesterday') return 'InstallationDate__c = YESTERDAY';
  if (dateStr === 'last_week') return 'InstallationDate__c = LAST_WEEK';
  if (dateStr === 'next_week') return 'InstallationDate__c = NEXT_WEEK';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return `InstallationDate__c = ${dateStr}`;
  return null;
}

function getDateLabel(dateStr) {
  if (!dateStr || dateStr === 'today') return '오늘';
  if (dateStr === 'tomorrow') return '내일';
  if (dateStr === 'this_week') return '이번 주';
  if (dateStr === 'this_month') return '이번 달';
  if (dateStr === 'yesterday') return '어제';
  if (dateStr === 'last_week') return '지난 주';
  if (dateStr === 'next_week') return '다음 주';
  return dateStr;
}

const installationTool = tool(
  async ({ keyword, date, serviceTerritory }) => {
    const { accessToken, instanceUrl } = await getSalesforceToken();

    // WHERE 조건 구성
    const conditions = [];

    if (keyword) {
      const escaped = escapeSoqlString(keyword);
      conditions.push(`Account__r.Name LIKE '%${escaped}%'`);
    }

    if (date) {
      const dateFilter = getDateFilter(date);
      if (dateFilter) conditions.push(dateFilter);
    }

    if (serviceTerritory) {
      const escaped = escapeSoqlString(serviceTerritory);
      conditions.push(`ServiceTerritory__r.Name LIKE '%${escaped}%'`);
    }

    if (conditions.length === 0) {
      // 조건 없으면 오늘 설치 건 조회
      conditions.push('InstallationDate__c = TODAY');
    }

    const whereClause = conditions.join(' AND ');
    const query = `
      SELECT Name, Account__r.Name, InstallationDate__c, InstallationType__c,
             InstallationStage__c, InstallationStatus__c, Owner.Name,
             ServiceTerritory__r.Name, NumbeofTablets__c, CompletedDate__c,
             Opportunity__r.Name
      FROM Installation__c
      WHERE ${whereClause}
      ORDER BY InstallationDate__c DESC
      LIMIT 30
    `.replace(/\s+/g, ' ').trim();

    const result = await soqlQuery(instanceUrl, accessToken, query);
    const records = result.records || [];

    const label = keyword || (date ? getDateLabel(date) : '오늘');

    if (records.length === 0) {
      return `"${label}" 관련 설치 정보가 없습니다.`;
    }

    let msg = `🔧 *"${label}" 설치 현황* (${records.length}건)\n\n`;
    msg += '```\n';
    records.forEach(r => {
      const tablets = r.NumbeofTablets__c ? `${r.NumbeofTablets__c}대` : '-';
      msg += `• ${r.Account__r?.Name || r.Name}\n`;
      msg += `  유형: ${r.InstallationType__c || '-'} / 진행: ${r.InstallationStage__c || '-'} / 상태: ${r.InstallationStatus__c || '-'}\n`;
      msg += `  설치일: ${r.InstallationDate__c || '-'} / 완료: ${r.CompletedDate__c || '-'} / ${tablets}\n`;
      msg += `  담당: ${r.Owner?.Name || '-'} / 설치업체: ${r.ServiceTerritory__r?.Name || '-'}\n\n`;
    });
    msg += '```\n';

    return msg;
  },
  {
    name: 'installation',
    description:
      '설치 일정, 설치 현황, 설치 담당 업체를 조회합니다. ' +
      '"오늘 설치", "누가 설치해?", "준테크코리아 설치 건", "OO 매장 설치 현황", "이번주 설치 일정" 등의 질문에 사용합니다. ' +
      'keyword(매장명), date(날짜), serviceTerritory(설치업체) 중 하나 이상을 지정하세요. 모두 미지정 시 오늘 설치 건을 조회합니다. ' +
      '조회 필드 - Installation__c: Name(설치번호), Account__r.Name(상호), ' +
      'InstallationDate__c(설치 요청일자), InstallationType__c(설치 유형), ' +
      'InstallationStage__c(진행 상태), InstallationStatus__c(방문 진행상태), ' +
      'Owner.Name(담당자), ServiceTerritory__r.Name(설치 업체), ' +
      'NumbeofTablets__c(태블릿 수), CompletedDate__c(설치완료일), Opportunity__r.Name(영업기회)',
    schema: z.object({
      keyword: z
        .string()
        .optional()
        .describe('검색할 매장명'),
      date: z
        .string()
        .optional()
        .describe('날짜 필터. today, tomorrow, yesterday, this_week, this_month, next_week, last_week 또는 YYYY-MM-DD 형식'),
      serviceTerritory: z
        .string()
        .optional()
        .describe('설치 업체명 (예: 준테크코리아, 현대렌탈케어). 특정 설치 업체의 건만 조회할 때 사용'),
    }),
  }
);

module.exports = { installationTool };
