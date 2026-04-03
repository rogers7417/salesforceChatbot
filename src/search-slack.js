/**
 * Slack 메시지 검색 (search:read 스코프 필요)
 * 스레드 단위로 묶어서 대화 흐름을 보여줌
 */
const { WebClient } = require('@slack/web-api');

function getSearchClient() {
  return new WebClient(process.env.USER_BOT_TOKEN);
}

function getBotClient() {
  return new WebClient(process.env.SLACK_BOT_TOKEN);
}

// 제외할 채널 목록
const EXCLUDE_CHANNELS = [
  'info-점주어드민-상품-이미지-변경',
];

async function searchSlackMessages(keyword, count = 30) {
  const client = getSearchClient();

  const cleanKeyword = keyword.replace(/[()（）\[\]]/g, ' ').trim();
  console.log(`[Slack 검색] 원본: "${keyword}" → 정제: "${cleanKeyword}"`);

  try {
    const result = await client.search.messages({
      query: `${cleanKeyword} -in:@Sales_Enablement -in:@bizopssf`,
      sort: 'timestamp',
      sort_dir: 'desc',
      count,
    });

    const messages = (result.messages?.matches || [])
      .filter(m => !m.channel?.name?.startsWith('U'))
      .filter(m => !m.text?.includes('검색 결과'))
      .filter(m => !EXCLUDE_CHANNELS.includes(m.channel?.name));

    console.log(`[Slack 검색 결과] 전체: ${result.messages?.matches?.length || 0}건 → 필터 후: ${messages.length}건`);

    return messages.map(m => ({
      text: m.text,
      user: m.username || m.user,
      channel: m.channel?.name || '?',
      channelId: m.channel?.id || '',
      ts: m.ts,
      threadTs: m.thread_ts || null,
      date: new Date(parseFloat(m.ts) * 1000).toLocaleDateString('ko-KR'),
      permalink: m.permalink,
    }));
  } catch (err) {
    console.error('Slack 검색 오류:', err.message);
    return [];
  }
}

/**
 * 검색 결과를 스레드 단위로 묶기
 * 같은 thread_ts를 가진 메시지를 그룹핑하고, 스레드 전체 내용도 가져옴
 */
async function searchSlackThreaded(keyword, count = 30) {
  const messages = await searchSlackMessages(keyword, count);
  if (messages.length === 0) return { threads: [], totalMessages: 0 };

  const botClient = getBotClient();

  // 스레드별 그룹핑
  const threadMap = {};
  const standalone = [];

  messages.forEach(m => {
    const threadKey = m.threadTs || m.ts;
    if (m.threadTs) {
      // 스레드에 속한 메시지
      if (!threadMap[threadKey]) {
        threadMap[threadKey] = {
          channelId: m.channelId,
          channel: m.channel,
          threadTs: m.threadTs,
          messages: [],
          date: m.date,
          permalink: m.permalink,
        };
      }
      threadMap[threadKey].messages.push(m);
    } else {
      standalone.push(m);
    }
  });

  // 스레드의 전체 대화 가져오기 (상위 5개 스레드만)
  const threadKeys = Object.keys(threadMap).slice(0, 5);
  for (const key of threadKeys) {
    const thread = threadMap[key];
    try {
      const replies = await botClient.conversations.replies({
        channel: thread.channelId,
        ts: thread.threadTs,
        limit: 10,
      });

      if (replies.messages?.length > 0) {
        thread.fullThread = replies.messages.map(r => ({
          text: r.text,
          user: r.user,
          ts: r.ts,
          date: new Date(parseFloat(r.ts) * 1000).toLocaleDateString('ko-KR'),
        }));
      }
    } catch (err) {
      // 권한 없으면 검색 결과만 사용
      console.log(`[Slack 스레드] ${thread.channel} 스레드 조회 실패: ${err.message}`);
    }
  }

  // 결과 정리
  const threads = Object.values(threadMap).map(t => ({
    channel: t.channel,
    date: t.date,
    permalink: t.permalink,
    messageCount: t.fullThread?.length || t.messages.length,
    // 스레드 전체 대화 또는 검색된 메시지
    conversation: (t.fullThread || t.messages).map(m => ({
      date: m.date,
      user: m.user,
      text: (m.text || '').slice(0, 300),
    })),
  }));

  // 스레드에 속하지 않은 단독 메시지도 포함
  standalone.forEach(m => {
    threads.push({
      channel: m.channel,
      date: m.date,
      permalink: m.permalink,
      messageCount: 1,
      conversation: [{
        date: m.date,
        user: m.user,
        text: (m.text || '').slice(0, 300),
      }],
    });
  });

  // 날짜순 정렬 (최신 먼저)
  threads.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  console.log(`[Slack 스레드] ${threads.length}개 대화 묶음 (스레드: ${Object.keys(threadMap).length}, 단독: ${standalone.length})`);

  return {
    threads: threads.slice(0, 10),
    totalMessages: messages.length,
  };
}

module.exports = { searchSlackMessages, searchSlackThreaded };
