/**
 * 담당자 활동 조회 (팀장용)
 * - 미팅 일정
 * - 영업기회 터치 (최근 수정)
 * - 매장 이슈 (Slack)
 */
const { getSalesforceToken, soqlQuery } = require('./salesforce');
const { searchSlackMessages } = require('./search-slack');

/**
 * 날짜 필터 (SOQL용)
 */
function getDateFilter(dateStr, field = 'ActivityDate') {
  if (!dateStr || dateStr === 'today') return `${field} = TODAY`;
  if (dateStr === 'this_week') return `${field} = THIS_WEEK`;
  if (dateStr === 'this_month') return `${field} = THIS_MONTH`;
  if (dateStr === 'yesterday') return `${field} = YESTERDAY`;
  return `${field} = TODAY`;
}

function getModifiedDateFilter(dateStr) {
  if (!dateStr || dateStr === 'today') return 'LastModifiedDate = TODAY';
  if (dateStr === 'this_week') return 'LastModifiedDate = THIS_WEEK';
  if (dateStr === 'this_month') return 'LastModifiedDate = THIS_MONTH';
  if (dateStr === 'yesterday') return 'LastModifiedDate = YESTERDAY';
  return 'LastModifiedDate = TODAY';
}

function getDateLabel(dateStr) {
  if (!dateStr || dateStr === 'today') return '오늘';
  if (dateStr === 'this_week') return '이번 주';
  if (dateStr === 'this_month') return '이번 달';
  if (dateStr === 'yesterday') return '어제';
  return dateStr;
}

/**
 * 이름으로 SF User 찾기
 */
