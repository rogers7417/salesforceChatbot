/**
 * Agent: LangChain createAgent + ChatAnthropic
 * - 9개 Tool (sfUser/slackUserId 클로저 바인딩)
 * - BufferWindow 메모리 (최근 5쌍)
 * - maxIterations(recursionLimit): 3
 */
const { ChatAnthropic } = require('@langchain/anthropic');
// langchain v1.x에서는 agents가 package.json exports에 없으므로 dist 직접 참조
const path = require('path');
const langchainAgentsPath = path.join(path.dirname(require.resolve('langchain')), 'agents', 'index.cjs');
const { createAgent } = require(langchainAgentsPath);
const { getMemory } = require('./memory');

// Tools
const { createGetMyTodosTool } = require('../tools/get-my-todos');
const { createSearchAccountTool } = require('../tools/search-account');
const { createGetBrandSummaryTool } = require('../tools/get-brand-summary');
const { createGetMeetingsTool } = require('../tools/get-meetings');
const { createGetActivitySummaryTool } = require('../tools/get-activity-summary');
const { createQuerySalesforceTool } = require('../tools/query-salesforce');
const { contractTool } = require('../tools/contract-tool');
const { installationTool } = require('../tools/installation-tool');
const { quoteTool } = require('../tools/quote-tool');
const { journeyTool } = require('../tools/journey-tool');

const SYSTEM_PROMPT = `당신은 티오더 영업팀의 Salesforce 데이터 어시스턴트입니다.
사용자의 질문에 맞는 도구를 선택해서 데이터를 조회하세요.

도구 선택 가이드:
- "오늘 뭐해", "할일" → get_my_todos
- 매장명/업체명 검색 → search_account
- "브랜드 현황", "설치 대수", "몇 대" → get_brand_summary
- 사람 이름 + "미팅", "방문", "일정" → get_meetings
- 사람 이름 + "뭐해", "활동", "진행상황" → get_activity_summary
- "계약 현황", "계약 만료", "재계약" → get_contract_info
- "설치 일정", "설치 담당", "누가 설치해", 설치 업체명(준테크코리아 등) → get_installation_info
- "견적", "견적서", "견적 금액" → get_quote_info
- "전체 히스토리", "여정", "처음부터", "어떻게 진행됐어" → customer_journey
- 통계, 분석, 팀별 현황 등 복잡한 질문 → query_salesforce

각 도구의 description에 사용 가능한 필드 목록이 포함되어 있습니다. 사용자가 특정 필드에 대해 질문하면 해당 필드를 포함한 도구를 선택하세요. 도구가 반환하는 데이터에 원하는 정보가 없으면 query_salesforce 도구로 직접 SOQL을 생성하세요.

응답 규칙:
- 도구는 1~2개만 사용하라. 3개 이상 호출하지 마.
- 도구가 반환한 결과를 그대로 전달하라. 추가 도구 호출 없이 바로 응답.
- 절대로 마크다운 기호 사용하지 마. **, ##, 백틱, _ 금지. 이모지도 금지.
- 도구가 반환한 텍스트를 그대로 사용자에게 전달해. 요약하거나 다시 포맷팅하지 마.
- 한국어로 응답`;

/**
 * Agent 실행
 * @param {string} input - 사용자 질문
 * @param {object} sfUser - Salesforce 사용자 정보 { Id, Name, ... }
 * @param {string} slackUserId - Slack 사용자 ID
 * @returns {string} 응답 텍스트
 */
async function runAgent(input, sfUser, slackUserId) {
  // Tool 생성 (sfUser, slackUserId 클로저 바인딩)
  const tools = [
    createGetMyTodosTool(sfUser),
    createSearchAccountTool(sfUser),
    createGetBrandSummaryTool(),
    createGetMeetingsTool(sfUser, slackUserId),
    createGetActivitySummaryTool(slackUserId),
    createQuerySalesforceTool(),
    contractTool,
    installationTool,
    quoteTool,
    journeyTool,
  ];

  // 모델 생성
  const model = new ChatAnthropic({
    model: 'claude-haiku-4-5-20251001',
    anthropicApiKey: process.env.CLAUDE_API_KEY,
    temperature: 0,
  });

  // 메모리에서 이전 대화 가져오기
  const memory = getMemory(slackUserId);
  const history = memory.getMessages();

  // 메시지 구성
  const messages = history.map(m => ({
    role: m.role,
    content: m.content,
  }));
  messages.push({ role: 'user', content: input });

  // Agent 생성 및 실행
  const agent = createAgent({
    model,
    tools,
    prompt: SYSTEM_PROMPT,
  });

  const result = await agent.invoke(
    { messages },
    { recursionLimit: 15 }
  );

  // Tool 호출 로그
  result.messages.forEach(m => {
    if (m.tool_calls?.length > 0) {
      m.tool_calls.forEach(tc => console.log(`[Agent] Tool 호출: ${tc.name}(${JSON.stringify(tc.args).slice(0, 100)})`));
    }
    if (m.name) {
      const content = typeof m.content === 'string' ? m.content.slice(0, 100) : '';
      console.log(`[Agent] Tool 결과: ${m.name} → ${content}...`);
    }
  });

  // 마지막 AI 메시지 추출
  const aiMessages = result.messages.filter(m =>
    m._getType?.() === 'ai' || m.constructor?.name === 'AIMessage'
  );
  const lastAiMessage = aiMessages[aiMessages.length - 1];
  const output = typeof lastAiMessage?.content === 'string'
    ? lastAiMessage.content
    : Array.isArray(lastAiMessage?.content)
      ? lastAiMessage.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join('')
      : '응답을 생성할 수 없습니다.';

  // 메모리에 대화 저장
  memory.addMessage('user', input);
  memory.addMessage('assistant', output);

  return output;
}

module.exports = { runAgent };
