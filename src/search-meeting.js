/**
 * 미팅/이벤트 조회 (SF Event + Google Calendar)
 */
const { getSalesforceToken, soqlQuery } = require('./salesforce');

// SOQL 문자열 이스케이프 (Injection 방지)
function escapeSoqlString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Slack ID 형식 검증
function isValidSlackId(id) {
  return id && /^[UW][A-Z0-9]{8,}$/.test(id);
}

// Salesforce ID 유효성 검증
function isValidSalesforceId(id) {
  if (!id) return false;
  return /^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$/.test(id);
}

/**
 * 날짜 조건 변환 (SOQL용)
 */
function getDateFilter(dateStr) {
  if (!dateStr || dateStr === 'today') return 'ActivityDate = TODAY';
  if (dateStr === 'this_week') return 'ActivityDate = THIS_WEEK';
  if (dateStr === 'this_month') return 'ActivityDate = THIS_MONTH';
  if (dateStr === 'next_week') return 'ActivityDate = NEXT_WEEK';
  if (dateStr === 'next_month') return 'ActivityDate = NEXT_MONTH';
  if (dateStr === 'last_week') return 'ActivityDate = LAST_WEEK';
  if (dateStr === 'last_month') return 'ActivityDate = LAST_MONTH';
  if (dateStr === 'yesterday') return 'ActivityDate = YESTERDAY';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return `ActivityDate = ${dateStr}`;
  return 'ActivityDate = TODAY';
}

function getDateLabel(dateStr) {
  if (!dateStr || dateStr === 'today') return '오늘';
  if (dateStr === 'this_week') return '이번 주';
  if (dateStr === 'this_month') return '이번 달';
  if (dateStr === 'next_week') return '다음 주';
  if (dateStr === 'next_month') return '다음 달';
  if (dateStr === 'last_week') return '지난 주';
  if (dateStr === 'last_month') return '지난 달';
  if (dateStr === 'yesterday') return '어제';
  return dateStr;
}

/**
 * 날짜 범위 계산 (Google Calendar용, KST)
 */
function getDateRange(dateStr) {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600000);
  const today = kst.toISOString().slice(0, 10);

  let start, end;

  if (!dateStr || dateStr === 'today') {
    start = `${today}T00:00:00`;
    end = `${today}T23:59:59`;
  } else if (dateStr === 'yesterday') {
    const d = new Date(kst); d.setDate(d.getDate() - 1);
    const ds = d.toISOString().slice(0, 10);
    start = `${ds}T00:00:00`;
    end = `${ds}T23:59:59`;
  } else if (dateStr === 'this_week') {
    const day = kst.getDay();
    const mon = new Date(kst); mon.setDate(mon.getDate() - (day === 0 ? 6 : day - 1));
    const sun = new Date(mon); sun.setDate(sun.getDate() + 6);
    start = `${mon.toISOString().slice(0, 10)}T00:00:00`;
    end = `${sun.toISOString().slice(0, 10)}T23:59:59`;
  } else if (dateStr === 'this_month') {
    const ym = today.slice(0, 7);
    start = `${ym}-01T00:00:00`;
    const lastDay = new Date(kst.getFullYear(), kst.getMonth() + 1, 0).getDate();
    end = `${ym}-${String(lastDay).padStart(2, '0')}T23:59:59`;
  } else if (dateStr === 'next_week') {
    const day = kst.getDay();
    const nextMon = new Date(kst); nextMon.setDate(nextMon.getDate() + (8 - (day === 0 ? 7 : day)));
    const nextSun = new Date(nextMon); nextSun.setDate(nextSun.getDate() + 6);
    start = `${nextMon.toISOString().slice(0, 10)}T00:00:00`;
    end = `${nextSun.toISOString().slice(0, 10)}T23:59:59`;
  } else if (dateStr === 'next_month') {
    const y = kst.getMonth() === 11 ? kst.getFullYear() + 1 : kst.getFullYear();
    const m = kst.getMonth() === 11 ? 0 : kst.getMonth() + 1;
    const lastDay = new Date(y, m + 1, 0).getDate();
    start = `${y}-${String(m + 1).padStart(2, '0')}-01T00:00:00`;
    end = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59`;
  } else if (dateStr === 'last_week') {
    const day = kst.getDay();
    const lastMon = new Date(kst); lastMon.setDate(lastMon.getDate() - (day === 0 ? 13 : day + 6));
    const lastSun = new Date(lastMon); lastSun.setDate(lastSun.getDate() + 6);
    start = `${lastMon.toISOString().slice(0, 10)}T00:00:00`;
    end = `${lastSun.toISOString().slice(0, 10)}T23:59:59`;
  } else if (dateStr === 'last_month') {
    const y = kst.getMonth() === 0 ? kst.getFullYear() - 1 : kst.getFullYear();
    const m = kst.getMonth() === 0 ? 11 : kst.getMonth() - 1;
    const lastDay = new Date(y, m + 1, 0).getDate();
    start = `${y}-${String(m + 1).padStart(2, '0')}-01T00:00:00`;
    end = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59`;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    start = `${dateStr}T00:00:00`;
    end = `${dateStr}T23:59:59`;
  } else {
    start = `${today}T00:00:00`;
    end = `${today}T23:59:59`;
  }

  return { start, end };
}

