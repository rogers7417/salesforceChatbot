/**
 * LangChain Tool: 담당자 활동 조회
 * 기존 모듈: search-activity.js (getActivitySummary, formatActivitySummary)
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getActivitySummary, formatActivitySummary } = require('../search-activity');

const activityTool = tool(
  async ({ name, date, slackUserId }) => {
    const data = await getActivitySummary(name, date, slackUserId);

    if (data.error) {
      return `⚠️ ${data.error}`;
    }

    return formatActivitySummary(data);
  },
  {
    name: 'activity',
    description:
      '담당자의 활동 현황을 종합 조회합니다. 미팅 일정, 영업기회 터치, Lead 터치, Slack 언급을 한 번에 보여줍니다. ' +
      '팀장이 팀원의 활동을 파악하거나, 본인의 활동 현황을 확인할 때 사용합니다. ' +
      '"홍길동 활동", "김철수 오늘 뭐했어", "내 활동 현황", "이번주 활동" 등의 질문에 사용합니다. ' +
      '조회 필드 - Event: Subject, StartDateTime, Account.Name, Who.Name (미팅) / ' +
      'Opportunity: Name, StageName, Amount, Account.Name, LastModifiedDate (영업기회 터치) / ' +
      'Lead: Name, Company, Status, LastModifiedDate (Lead 터치) / ' +
      'Task: Subject, Status, Type, ActivityDate (활동 이력) / ' +
      'Slack: 담당자 이름으로 최근 Slack 대화 검색',
    schema: z.object({
      name: z
        .string()
        .describe('조회할 사용자 이름. 본인이면 "me", 다른 사람이면 이름 (예: "me", "홍길동")'),
      date: z
        .string()
        .describe('날짜 필터. today, yesterday, this_week, this_month 또는 YYYY-MM-DD 형식'),
      slackUserId: z
        .string()
        .describe('현재 메시지를 보낸 사용자의 Slack ID. name이 "me"인 경우 본인 식별에 사용'),
    }),
  }
);

module.exports = { activityTool };
