/**
 * Haiku로 사용자 의도 분류
 */
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { claudeLimiter } = require('./rate-limiter');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts', 'intent.md'), 'utf-8');

async function classifyIntent(text) {
  try {
    await claudeLimiter.acquire();
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
    });

    let raw = response.content[0].text.trim();
    // 코드 블록 제거
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    console.log(`[의도 분류] "${text}" → ${raw}`);
    return JSON.parse(raw);
  } catch (err) {
    console.error('[의도 분류 오류]', err.message);
    // 폴백: 숫자면 select, 아니면 search
    const num = parseInt(text);
    if (!isNaN(num)) return { intent: 'select', number: num };
    return { intent: 'search', keyword: text };
  }
}

module.exports = { classifyIntent };
