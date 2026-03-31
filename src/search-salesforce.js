/**
 * Salesforce 검색: 업체명으로 Lead + Opportunity + Account 조회
 */
const { getSalesforceToken, soqlQuery } = require('./salesforce');

// SOQL 문자열 이스케이프 (Injection 방지)
function escapeSoqlString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')     // 백슬래시 이스케이프
    .replace(/'/g, "\\'")        // 싱글쿼트 이스케이프
    .replace(/[()（）\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Salesforce ID 유효성 검증 (15자 또는 18자 알파뉴메릭)
function isValidSalesforceId(id) {
  if (!id) return false;
  return /^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$/.test(id);
}

/**
 * 매장 후보 검색 (Account 기준, 소유자 필터)
 * 선택지를 보여주기 위한 간단 검색
 */
async function searchAccounts(keyword, sfUserId) {
  const { accessToken, instanceUrl } = await getSalesforceToken();

  // ID 유효성 검증
  const ownerFilter = (sfUserId && isValidSalesforceId(sfUserId))
    ? ` AND OwnerId = '${sfUserId}'`
    : '';
  const query = `
    SELECT Id, Name, Owner.Name, Phone, CreatedDate
    FROM Account
    WHERE Name LIKE '%${escapeSoqlString(keyword)}%'${ownerFilter}
    ORDER BY CreatedDate DESC
    LIMIT 10
  `.replace(/\s+/g, ' ').trim();

  const result = await soqlQuery(instanceUrl, accessToken, query);
  return result.records || [];
}

/**
 * 특정 Account의 상세 정보 (Lead + Opportunity)
 */
async function getAccountDetail(accountName, sfUserId) {
  const { accessToken, instanceUrl } = await getSalesforceToken();

  // ID 유효성 검증
  const ownerFilter = (sfUserId && isValidSalesforceId(sfUserId))
    ? ` AND OwnerId = '${sfUserId}'`
    : '';
  const escapedName = escapeSoqlString(accountName);

  const leadQuery = `
    SELECT Id, Name, Company, Status, Owner.Name, CreatedDate, Phone, Email
    FROM Lead
    WHERE (Company LIKE '%${escapedName}%' OR Name LIKE '%${escapedName}%')${ownerFilter}
    ORDER BY CreatedDate DESC
    LIMIT 10
  `.replace(/\s+/g, ' ').trim();

  const oppQuery = `
    SELECT Id, Name, StageName, Amount, CloseDate, Owner.Name, Account.Name, CreatedDate
    FROM Opportunity
    WHERE (Name LIKE '%${escapedName}%' OR Account.Name LIKE '%${escapedName}%')${ownerFilter}
    ORDER BY CreatedDate DESC
    LIMIT 10
  `.replace(/\s+/g, ' ').trim();

  const accQuery = `
    SELECT Id, Name, Owner.Name, Phone, CreatedDate
    FROM Account
    WHERE Name LIKE '%${escapedName}%'${ownerFilter}
    LIMIT 5
  `.replace(/\s+/g, ' ').trim();

  const [leads, opps, accounts] = await Promise.all([
    soqlQuery(instanceUrl, accessToken, leadQuery),
    soqlQuery(instanceUrl, accessToken, oppQuery),
    soqlQuery(instanceUrl, accessToken, accQuery),
  ]);

  return {
    leads: leads.records || [],
    opportunities: opps.records || [],
    accounts: accounts.records || [],
  };
}

/**
 * 키워드로 전체 검색 (소유자 필터 적용)
 */
async function searchByKeyword(keyword, sfUserId) {
  return getAccountDetail(keyword, sfUserId);
}

/**
 * 내 계류 Lead + 진행 중 영업기회 조회
 */
async function getMyTodos(sfUserId) {
  // ID 유효성 검증 필수
  if (!isValidSalesforceId(sfUserId)) {
    return { leads: [], opportunities: [] };
  }

  const { accessToken, instanceUrl } = await getSalesforceToken();

  const leadQuery = `
    SELECT Id, Name, Company, Status, CreatedDate, Phone
    FROM Lead
    WHERE OwnerId = '${sfUserId}'
      AND IsConverted = false
      AND Status NOT IN ('Closed', 'Disqualified', 'Converted')
    ORDER BY CreatedDate DESC
    LIMIT 15
  `.replace(/\s+/g, ' ').trim();

  const oppQuery = `
    SELECT Id, Name, StageName, Amount, CloseDate, Account.Name
    FROM Opportunity
    WHERE OwnerId = '${sfUserId}'
      AND IsClosed = false
    ORDER BY CloseDate ASC
    LIMIT 15
  `.replace(/\s+/g, ' ').trim();

  const [leads, opps] = await Promise.all([
    soqlQuery(instanceUrl, accessToken, leadQuery),
    soqlQuery(instanceUrl, accessToken, oppQuery),
  ]);

  return {
    leads: leads.records || [],
    opportunities: opps.records || [],
  };
}

/**
 * Slack ID → SF User ID 조회
 */
async function findUserBySlackId(slackId) {
  // Slack ID 형식 검증 (U로 시작하는 알파뉴메릭)
  if (!slackId || !/^[UW][A-Z0-9]{8,}$/.test(slackId)) {
    return null;
  }

  const { accessToken, instanceUrl } = await getSalesforceToken();
  const query = `
    SELECT Id, Name, SlackMemberID__c
    FROM User
    WHERE SlackMemberID__c = '${slackId}' AND IsActive = true
    LIMIT 1
  `.replace(/\s+/g, ' ').trim();

  const result = await soqlQuery(instanceUrl, accessToken, query);
  return result.records?.[0] || null;
}

module.exports = { searchAccounts, getAccountDetail, searchByKeyword, getMyTodos, findUserBySlackId };
