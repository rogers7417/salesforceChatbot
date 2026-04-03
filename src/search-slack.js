/**
 * Slack 메시지 검색 (search:read 스코프 필요)
 * 같은 채널/시간대 메시지를 묶어서 대화 흐름을 보여줌
 */
const { WebClient } = require('@slack/web-api');

function getSearchClient() {
  return new WebClient(process.env.USER_BOT_TOKEN);
}

function getBotClient() {
  return new WebClient(process.env.SLACK_BOT_TOKEN);
}

const EXCLUDE_CHANNELS = [
  'info-점주어드민-상품-이미지-변경',
];

async function searchSlackMessages(keyword, count = 30) {
  const client = getSearchClient();
  const cleanKeyword = keyword.replace(/[()（）\[\]]/g, ' ').trim();
  console.log(`[Slack 검색] 원본: "${keyword}" → 정제: "${cleanKeyword}"`);

  try {
    const result = await client.search.messages({
      query: `${cleanKeyword} -from:sales_enablement`,
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
 * 검색 결과를 채널+날짜 기준으로 묶기
 * 같은 채널에서 같은 날짜에 올라온 메시지를 하나의 대화로 그룹핑
 */
async function searchSlackThreaded(keyword, count = 30) {
  const messages = await searchSlackMessages(keyword, count);
  if (messages.length === 0) return { threads: [], totalMessages: 0 };

  const botClient = getBotClient();

  // 채널+날짜 기준으로 그룹핑
  const groupMap = {};

  messages.forEach(m => {
    const key = `${m.channel}|${m.date}`;
    if (!groupMap[key]) {
      groupMap[key] = {
        channel: m.channel,
        channelId: m.channelId,
        date: m.date,
        ts: m.ts,
        messages: [],
        permalink: m.permalink,
      };
    }
    groupMap[key].messages.push(m);
  });

  // 스레드 replies 가져오기 시도 (상위 5개 그룹)
  const groups = Object.values(groupMap)
    .sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts))
    .slice(0, 8);

  for (const group of groups) {
    // 각 그룹의 첫 메시지로 스레드 replies 시도
    for (const m of group.messages) {
      if (m.threadTs) {
        try {
          const replies = await botClient.conversations.replies({
            channel: m.channelId,
            ts: m.threadTs,
            limit: 10,
          });
          if (replies.messages?.length > 1) {
            group.threadReplies = replies.messages.map(r => ({
              text: (r.text || '').slice(0, 200),
              user: r.user,
              date: new Date(parseFloat(r.ts) * 1000).toLocaleDateString('ko-KR'),
            }));
            break;
          }
        } catch (err) {
          // 권한 없는 채널 무시
        }
      }
    }
  }

  // 결과 구성
  const threads = groups.map(g => ({
    channel: g.channel,
    date: g.date,
    permalink: g.permalink,
    messageCount: g.threadReplies?.length || g.messages.length,
    conversation: (g.threadReplies || g.messages.map(m => ({
      date: m.date,
      user: m.user,
      text: (m.text || '').slice(0, 300),
    }))),
  }));

  console.log(`[Slack 검색] ${threads.length}개 대화 묶음 (채널+날짜 기준)`);

  return {
    threads,
    totalMessages: messages.length,
  };
}

module.exports = { searchSlackMessages, searchSlackThreaded };
