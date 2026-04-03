/**
 * Tool: search_account
 * 매장명/업체명으로 Account 검색 (Lead + Opportunity + Account)
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getAccountDetail } = require('../search-salesforce');

function createSearchAccountTool(sfUser) {
  return tool(
    async ({ keyword }) => {
      const sfUserId = sfUser?.Id || null;
      const result = await getAccountDetail(keyword, sfUserId);
      return JSON.stringify(result);
    },
    {
      name: 'search_account',
      description: '매장명/업체명으로 검색: Account, Lead, Opportunity 정보를 조회합니다.',
      schema: z.object({
        keyword: z.string().describe('검색할 매장명 또는 업체명'),
      }),
    }
  );
}

module.exports = { createSearchAccountTool };
