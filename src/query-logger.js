/**
 * 질문 로그 수집
 * 모든 질문을 기록해서 자주 오는 패턴 파악
 */
const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_PATH, 'queries.jsonl');

// 로그 디렉토리 생성
if (!fs.existsSync(LOG_PATH)) fs.mkdirSync(LOG_PATH, { recursive: true });

function logQuery({ userId, userName, text, intent, success, error, queries }) {
  const entry = {
    ts: new Date().toISOString(),
    userId,
    userName: userName || null,
    text,
    intent,
    success,
    error: error || null,
    queries: queries || null,
  };

  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
}

/**
 * 로그 요약 (자주 오는 질문 패턴 분석)
 */
function getLogSummary(days = 7) {
  if (!fs.existsSync(LOG_FILE)) return { total: 0, byIntent: {}, topQuestions: [], failedQuestions: [] };

  const lines = fs.readFileSync(LOG_FILE, 'utf-8').trim().split('\n').filter(l => l);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const recent = lines
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(e => e && e.ts >= cutoff);

  // 의도별 집계
  const byIntent = {};
  recent.forEach(e => {
    byIntent[e.intent] = (byIntent[e.intent] || 0) + 1;
  });

  // 실패한 질문
  const failedQuestions = recent
    .filter(e => !e.success)
    .map(e => ({ text: e.text, intent: e.intent, error: e.error }));

  // 자주 오는 질문 (유사 질문 그룹핑은 간단히 텍스트 기준)
  const questionCounts = {};
  recent.forEach(e => {
    const key = e.text.toLowerCase().replace(/\s+/g, ' ').trim();
    questionCounts[key] = (questionCounts[key] || 0) + 1;
  });

  const topQuestions = Object.entries(questionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([text, count]) => ({ text, count }));

  return {
    total: recent.length,
    byIntent,
    topQuestions,
    failedQuestions,
  };
}

module.exports = { logQuery, getLogSummary };
