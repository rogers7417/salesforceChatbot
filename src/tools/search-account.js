/**
 * Tool: search_account
 * 매장명/업체명으로 Account 검색 (SF + Slack 스레드 통합)
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getAccountDetail } = require('../search-salesforce');
const { searchSlackThreaded } = require('../search-slack');

function createSearchAccountTool(sfUser) {
  return tool(
    async ({ keyword }) => {
      const sfUserId = sfUser?.Id || null;

      // SF + Slack 병렬 조회
      const [sfData, slackData] = await Promise.all([
        getAccountDetail(keyword, sfUserId),
        searchSlackThreaded(keyword, 20),
      ]);

      // SF 데이터 포맷
      let msg = '';

      if (sfData.accounts?.length > 0) {
        msg += `[Account] ${sfData.accounts.length}건\n`;
        sfData.accounts.forEach(a => {
          msg += `  ${a.Name} / 담당: ${a.Owner?.Name || '-'}\n`;
        });
        msg += '\n';
      }

      if (sfData.leads?.length > 0) {
        msg += `[Lead] ${sfData.leads.length}건\n`;
        sfData.leads.forEach(l => {
          msg += `  ${l.Company || l.Name} / ${l.Status} / 담당: ${l.Owner?.Name || '-'} / ${l.CreatedDate?.slice(0, 10) || ''}\n`;
        });
        msg += '\n';
      }

      if (sfData.opportunities?.length > 0) {
        msg += `[영업기회] ${sfData.opportunities.length}건\n`;
        sfData.opportunities.forEach(o => {
          const amount = o.Amount ? `${(o.Amount / 10000).toFixed(0)}만원` : '-';
          msg += `  ${o.Name} / ${o.StageName} / ${amount} / 마감: ${o.CloseDate || '-'}\n`;
        });
        msg += '\n';
      }

      // Slack 스레드 요약
      if (slackData.threads.length > 0) {
        msg += `[Slack 대화] ${slackData.threads.length}개 대화 (총 ${slackData.totalMessages}건)\n\n`;
        slackData.threads.slice(0, 5).forEach((t, i) => {
          msg += `  대화 ${i + 1} | #${t.channel} | ${t.date} (${t.messageCount}건)\n`;
          t.conversation.forEach(c => {
            const text = c.text.replace(/\n/g, ' ').slice(0, 150);
            msg += `    ${c.date} ${c.user}: ${text}\n`;
          });
          if (t.permalink) msg += `    링크: ${t.permalink}\n`;
          msg += '\n';
        });
      } else {
        msg += '[Slack 대화] 관련 대화 없음\n';
      }

      return msg || `"${keyword}" 관련 정보를 찾을 수 없습니다.`;
    },
    {
      name: 'search_account',
      description:
        '매장명/업체명으로 Salesforce(Account, Lead, Opportunity)와 Slack 대화를 통합 검색합니다. ' +
        'Slack 대화는 스레드 단위로 묶어서 대화 흐름을 보여줍니다. ' +
        '"OO 현황", "OO 어떻게 됐어?", "OO 찾아줘" 등의 질문에 사용합니다.',
      schema: z.object({
        keyword: z.string().describe('검색할 매장명 또는 업체명'),
      }),
    }
  );
}

module.exports = { createSearchAccountTool };
