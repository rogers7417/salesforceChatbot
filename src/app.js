#!/usr/bin/env node
/**
 * Sales Chatbot - Slack Bot (Socket Mode)
 *
 * 기능:
 * 1. "오늘 뭐해?" → 내 Lead + 영업기회 조회
 * 2. 업체명 검색 → 여러 건이면 선택지 → 상세 조회 + AI 요약
 */
require('dotenv').config();

const { App } = require('@slack/bolt');
const { classifyIntent } = require('./intent');
const { searchAccounts, searchByKeyword, getMyTodos, findUserBySlackId } = require('./search-salesforce');
const { searchSlackMessages } = require('./search-slack');
const { getBrandSummary } = require('./search-brand');
const { getMeetings } = require('./search-meeting');
const { getActivitySummary, formatActivitySummary } = require('./search-activity');
const { generateAndExecute, summarizeResults } = require('./soql-generator');
const { summarize } = require('./summarize');
const { logQuery } = require('./query-logger');
const { formatMyTodos, formatSearchResult, formatAccountList, formatBrandSummary, formatMeetings } = require('./format');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// 사용자별 세션 (선택 대기 + 대화 히스토리)
const sessions = {};

const MAX_HISTORY = 6;        // 최대 대화 히스토리 (질문+답변 3쌍)
const SESSION_TTL = 30 * 60 * 1000; // 30분 후 세션 만료

function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = { history: [], accounts: null, lastActive: Date.now() };
  }
  sessions[userId].lastActive = Date.now();
  return sessions[userId];
}

function addHistory(userId, role, content) {
  const session = getSession(userId);
  session.history.push({ role, content: content.slice(0, 500) }); // 500자 제한
  if (session.history.length > MAX_HISTORY) {
    session.history = session.history.slice(-MAX_HISTORY);
  }
}

// 오래된 세션 정리 (5분마다)
setInterval(() => {
  const now = Date.now();
  Object.keys(sessions).forEach(uid => {
    if (now - sessions[uid].lastActive > SESSION_TTL) {
      delete sessions[uid];
    }
  });
}, 5 * 60 * 1000);

// DM 메시지 수신
app.message(async ({ message, say }) => {
  if (message.bot_id || message.subtype) return;

  const text = (message.text || '').trim();
  if (!text) return;

  const userId = message.user;
  console.log(`[메시지] user=${userId} text="${text}"`);

  try {
    // SF 유저 조회
    const sfUser = await findUserBySlackId(userId);
    const sfUserId = sfUser?.Id || null;

    const session = getSession(userId);

    // 세션에 선택 대기 중인 경우 숫자 입력 체크
    // /log 명령어 — 질문 로그 요약
    if (text === '/log' || text === '/logs') {
      const { getLogSummary } = require('./query-logger');
      const summary = getLogSummary(7);
      let msg = `📊 *최근 7일 질문 로그*\n\n`;
      msg += `총 질문: ${summary.total}건\n\n`;
      msg += `*의도별 분류*\n\`\`\`\n`;
      Object.entries(summary.byIntent).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
        msg += `${k}: ${v}건\n`;
      });
      msg += `\`\`\`\n\n`;
      msg += `*자주 오는 질문 Top 10*\n\`\`\`\n`;
      summary.topQuestions.slice(0, 10).forEach((q, i) => {
        msg += `${i + 1}. "${q.text}" (${q.count}회)\n`;
      });
      msg += `\`\`\`\n`;
      if (summary.failedQuestions.length > 0) {
        msg += `\n*실패한 질문* (${summary.failedQuestions.length}건)\n\`\`\`\n`;
        summary.failedQuestions.slice(0, 5).forEach(q => {
          msg += `"${q.text}" → ${q.error || 'unknown'}\n`;
        });
        msg += `\`\`\`\n`;
      }
      await say(msg);
      return;
    }

    if (session.accounts) {
      const num = parseInt(text);
      if (!isNaN(num) && num >= 1 && num <= session.accounts.length) {
        const selected = session.accounts[num - 1];
        session.accounts = null;
        await handleDetailSearch(selected.Name, null, say);
        return;
      }
      session.accounts = null;
    }

    // Haiku 의도 분류
    const intent = await classifyIntent(text);

    // 모든 질문 로깅
    const logBase = { userId, userName: sfUser?.Name, text, intent: intent.intent };

    try {
      if (intent.intent === 'todo') {
        await handleTodo(sfUser, say);
        logQuery({ ...logBase, success: true });
      } else if (intent.intent === 'search') {
        await handleSearch(intent.keyword || text, sfUserId, userId, say);
        logQuery({ ...logBase, success: true });
      } else if (intent.intent === 'brand') {
        await handleBrand(intent.keyword || text, say);
        logQuery({ ...logBase, success: true });
      } else if (intent.intent === 'meeting') {
        const names = intent.names || [intent.name || 'me'];
        await handleMeetings(names, intent.date || 'today', userId, say);
        logQuery({ ...logBase, success: true });
      } else if (intent.intent === 'activity') {
        await handleActivity(intent.name || 'me', intent.date || 'today', userId, say);
        logQuery({ ...logBase, success: true });
      } else if (intent.intent === 'query') {
        await handleQuery(text, userId, say);
        logQuery({ ...logBase, success: true });
      } else if (intent.intent === 'select') {
        await say('선택할 검색 결과가 없습니다. 매장명을 먼저 검색해주세요.');
        logQuery({ ...logBase, success: true });
      } else {
        await say('매장명을 입력하면 검색하고, "오늘 뭐해" 같은 말을 하면 할 일을 알려드려요.');
        logQuery({ ...logBase, success: false, error: 'unknown intent' });
      }
    } catch (handleErr) {
      logQuery({ ...logBase, success: false, error: handleErr.message });
      throw handleErr;
    }
  } catch (err) {
    console.error('에러:', err);
    await say(`오류가 발생했습니다: ${err.message}`);
  }
});

