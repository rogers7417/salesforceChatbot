/**
 * Slack 메시지 포맷팅
 */

function formatMyTodos(userName, data) {
  const { leads, opportunities } = data;
  const today = new Date().toLocaleDateString('ko-KR');

  let msg = `📋 *${userName}님, 오늘(${today}) 할 일*\n\n`;

  // Lead
  msg += `📌 *계류 중인 Lead* (${leads.length}건)\n`;
  if (leads.length === 0) {
    msg += `\`\`\`없음\`\`\`\n`;
  } else {
    msg += `\`\`\`\n`;
    leads.forEach(l => {
      const date = l.CreatedDate?.slice(0, 10) || '';
      msg += `• ${l.Company || l.Name} / ${l.Status} / ${date}\n`;
    });
    msg += `\`\`\`\n`;
  }

  // Opportunity
  msg += `\n💰 *진행 중인 영업기회* (${opportunities.length}건)\n`;
  if (opportunities.length === 0) {
    msg += `\`\`\`없음\`\`\`\n`;
  } else {
    msg += `\`\`\`\n`;
    opportunities.forEach(o => {
      const amount = o.Amount ? `${(o.Amount / 10000).toFixed(0)}만원` : '금액미정';
      msg += `• ${o.Name} / ${o.StageName} / ${amount} / 마감: ${o.CloseDate || '?'}\n`;
    });
    msg += `\`\`\`\n`;
  }

  return msg;
}

function formatSearchResult(keyword, sfData, slackMessages) {
  let msg = `🔍 *"${keyword}" 검색 결과*\n\n`;

  // SF Account
  if (sfData.accounts.length > 0) {
    msg += `🏢 *Account* (${sfData.accounts.length}건)\n`;
    msg += `\`\`\`\n`;
    sfData.accounts.forEach(a => {
      msg += `• ${a.Name} / 담당: ${a.Owner?.Name || '?'}\n`;
    });
    msg += `\`\`\`\n\n`;
  }

  // SF Lead
  if (sfData.leads.length > 0) {
    msg += `📌 *Lead* (${sfData.leads.length}건)\n`;
    msg += `\`\`\`\n`;
    sfData.leads.forEach(l => {
      msg += `• ${l.Company || l.Name} / ${l.Status} / 담당: ${l.Owner?.Name || '?'} / ${l.CreatedDate?.slice(0, 10)}\n`;
    });
    msg += `\`\`\`\n\n`;
  }

  // SF Opportunity
  if (sfData.opportunities.length > 0) {
    msg += `💰 *Opportunity* (${sfData.opportunities.length}건)\n`;
    msg += `\`\`\`\n`;
    sfData.opportunities.forEach(o => {
      const amount = o.Amount ? `${(o.Amount / 10000).toFixed(0)}만원` : '금액미정';
      msg += `• ${o.Name} / ${o.StageName} / ${amount} / 마감: ${o.CloseDate || '?'}\n`;
    });
    msg += `\`\`\`\n\n`;
  }

  return msg;
}

function formatAccountList(keyword, accounts) {
  let msg = `🔍 *"${keyword}"* 검색 결과 *${accounts.length}건*\n번호를 입력해서 선택하세요.\n\n`;
  msg += `\`\`\`\n`;
  accounts.forEach((a, i) => {
    msg += `${i + 1}. ${a.Name} / 담당: ${a.Owner?.Name || '?'}\n`;
  });
  msg += `\`\`\`\n`;
  return msg;
}

function formatBrandSummary(data) {
  const { brandName, totalCurrent, branchCount, branches } = data;

  // Block Kit 형식으로 반환
  const blocks = [];

  // 헤더
  blocks.push({
    type: 'header',
    text: { type: 'plain_text', text: `🏢 ${brandName} 브랜드 현황` },
  });

  blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: `📦 *${branchCount}개 지점 / 총 태블릿 ${totalCurrent}대*` },
  });

  blocks.push({ type: 'divider' });

  // 현재 대수 내림차순
  const sorted = Object.entries(branches)
    .sort((a, b) => b[1].current - a[1].current);

  // Slack fields는 section당 최대 10개, 2열로 표시
  // 지점 정보를 묶어서 표시
  const CHUNK = 5;
  for (let i = 0; i < sorted.length; i += CHUNK) {
    const chunk = sorted.slice(i, i + CHUNK);
    const fields = [];

    chunk.forEach(([branch, info]) => {
      const typeStr = info.types.join(' → ');

      let contractStr = '';
      if (info.contract) {
        contractStr = `\n📋 ${info.contract.start || '?'} ~ ${info.contract.end || '?'}`;
      }

      const statusIcon = info.status === 'ACTIVE' ? '🟢' : '⚪';

      fields.push({
        type: 'mrkdwn',
        text: `${statusIcon} *${branch}*\n${info.current}대 (${typeStr})${contractStr}`,
      });
    });

    blocks.push({ type: 'section', fields });
  }

  // 합계
  blocks.push({ type: 'divider' });
  blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: `*합계: ${totalCurrent}대* (${branchCount}개 지점)` },
  });

  return { blocks };
}

function formatMeetings(data) {
  const { name, dateLabel, events, totalCount } = data;

  let msg = `📅 *${name}님 ${dateLabel} 미팅* (${totalCount}건)\n\n`;

  if (totalCount === 0) {
    msg += `\`\`\`미팅 일정 없음\`\`\`\n`;
    return msg;
  }

  // 날짜별 그룹핑
  const byDate = {};
  events.forEach(e => {
    const date = e.ActivityDate || '미정';
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(e);
  });

  msg += `\`\`\`\n`;
  Object.entries(byDate).forEach(([date, dayEvents]) => {
    msg += `[ ${date} ]\n`;
    dayEvents.forEach(e => {
      let time = '';
      if (e.StartDateTime) {
        const start = new Date(e.StartDateTime);
        const end = e.EndDateTime ? new Date(e.EndDateTime) : null;
        const fmt = (d) => d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
        time = end ? `${fmt(start)}~${fmt(end)}` : fmt(start);
      }

      const subject = e.Subject || '';
      const account = e.Account?.Name || '';
      const type = e.Type || '';

      msg += `  ${time} | ${subject}`;
      if (account) msg += ` | ${account}`;
      if (type) msg += ` (${type})`;
      msg += `\n`;
    });
    msg += `\n`;
  });
  msg += `\`\`\`\n`;

  return msg;
}

module.exports = { formatMyTodos, formatSearchResult, formatAccountList, formatBrandSummary, formatMeetings };
