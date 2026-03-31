/**
 * Claude Haiku로 검색 결과 요약
 */
const Anthropic = require('@anthropic-ai/sdk');
const { claudeLimiter } = require('./rate-limiter');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

async function summarize(keyword, sfData, slackMessages) {
  const sfSection = buildSfSection(sfData);
  const slackSection = buildSlackSection(slackMessages);

  const prompt = `당신은 영업팀 어시스턴트입니다. 아래는 "${keyword}"에 대한 Salesforce 데이터와 Slack 대화 내역입니다.

두 가지를 작성해줘:

[Slack 대화 요약]
- Slack 대화 내역을 날짜순으로 핵심만 요약
- 각 항목은 "날짜 채널명 - 내용" 형태로
- 중복 내용은 합쳐서

[종합 요약]
- 현재 상태 (Lead/영업기회 단계)
- 최근 활동 핵심
- 다음 액션 제안

응답 규칙:
- 마크다운 기호 절대 사용하지 마 (##, **, 백틱, _ 등)
- 그냥 일반 텍스트로만 작성해
- 줄바꿈과 들여쓰기로 구분해
- [Slack 대화 요약]과 [종합 요약] 헤더는 그대로 유지해

---
[Salesforce 데이터]
${sfSection}

---
[Slack 대화]
${slackSection}
`;

  await claudeLimiter.acquire();
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

function buildSfSection(data) {
  const parts = [];

  if (data.accounts.length > 0) {
    parts.push('Account:');
    data.accounts.forEach(a => {
      parts.push(`  - ${a.Name} / 담당: ${a.Owner?.Name || '?'}`);
    });
  }

  if (data.leads.length > 0) {
    parts.push('Lead:');
    data.leads.forEach(l => {
      parts.push(`  - ${l.Name} (${l.Company}) / ${l.Status} / 담당: ${l.Owner?.Name || '?'} / ${l.CreatedDate?.slice(0, 10)}`);
    });
  }

  if (data.opportunities.length > 0) {
    parts.push('Opportunity:');
    data.opportunities.forEach(o => {
      parts.push(`  - ${o.Name} / ${o.StageName} / ${o.Amount ? o.Amount.toLocaleString() + '원' : '금액미정'} / 마감: ${o.CloseDate || '?'} / 담당: ${o.Owner?.Name || '?'}`);
    });
  }

  return parts.length > 0 ? parts.join('\n') : '검색 결과 없음';
}

function buildSlackSection(messages) {
  if (messages.length === 0) return '관련 대화 없음';
  return messages.map(m =>
    `[${m.date}] #${m.channel} ${m.user}: ${m.text.slice(0, 200)}`
  ).join('\n');
}

module.exports = { summarize };