async function findUserByName(instanceUrl, accessToken, name) {
  // SOQL Injection 방지
  const safeName = name.replace(/['"\\]/g, '');
  const query = `
    SELECT Id, Name, Email FROM User
    WHERE Name LIKE '%${safeName}%' AND IsActive = true
    LIMIT 1
  `.replace(/\s+/g, ' ').trim();

  const result = await soqlQuery(instanceUrl, accessToken, query);
  return result.records?.[0] || null;
}

/**
 * Slack 사용자 ID로 SF User 찾기
 */
async function findUserBySlackId(instanceUrl, accessToken, slackUserId) {
  // SOQL Injection 방지
  const safeId = slackUserId.replace(/['"\\]/g, '');
  const query = `
    SELECT Id, Name, Email FROM User
    WHERE SlackMemberID__c = '${safeId}' AND IsActive = true
    LIMIT 1
  `.replace(/\s+/g, ' ').trim();

  const result = await soqlQuery(instanceUrl, accessToken, query);
  return result.records?.[0] || null;
}

/**
 * 담당자 미팅 조회
 */
async function getMeetings(instanceUrl, accessToken, ownerId, dateStr) {
  const dateFilter = getDateFilter(dateStr);
  const query = `
    SELECT Subject, ActivityDate, StartDateTime, EndDateTime, Type, Account.Name, Who.Name
    FROM Event
    WHERE OwnerId = '${ownerId}' AND ${dateFilter}
    ORDER BY StartDateTime ASC
    LIMIT 20
  `.replace(/\s+/g, ' ').trim();

  const result = await soqlQuery(instanceUrl, accessToken, query);
  return result.records || [];
}

/**
 * 담당자 영업기회 터치 (최근 수정)
 */
async function getOpportunityTouches(instanceUrl, accessToken, ownerId, dateStr) {
  const dateFilter = getModifiedDateFilter(dateStr);
  const query = `
    SELECT Id, Name, StageName, Amount, Account.Name, LastModifiedDate, Description
    FROM Opportunity
    WHERE OwnerId = '${ownerId}' AND ${dateFilter}
    ORDER BY LastModifiedDate DESC
    LIMIT 10
  `.replace(/\s+/g, ' ').trim();

  const result = await soqlQuery(instanceUrl, accessToken, query);
  return result.records || [];
}

/**
 * 담당자 Lead 터치 (최근 수정)
 */
async function getLeadTouches(instanceUrl, accessToken, ownerId, dateStr) {
  const dateFilter = getModifiedDateFilter(dateStr);
  const query = `
    SELECT Id, Name, Company, Status, LastModifiedDate
    FROM Lead
    WHERE OwnerId = '${ownerId}' AND ${dateFilter} AND IsConverted = false
    ORDER BY LastModifiedDate DESC
    LIMIT 10
  `.replace(/\s+/g, ' ').trim();

  const result = await soqlQuery(instanceUrl, accessToken, query);
  return result.records || [];
}

/**
 * 담당자 활동 통합 조회
 */
async function getActivitySummary(userName, dateStr, slackUserId) {
  const { accessToken, instanceUrl } = await getSalesforceToken();

  let user;
  if (userName === 'me') {
    user = await findUserBySlackId(instanceUrl, accessToken, slackUserId);
    if (!user) return { error: 'SF 계정을 찾을 수 없습니다.' };
  } else {
    user = await findUserByName(instanceUrl, accessToken, userName);
    if (!user) return { error: `"${userName}" 유저를 찾을 수 없습니다.` };
  }

  const dateLabel = getDateLabel(dateStr);

  // 병렬 조회
  const [meetings, opportunities, leads] = await Promise.all([
    getMeetings(instanceUrl, accessToken, user.Id, dateStr),
    getOpportunityTouches(instanceUrl, accessToken, user.Id, dateStr),
    getLeadTouches(instanceUrl, accessToken, user.Id, dateStr),
  ]);

  // Slack에서 담당자 이름으로 관련 대화 검색 (이슈 파악용)
  let slackMessages = [];
  try {
    slackMessages = await searchSlackMessages(user.Name);
    // 최근 메시지만 (날짜 필터가 어려우므로 최근 10개)
    slackMessages = slackMessages.slice(0, 10);
  } catch (err) {
    console.error('[Slack 검색 에러]', err.message);
  }

  return {
    user: {
      id: user.Id,
      name: user.Name,
      email: user.Email,
    },
    dateLabel,
    meetings,
    opportunities,
    leads,
    slackMessages,
    summary: {
      meetingCount: meetings.length,
      oppCount: opportunities.length,
      leadCount: leads.length,
      slackCount: slackMessages.length,
    },
  };
}

/**
 * 활동 결과 포맷팅
 */
function formatActivitySummary(data) {
  const { user, dateLabel, meetings, opportunities, leads, slackMessages, summary } = data;

  let msg = `📊 *${user.name}님의 ${dateLabel} 활동 현황*\n\n`;

  // 요약
  msg += `• 미팅: ${summary.meetingCount}건\n`;
  msg += `• 영업기회 터치: ${summary.oppCount}건\n`;
  msg += `• Lead 터치: ${summary.leadCount}건\n`;
  if (summary.slackCount > 0) {
    msg += `• Slack 언급: ${summary.slackCount}건\n`;
  }
  msg += '\n';

  // 미팅 상세
  if (meetings.length > 0) {
    msg += `📅 *미팅 일정*\n`;
    meetings.forEach(m => {
      const time = m.StartDateTime ? new Date(m.StartDateTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
      const account = m.Account?.Name || m.Who?.Name || '';
      msg += `• ${time} ${m.Subject || '(제목 없음)'}`;
      if (account) msg += ` - ${account}`;
      msg += '\n';
    });
    msg += '\n';
  }

  // 영업기회 터치
  if (opportunities.length > 0) {
    msg += `💰 *영업기회 터치*\n`;
    opportunities.forEach(o => {
      const account = o.Account?.Name || '';
      const amount = o.Amount ? `${(o.Amount / 10000).toFixed(0)}만원` : '';
      msg += `• ${o.Name} (${o.StageName})`;
      if (account) msg += ` - ${account}`;
      if (amount) msg += ` [${amount}]`;
      msg += '\n';
    });
    msg += '\n';
  }

  // Lead 터치
  if (leads.length > 0) {
    msg += `👤 *Lead 터치*\n`;
    leads.forEach(l => {
      msg += `• ${l.Company || l.Name} (${l.Status})\n`;
    });
    msg += '\n';
  }

  // Slack 이슈 (있으면)
  if (slackMessages.length > 0) {
    msg += `💬 *최근 Slack 언급*\n`;
    slackMessages.slice(0, 5).forEach(m => {
      const preview = (m.text || '').slice(0, 50).replace(/\n/g, ' ');
      msg += `• ${preview}${m.text?.length > 50 ? '...' : ''}\n`;
    });

    // 원본 링크
    const links = slackMessages.slice(0, 3)
      .filter(m => m.permalink)
      .map((m, i) => `<${m.permalink}|${i + 1}>`)
      .join(' | ');
    if (links) msg += `🔗 ${links}\n`;
  }

  return msg;
}

module.exports = { getActivitySummary, formatActivitySummary };
