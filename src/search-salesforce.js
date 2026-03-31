/**
 * Salesforce 검색: 업체명으로 Lead + Opportunity + Account 조회
 */
const { getSalesforceToken, soqlQuery } = require('./salesforce');

// 괄호 제거 → 핵심 키워드만 추출
function cleanKeyword(keyword) {
  return keyword.replace(/[()（）\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * 매장 후보 검색 (Account 기준, 소유자 필터)
 * 선택지를 보여주기 위한 간단 검색
 */
async function searchAccounts(keyword, sfUserId) {
  const { accessToken, instanceUrl } = await getSalesforceToken();

  const ownerFilter = sfUserId ? ` AND OwnerId = '${sfUserId}'` : '';
  const query = `
    SELECT Id, Name, Owner.Name, Phone, CreatedDate
    FROM Account
    WHERE Name LIKE '%${cleanKeyword(keyword)}%'${ownerFilter}
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

  const ownerFilter = sfUserId ? ` AND OwnerId = '${sfUserId}'` : '';

  const leadQuery = `
    SELECT Id, Name, Company, Status, Owner.Name, CreatedDate, Phone, Email
    FROM Lead
    WHERE (Company LIKE '%${cleanKeyword(accountName)}%' OR Name LIKE '%${cleanKeyword(accountName)}%')${ownerFilter}
    ORDER BY CreatedDate DESC
    LIMIT 10
  `.replace(/\s+/g, ' ').trim();

  const oppQuery = `
    SELECT Id, Name, StageName, Amount, CloseDate, Owner.Name, Account.Name, CreatedDate
    FROM Opportunity
    WHERE (Name LIKE '%${cleanKeyword(accountName)}%' OR Account.Name LIKE '%${cleanKeyword(accountName)}%')${ownerFilter}
    ORDER BY CreatedDate DESC
    LIMIT 10
  `.replace(/\s+/g, ' ').trim();

  const accQuery = `
    SELECT Id, Name, Owner.Name, Phone, CreatedDate
    FROM Account
    WHERE Name LIKE '%${cleanKeyword(accountName)}%'${ownerFilter}
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