/**
 * 이름으로 SF User 찾기 (이메일 포함)
 */
async function findUserByName(name) {
  const { accessToken, instanceUrl } = await getSalesforceToken();
  const escapedName = escapeSoqlString(name);
  const query = `
    SELECT Id, Name, Email FROM User
    WHERE Name LIKE '%${escapedName}%' AND IsActive = true
    LIMIT 1
  `.replace(/\s+/g, ' ').trim();

  const result = await soqlQuery(instanceUrl, accessToken, query);
  return result.records?.[0] || null;
}

/**
 * 미팅/이벤트 조회 (SF + Google Calendar)
 */
async function getMeetings(userName, dateStr, slackUserId) {
  const { accessToken, instanceUrl } = await getSalesforceToken();

  let ownerId;
  let displayName;
  let email;

  if (userName === 'me') {
    // Slack ID 검증
    if (!isValidSlackId(slackUserId)) {
      return { error: 'Slack ID가 유효하지 않습니다.' };
    }
    const userQuery = `
      SELECT Id, Name, Email FROM User WHERE SlackMemberID__c = '${slackUserId}' AND IsActive = true LIMIT 1
    `.replace(/\s+/g, ' ').trim();
    const userResult = await soqlQuery(instanceUrl, accessToken, userQuery);
    const user = userResult.records?.[0];
    if (!user) return { error: 'SF 계정을 찾을 수 없습니다.' };
    ownerId = user.Id;
    displayName = user.Name;
    email = user.Email;
  } else {
    const user = await findUserByName(userName);
    if (!user) return { error: `"${userName}" 유저를 찾을 수 없습니다.` };
    ownerId = user.Id;
    displayName = user.Name;
    email = user.Email;
  }

  // Owner ID 검증
  if (!isValidSalesforceId(ownerId)) {
    return { error: 'SF User ID가 유효하지 않습니다.' };
  }

  const dateFilter = getDateFilter(dateStr);
  const dateLabel = getDateLabel(dateStr);
  const dateRange = getDateRange(dateStr);

  // SF Event 조회
  const query = `
    SELECT Subject, ActivityDate, StartDateTime, EndDateTime, Type, Account.Name, Who.Name
    FROM Event
    WHERE OwnerId = '${ownerId}' AND ${dateFilter}
    ORDER BY StartDateTime ASC
  `.replace(/\s+/g, ' ').trim();

  const result = await soqlQuery(instanceUrl, accessToken, query);
  const events = result.records || [];

  return {
    name: displayName,
    email,
    dateLabel,
    dateRange,
    events,
    totalCount: events.length,
  };
}

module.exports = { getMeetings, getDateRange };
