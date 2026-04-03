/**
 * LangChain Tool: 내 할 일 조회
 * 기존 모듈: search-salesforce.js (getMyTodos, findUserBySlackId), format.js (formatMyTodos)
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getMyTodos, findUserBySlackId } = require('../search-salesforce');
const { formatMyTodos } = require('../format');

const todoTool = tool(
  async ({ slackUserId }) => {
    const sfUser = await findUserBySlackId(slackUserId);
    if (!sfUser) {
      return 'Salesforce 계정을 찾을 수 없습니다. Slack ID가 SF에 등록되어 있는지 확인해주세요.';
    }

    const data = await getMyTodos(sfUser.Id);
    return formatMyTodos(sfUser.Name, data);
  },
  {
    name: 'todo',
    description:
      '현재 사용자의 할 일을 조회합니다. 계류 중인 Lead와 진행 중인 영업기회 목록을 보여줍니다. ' +
      '"내 할 일", "오늘 뭐해야돼", "내 리드", "내 영업기회" 등의 질문에 사용합니다. ' +
      '조회 필드 - Lead: Name, Company, Status(상태: 리터치예정/고민중/부재중/장기부재 등), CreatedDate, Phone / ' +
      'Opportunity: Name, StageName(단계: 방문배정/설치진행/Closed Won 등), Amount(금액), CloseDate(마감일), Account.Name',
    schema: z.object({
      slackUserId: z.string().describe('Slack 사용자 ID (예: U01ABCDEF). 현재 메시지를 보낸 사용자의 Slack ID'),
    }),
  }
);

module.exports = { todoTool };
