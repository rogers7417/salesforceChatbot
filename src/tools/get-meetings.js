/**
 * Tool: get_meetings
 * 미팅/일정 조회
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getMeetings } = require('../search-meeting');

function createGetMeetingsTool(sfUser, slackUserId) {
  return tool(
    async ({ userName, dateStr }) => {
      const targetUser = userName || 'me';
      const result = await getMeetings(targetUser, dateStr || 'today', slackUserId);
      return JSON.stringify(result);
    },
    {
      name: 'get_meetings',
      description: '미팅/일정 조회: 특정 사용자의 미팅, 방문, 일정을 조회합니다. userName을 생략하면 본인 일정을 조회합니다.',
      schema: z.object({
        userName: z.string().optional().describe('조회할 사용자 이름 (생략 시 본인)'),
        dateStr: z.string().optional().describe('날짜 필터: today, this_week, this_month, yesterday, next_week, YYYY-MM-DD (기본: today)'),
      }),
    }
  );
}

module.exports = { createGetMeetingsTool };
