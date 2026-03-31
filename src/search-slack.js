/**
 * Slack 메시지 검색 (search:read 스코프 필요)
 */
const { WebClient } = require('@slack/web-api');

// 검색은 유저 토큰 필요 (봇 토큰으로는 search API 사용 불가)
function getSearchClient() {
  return new WebClient(process.env.USER_BOT_TOKEN);
}

async function searchSlackMessages(keyword, count = 30) {
  const client = getSearchClient();

  // 괄호, 특수문자 제거 → 핵심 키워드만 추출
  const cleanKeyword = keyword.replace(/[()（）\[\]]/g, ' ').trim();
  console.log(`[Slack 검색] 원본: "${keyword}" → 정제: "${cleanKeyword}"`);

  try {
    const result = await client.search.messages({
      query: `${cleanKeyword} -in:@Sales_Enablement -in:@bizopssf`,
      sort: 'timestamp',
      sort_dir: 'desc',
      count,
    });

    // 제외할 채널 목록
    const EXCLUDE_CHANNELS = [
      'info-점주어드민-상품-이미지-변경',
    ];

    const messages = (result.messages?.matches || [])
      .filter(m => !m.channel?.name?.startsWith('U'))  // DM 채널 제외
      .filter(m => !m.text?.includes('검색 결과'))     // 봇 검색 결과 메시지 제외
      .filter(m => !EXCLUDE_CHANNELS.includes(m.channel?.name));  // 특정 채널 제외

    console.log(`[Slack 검색 결과] 전체: ${result.messages?.matches?.length || 0}건 → 필터 후: ${messages.length}건`);

    return messages.map(m => ({
      text: m.text,
      user: m.username || m.user,
      channel: m.channel?.name || '?',
      ts: m.ts,
      date: new Date(parseFloat(m.ts) * 1000).toLocaleDateString('ko-KR'),
      permalink: m.permalink,
    }));
  } catch (err) {
    console.error('Slack 검색 오류:', err.message);
    return [];
  }
}

module.exports = { searchSlackMessages };
