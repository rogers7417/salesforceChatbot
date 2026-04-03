/**
 * Tool: get_my_todos
 * 내 할일 (계류 Lead + 진행 중 영업기회) 조회
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getMyTodos } = require('../search-salesforce');

function createGetMyTodosTool(sfUser) {
  return tool(
    async () => {
      const sfUserId = sfUser?.Id;
      if (!sfUserId) return JSON.stringify({ error: 'SF 계정을 찾을 수 없습니다.' });

      const result = await getMyTodos(sfUserId);
      return JSON.stringify(result);
    },
    {
      name: 'get_my_todos',
      description: '내 할일 조회: 계류 중인 Lead와 진행 중인 영업기회 목록을 반환합니다.',
      schema: z.object({}),
    }
  );
}

module.exports = { createGetMyTodosTool };