async function handleTodo(sfUser, say) {
  if (!sfUser) {
    await say('Salesforce에서 회원님의 계정을 찾을 수 없습니다.\nSalesforce User에 SlackMemberID__c 필드가 설정되어 있는지 확인해주세요.');
    return;
  }
  await say('Salesforce에서 데이터 조회 중...');
  const data = await getMyTodos(sfUser.Id);
  const msg = formatMyTodos(sfUser.Name, data);
  await say(msg);
}

async function handleBrand(keyword, say) {
  await say(`*"${keyword}"* 브랜드 현황 조회 중...`);
  const data = await getBrandSummary(keyword);

  if (data.branchCount === 0) {
    await say(`*"${keyword}"* 브랜드의 출고 내역이 없습니다.`);
    return;
  }

  const result = formatBrandSummary(data);
  await say({ blocks: result.blocks, text: `${keyword} 브랜드 현황` });
}

async function handleQuery(question, userId, say) {
  await say(`🔍 Salesforce 조회 중...`);

  try {
    const session = getSession(userId);

    // 대화 히스토리를 SOQL 생성에 전달
    const queryResults = await generateAndExecute(question, session.history);

    // 히스토리에 질문 추가
    addHistory(userId, 'user', question);

    // 실행한 쿼리 + 결과 요약을 히스토리에 기록 (후속 질문 참조용)
    const queryInfo = queryResults.results.map((r, i) => {
      if (!r.success) return `쿼리${i + 1}: 실패`;
      // 결과 데이터의 핵심 값 (Name, Id 등)을 기록
      const names = r.records.slice(0, 50).map(rec => rec.Name || rec.PartnerName__r?.Name || rec.Company || '').filter(n => n);
      return `쿼리${i + 1} 결과 ${r.totalSize}건: ${names.join(', ')}`;
    }).join('\n');
    addHistory(userId, 'assistant', queryInfo);

    // 에러 체크
    const hasError = queryResults.results.some(r => !r.success);
    const hasData = queryResults.results.some(r => r.success && (r.records.length > 0 || r.totalSize > 0));

    if (hasError && !hasData) {
      const errMsg = '조회 중 오류가 발생했습니다. 질문을 다시 표현해주세요.';
      addHistory(userId, 'assistant', errMsg);
      await say(`❌ ${errMsg}`);
      return;
    }

    if (!hasData) {
      const noDataMsg = '조회 결과가 없습니다.';
      addHistory(userId, 'assistant', noDataMsg);
      await say(noDataMsg);
      return;
    }

    // 결과 요약
    const summary = await summarizeResults(question, queryResults);
    addHistory(userId, 'assistant', summary);
    await say(`💡 *조회 결과*\n\`\`\`\n${summary}\n\`\`\``);
  } catch (err) {
    console.error('[query 에러]', err.message);
    await say(`❌ 오류가 발생했습니다: ${err.message}`);
  }
}

