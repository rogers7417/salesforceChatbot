/**
 * Tool: get_activity_summary
 * 담당자 활동 통합 조회 (미팅, 영업기회 터치, Lead 터치, Slack 언급)
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getActivitySummary } = require('../search-activity');

function createGetActivitySummaryTool(slackUserId) {
  return tool(
    async ({ userName, dateStr }) => {
      const targetUser = userName || 'me';
      const result = await getActivitySummary(targetUser, dateStr || 'today', slackUserId);
      if (result.error) return JSON.stringify({ error: result.error });
      return JSON.stringify(result);
    },
    {
      name: 'get_activity_summary',
      description: '담당자 활동 요약 조회: 미팅, 영업기회 터치, Lead 터치, Slack 언급 등 활동 현황을 조회합니다.',
      schema: z.object({
        userName: z.string().optional().describe('조회할 사용자 이름 (생략 시 본인)'),
        dateStr: z.string().optional().describe('날짜 필터: today, this_week, this_month, yesterday (기본: today)'),
      }),
    }
  );
}

module.exports = { createGetActivitySummaryTool };
