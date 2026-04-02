/**
 * 용어 사전 관리 + 대화 학습
 */
const fs = require('fs');
const path = require('path');

const TERMS_PATH = path.join(__dirname, 'terms.json');

/**
 * 용어 사전 로드
 */
function loadTerms() {
  try {
    return JSON.parse(fs.readFileSync(TERMS_PATH, 'utf-8'));
  } catch {
    return { abbreviations: {}, phrases: {}, learnedAt: new Date().toISOString() };
  }
}

/**
 * 용어 사전 저장
 */
function saveTerms(terms) {
  terms.learnedAt = new Date().toISOString();
  fs.writeFileSync(TERMS_PATH, JSON.stringify(terms, null, 2));
}

/**
 * 약어 추가 ("CL은 Closed Lost야")
 */
function learnTerm(abbr, meaning) {
  const terms = loadTerms();
  const upperAbbr = abbr.toUpperCase();
  terms.abbreviations[upperAbbr] = meaning;
  saveTerms(terms);
  console.log(`[용어 학습] ${upperAbbr} = ${meaning}`);
  return true;
}

/**
 * 문구 추가 ("오인입은 Status='종료' AND LossReason__c='오인입'")
 */
function learnPhrase(phrase, condition) {
  const terms = loadTerms();
  terms.phrases[phrase] = condition;
  saveTerms(terms);
  console.log(`[문구 학습] ${phrase} = ${condition}`);
  return true;
}

/**
 * 텍스트에서 약어를 풀어쓰기로 치환
 */
function expandAbbreviations(text) {
  const terms = loadTerms();
  let expanded = text;

  // 약어 치환 (대소문자 무관)
  for (const [abbr, meaning] of Object.entries(terms.abbreviations)) {
    // 단어 경계에서만 매칭 (예: "CL" 매칭하되 "CLOSE"는 안 함)
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    expanded = expanded.replace(regex, meaning);
  }

  return expanded;
}

/**
 * 학습 요청인지 판단
 * 패턴: "X은 Y야", "X는 Y야", "X = Y", "X이 뭐냐면 Y"
 */
function parseLearnRequest(text) {
  // "CL은 Closed Lost야" / "CL는 Closed Lost"
  const pattern1 = /^([A-Za-z가-힣0-9_]+)[은는이가]\s*(.+?)[야이]?[요]?$/;
  // "CL = Closed Lost"
  const pattern2 = /^([A-Za-z가-힣0-9_]+)\s*[=:]\s*(.+)$/;
  // "CL이 뭐냐면 Closed Lost"
  const pattern3 = /^([A-Za-z가-힣0-9_]+)[이가]?\s*뭐냐면\s*(.+)$/;

  for (const pattern of [pattern1, pattern2, pattern3]) {
    const match = text.match(pattern);
    if (match) {
      const abbr = match[1].trim();
      const meaning = match[2].trim();
      // 너무 긴 건 약어가 아님
      if (abbr.length <= 10 && meaning.length >= 2) {
        return { abbr, meaning };
      }
    }
  }

  return null;
}

/**
 * 용어 목록 반환 (도움말용)
 */
function getTermsList() {
  const terms = loadTerms();
  let msg = '📚 *현재 등록된 용어*\n\n';

  msg += '*약어*\n```\n';
  for (const [abbr, meaning] of Object.entries(terms.abbreviations)) {
    msg += `${abbr} = ${meaning}\n`;
  }
  msg += '```\n\n';

  msg += '*업무 용어*\n```\n';
  for (const [phrase, condition] of Object.entries(terms.phrases)) {
    msg += `${phrase}\n`;
  }
  msg += '```\n';

  return msg;
}

module.exports = {
  loadTerms,
  learnTerm,
  learnPhrase,
  expandAbbreviations,
  parseLearnRequest,
  getTermsList
};