async function handleActivity(name, dateStr, slackUserId, say) {
  await say(`📊 *${name === 'me' ? '내' : name}* 활동 현황 조회 중...`);

  try {
    const data = await getActivitySummary(name, dateStr, slackUserId);

    if (data.error) {
      await say(`❌ ${data.error}`);
      return;
    }

    const msg = formatActivitySummary(data);
    await say(msg);
  } catch (err) {
    console.error('[activity 에러]', err.message);
    await say(`❌ 오류가 발생했습니다: ${err.message}`);
  }
}

async function handleMeetings(names, dateStr, slackUserId, say) {
  await say(`📅 미팅 일정 조회 중... (${names.length}명)`);

  // 병렬 조회
  const results = await Promise.all(
    names.map(name => getMeetings(name, dateStr, slackUserId))
  );

  for (const data of results) {
    if (data.error) {
      await say(`❌ ${data.error}`);
      continue;
    }
    const msg = formatMeetings(data);
    await say(msg);
  }
}

async function handleSearch(keyword, sfUserId, slackUserId, say) {
  await say(`*"${keyword}"* 검색 중...`);

  const hasParentheses = /[()（）]/.test(keyword);

  if (hasParentheses) {
    // 괄호 있으면 → 바로 영업기회/Lead 상세 검색
    await handleDetailSearch(keyword, null, say);
  } else {
    // 괄호 없으면 → Account 검색 → 선택지
    const accounts = await searchAccounts(keyword, null);

    if (accounts.length === 0) {
      // Account 없으면 영업기회/Lead에서 직접 검색
      await handleDetailSearch(keyword, null, say);
    } else if (accounts.length === 1) {
      await handleDetailSearch(accounts[0].Name, null, say);
    } else {
      getSession(slackUserId).accounts = accounts;
      const listMsg = formatAccountList(keyword, accounts);
      await say(listMsg);
    }
  }
}

async function handleDetailSearch(accountName, sfUserId, say) {
  const [sfData, slackMessages] = await Promise.all([
    searchByKeyword(accountName, sfUserId),
    searchSlackMessages(accountName),
  ]);

  console.log(`[상세 검색] ${accountName} → leads=${sfData.leads.length} opps=${sfData.opportunities.length} slack=${slackMessages.length}`);

  const hasData = sfData.leads.length > 0 || sfData.opportunities.length > 0 || sfData.accounts.length > 0 || slackMessages.length > 0;

  if (!hasData) {
    await say(`*"${accountName}"* 에 대한 상세 정보가 없습니다.`);
    return;
  }

  // SF 데이터 포맷
  const rawMsg = formatSearchResult(accountName, sfData, slackMessages);
  await say(rawMsg);

  // Haiku 요약
  if (sfData.leads.length > 0 || sfData.opportunities.length > 0 || slackMessages.length > 0) {
    const summary = await summarize(accountName, sfData, slackMessages);

    const slackSummaryMatch = summary.match(/\[Slack 대화 요약\]([\s\S]*?)(?=\[종합 요약\])/);
    const totalSummaryMatch = summary.match(/\[종합 요약\]([\s\S]*)/);

    // 원본 링크
    const links = slackMessages.slice(0, 5)
      .filter(m => m.permalink)
      .map((m, i) => `<${m.permalink}|${i + 1}>`)
      .join(' | ');
    const linkLine = links ? `\n🔗 원본 바로가기: ${links}` : '';

    if (slackSummaryMatch) {
      await say(`💬 *Slack 대화 요약*\n\`\`\`\n${slackSummaryMatch[1].trim()}\n\`\`\`${linkLine}`);
    }
    if (totalSummaryMatch) {
      await say(`💡 *종합 요약*\n\`\`\`\n${totalSummaryMatch[1].trim()}\n\`\`\``);
    }
    if (!slackSummaryMatch && !totalSummaryMatch) {
      await say(`💡 *AI 요약*\n\`\`\`\n${summary}\n\`\`\`${linkLine}`);
    }
  }
}

// 앱 시작
(async () => {
  await app.start();
  console.log('⚡ Sales Chatbot 실행 중 (Socket Mode)');
})();
