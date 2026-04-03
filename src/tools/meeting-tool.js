/**
 * LangChain Tool: 미팅 일정 조회
 * 기존 모듈: search-meeting.js (getMeetings), format.js (formatMeetings)
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getMeetings } = require('../search-meeting');
const { formatMeetings } = require('../format');

const meetingTool = tool(
  async ({ names, date, slackUserId }) => {
    const results = [];

    for (const name of names) {
      const data = await getMeetings(name, date, slackUserId);

      if (data.error) {
        results.push(`⚠️ ${data.error}`);
        continue;
      }

      results.push(formatMeetings(data));
    }

    return results.join('\n');
  },
  {
    name: 'meeting',
    description:
      '담당자의 미팅/이벤트 일정을 조회합니다. Salesforce Event에서 미팅 일정을 가져옵니다. ' +
      '여러 명의 일정을 한 번에 조회할 수 있습니다. ' +
      '"오늘 미팅", "이번주 미팅", "홍길동 미팅", "내 미팅 일정", "다음주 미팅" 등의 질문에 사용합니다. ' +
      '주의: "방문 일정"은 Visit__c를 사용하는 soql Tool이 적합합니다. 이 Tool은 Event 오브젝트만 조회합니다. ' +
      '조회 필드 - Event: Subject(제목), ActivityDate(날짜), StartDateTime(시작시간), EndDateTime(종료시간), ' +
      'Type(유형), Account.Name(매장명), Who.Name(대상), Owner.Name(담당자)',
    schema: z.object({
      names: z
        .array(z.string())
        .describe('조회할 사용자 이름 배열. 본인이면 "me", 다른 사람이면 이름 (예: ["me"], ["홍길동"], ["me", "김철수"])'),
      date: z
        .string()
        .describe('날짜 필터. today, yesterday, this_week, this_month, next_week, next_month, last_week, last_month 또는 YYYY-MM-DD 형식'),
      slackUserId: z
        .string()
        .describe('현재 메시지를 보낸 사용자의 Slack ID. names에 "me"가 포함된 경우 본인 식별에 사용'),
    }),
  }
);

module.exports = { meetingTool };
