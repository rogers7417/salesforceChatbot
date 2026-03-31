/**
 * 자연어 → SOQL 변환 (Haiku)
 */
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { getSalesforceToken, soqlQuery } = require('./salesforce');
const { matchFixedQuery } = require('./fixed-queries');
const { validateAndFix } = require('./soql-validator');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

function getSchema() {
  return fs.readFileSync(path.join(__dirname, 'schema', 'schema-for-llm.md'), 'utf-8');
}

const LEARNED_EXAMPLES_PATH = path.join(__dirname, 'schema', 'learned-examples.json');

function getLearnedExamples() {
  try {
    return JSON.parse(fs.readFileSync(LEARNED_EXAMPLES_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLearnedExample(question, queries) {
  const examples = getLearnedExamples();
  // 중복 체크 (비슷한 질문이 있으면 업데이트)
  const existing = examples.findIndex(e => e.question === question);
  if (existing >= 0) {
    examples[existing].queries = queries;
  } else {
    examples.push({ question, queries, savedAt: new Date().toISOString() });
  }
  // 최대 50개 유지
  if (examples.length > 50) examples.shift();
  fs.writeFileSync(LEARNED_EXAMPLES_PATH, JSON.stringify(examples, null, 2));
  console.log(`[SOQL 학습] 예시 저장: "${question.slice(0, 40)}..." → ${queries.length}개 쿼리`);
}

function getSystemPrompt() {
  const schema = getSchema();
  const examples = getLearnedExamples();

  let examplesSection = '';
  if (examples.length > 0) {
    examplesSection = '\n\n## 이전 성공한 SOQL 예시 (참고용)\n' +
      examples.slice(-20).map(e =>
        `질문: "${e.question}"\nSOQL: ${e.queries.join(';')}`
      ).join('\n\n');
  }

  return `당신은 Salesforce SOQL 쿼리 생성기입니다.

아래 스키마를 참고해서 사용자의 질문에 맞는 SOQL 쿼리를 생성하세요.

${schema}

규칙:
- SOQL 쿼리만 응답 (다른 텍스트 없이)
- 여러 쿼리가 필요하면 세미콜론(;)으로 구분
- 날짜 리터럴 활용: TODAY, THIS_WEEK, THIS_MONTH, NEXT_MONTH 등
- 이름으로 User 검색: Owner.Name LIKE '%이름%'
- 팀/부서 검색: Owner.Team__c, Owner.Department
- LIMIT 50 이하로 제한
- COUNT() 쿼리 가능
- GROUP BY는 지원 안 됨 → 대신 전체 조회 후 앱에서 집계
- 서브쿼리(WHERE Id IN (SELECT ...), WHERE Id NOT IN (SELECT ...)) 절대 사용 금지
  → 대신 쿼리를 2개로 분리하고 세미콜론(;)으로 구분
  → 앱에서 결과를 비교해서 처리함
  예: "Lead를 안 준 파트너사"
    → SELECT Id, Name FROM Account WHERE fm_RecordTypeDeveloperName__c = 'Partner' LIMIT 200;SELECT PartnerName__c, PartnerName__r.Name FROM Lead WHERE PartnerName__c != null AND CreatedDate >= 2026-01-01T00:00:00Z LIMIT 200
- SELECT DISTINCT 사용 금지 → SOQL에서 지원 안 됨, 중복은 앱에서 제거
- 테이블 alias 사용 금지 (FROM Account a → X, FROM Account → O)
- 서브쿼리 안에서 LIMIT 사용 금지
- SELECT에 같은 필드 중복 금지 (예: OwnerId를 두 번 넣지 마)
- GROUP BY 사용 금지
- CALENDAR_MONTH, CALENDAR_YEAR 함수 사용 금지
- 반드시 유효한 SOQL만 생성
- 설명 텍스트 절대 포함하지 마, SOQL 쿼리만 응답

후속 질문 처리:
- 대화 히스토리에 이전 실행한 SOQL과 결과가 [SOQL], [결과] 형식으로 포함됨
- "그 중에", "거기서", "전환은", "얼마나" 등은 이전 SOQL을 기반으로 조건 추가
- 예시:
  - 이전: "오늘 들어온 리드" → SELECT COUNT() FROM Lead WHERE CreatedDate = TODAY
  - 후속: "그중에 전환이 얼마나됐어?" → SELECT COUNT() FROM Lead WHERE CreatedDate = TODAY AND IsConverted = true
- 이전 SOQL의 WHERE 조건을 유지하면서 추가 조건만 AND로 붙임
- 후속 질문만 보고 이해가 안 되면 이전 SOQL을 참고해서 맥락 파악

사유/이력 조회:
- "왜 전환이 안됐어?" → Lead의 LossReason__c, LossReasonDetail__c, HoldReason__c 조회
- "왜 Closed Lost야?" → Opportunity의 Loss_Reason__c, Loss_Reason_Detail__c 조회
- "어떻게 되고 있어?" → Status + 최근 Task 활동 이력 조회
- "이력/활동 내역" → Task에서 WhoId 또는 AccountId로 조회
- 예시:
  - "전환 안 된 리드 사유" → SELECT Name, Company, Status, LossReason__c, LossReasonDetail__c, HoldReason__c FROM Lead WHERE IsConverted = false AND CreatedDate = TODAY
  - "노꼬치킨 활동 이력" → SELECT Subject, Status, Type, ActivityDate, Owner.Name FROM Task WHERE Account.Name LIKE '%노꼬치킨%' ORDER BY ActivityDate DESC LIMIT 20
${examplesSection}`;
}

async function generateAndExecute(question, history = []) {
  // 고정 쿼리 매칭 시도
  const fixedQueries = matchFixedQuery(question);
  if (fixedQueries) {
    console.log(`[고정 쿼리 실행] ${fixedQueries.length}개 쿼리`);
    const { accessToken, instanceUrl } = await getSalesforceToken();
    const results = [];
    let collectedIds = {}; // 이전 쿼리 결과의 Id를 저장

    for (let i = 0; i < fixedQueries.length; i++) {
      let query = fixedQueries[i];

      // 플레이스홀더 치환 (이전 쿼리 결과의 Id 사용)
      if (query.includes('{USER_IDS}') && collectedIds.userIds) {
        query = query.replace('{USER_IDS}', collectedIds.userIds);
      }

      try {
        const result = await soqlQuery(instanceUrl, accessToken, query);
        results.push({ query, success: true, totalSize: result.totalSize, records: result.records || [] });

        // Id 수집 (다음 쿼리에서 사용)
        if (result.records?.length > 0 && result.records[0].Id) {
          collectedIds.userIds = result.records.map(r => `'${r.Id}'`).join(',');
        }
      } catch (err) {
        const errorDetail = err.response?.data?.[0]?.message || err.message;
        results.push({ query, success: false, error: errorDetail });
      }
    }
    return { question, queries: fixedQueries, results };
  }

  const models = ['claude-haiku-4-5-20251001', 'claude-haiku-4-5-20251001', 'claude-haiku-4-5-20251001'];
  let lastErrors = [];

  for (let attempt = 0; attempt < 3; attempt++) {
    const model = models[attempt];
    const modelName = model.includes('sonnet') ? 'Sonnet' : 'Haiku';
    if (attempt === 0) {
      console.log(`[SOQL 생성] 쿼리 생성 시작`);
    } else {
      console.log(`[SOQL 재시도] ${attempt + 1}차 시도 — 에러 기반 쿼리 수정 중...`);
    }

    // 메시지 구성 (에러 시 에러 정보 포함)
    const messages = [...history];
    if (attempt === 0) {
      messages.push({ role: 'user', content: question });
    } else {
      // 재시도: 이전 에러 정보 포함
      const errorInfo = lastErrors.map(e => `이전 SOQL 에러:\n쿼리: ${e.query}\n에러: ${e.error}`).join('\n\n');
      messages.push({
        role: 'user',
        content: `${question}\n\n주의: 이전 시도에서 아래 에러가 발생했으니 수정해서 다시 생성해줘.\n${errorInfo}`,
      });
    }

    // SOQL 생성
    const response = await client.messages.create({
      model,
      max_tokens: 500,
      system: getSystemPrompt(),
      messages,
    });

    let rawSoql = response.content[0].text.trim();
    rawSoql = rawSoql.replace(/```(?:sql|soql)?\s*/gi, '').replace(/```/g, '').trim();
    rawSoql = rawSoql.replace(/\bDISTINCT\b/gi, '');
    // 세미콜론으로 먼저 분리 → 각각에서 SELECT 추출
    const parts = rawSoql.split(/;/).map(p => p.trim()).filter(p => p);
    const queries = parts
      .map(p => {
        const match = p.match(/SELECT[\s\S]*/i);
        return match ? validateAndFix(match[0].trim()) : null;
      })
      .filter(q => q);

    console.log(`  ${queries.length}개 쿼리`);
    queries.forEach((q, i) => console.log(`  [${i + 1}] ${q}`));

    // 실행
    const { accessToken, instanceUrl } = await getSalesforceToken();
    const results = [];
    lastErrors = [];

    for (const query of queries) {
      try {
        const result = await soqlQuery(instanceUrl, accessToken, query);
        results.push({
          query,
          success: true,
          totalSize: result.totalSize,
          records: result.records || [],
        });
      } catch (err) {
        const errorDetail = err.response?.data?.[0]?.message || err.message;
        console.error(`  [SOQL 에러] ${errorDetail}`);
        results.push({ query, success: false, error: errorDetail });
        lastErrors.push({ query, error: errorDetail });
      }
    }

    // 에러 없으면 성공
    const hasError = results.some(r => !r.success);
    if (!hasError) {
      // 재시도로 성공한 경우 학습 저장
      if (attempt >= 1) {
        saveLearnedExample(question, queries);
      }
      return { question, queries, results };
    }

    // 일부 성공이면 그대로 반환
    const hasData = results.some(r => r.success && (r.records.length > 0 || r.totalSize > 0));
    if (hasData) {
      console.log(`  일부 성공, 결과 반환`);
      // 재시도 성공분은 학습
      if (attempt >= 1) {
        const successQueries = queries.filter((q, i) => results[i]?.success);
        if (successQueries.length > 0) saveLearnedExample(question, successQueries);
      }
      return { question, queries, results };
    }

    if (attempt < 2) {
      console.log(`[SOQL] 실패 → 에러 기반 재시도...`);
    }
  }

  // 3번 다 실패
  return { question, queries: [], results: lastErrors.map(e => ({ ...e, success: false })) };
}

/**
 * 결과를 자연어로 요약
 */
async function summarizeResults(question, queryResults) {
  const dataStr = queryResults.results.map((r, i) => {
    const queryLabel = `[쿼리${i + 1}: ${r.query?.slice(0, 60)}...]`;
    if (!r.success) return `${queryLabel}\n쿼리 실패: ${r.error}`;
    if (r.records.length === 0 && r.totalSize > 0) return `${queryLabel}\nCOUNT 결과: ${r.totalSize}건`;
    if (r.records.length === 0) return `${queryLabel}\n결과 없음`;
    return `${queryLabel}\n총 ${r.totalSize}건\n` + JSON.stringify(r.records.slice(0, 30), null, 2);
  }).join('\n---\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `사용자 질문: "${question}"

아래는 Salesforce 조회 결과입니다. 질문에 맞게 간결하게 요약해주세요.

여러 쿼리 결과가 있으면:
- 쿼리1의 결과와 쿼리2의 결과를 비교/조합해서 답변
- 예: 쿼리1=전체 파트너사, 쿼리2=Lead 소개한 파트너사 → 쿼리1에 있지만 쿼리2에 없는 파트너사 = Lead 안 준 파트너사

사유/이력 요약 시:
- LossReason__c, HoldReason__c 등 사유 필드는 그룹별로 집계해서 보여줌
  예: "취소 사유: 장기부재 5건, 오인입 3건, 고객거절 2건"
- Task 활동 이력은 최근순으로 정리
  예: "최근 활동: 3/28 전화상담(부재), 3/25 미팅예정 확인, 3/20 첫 컨택"
- Status별 분포도 집계
  예: "상태별: 고민중 8건, 부재중 5건, 장기부재 3건"

응답 규칙:
- 마크다운 기호 사용하지 마 (**, ##, 백틱 등)
- 일반 텍스트로만 작성
- 숫자와 핵심 정보 위주로
- 줄바꿈과 들여쓰기로 구분

${dataStr}`
    }],
  });

  return response.content[0].text;
}

module.exports = { generateAndExecute, summarizeResults };
