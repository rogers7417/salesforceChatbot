/**
 * Tool: query_salesforce
 * 자연어 → SOQL 변환 후 실행 (복잡한 질문용)
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { generateAndExecute, summarizeResults } = require('../soql-generator');

function createQuerySalesforceTool() {
  return tool(
    async ({ question }) => {
      const queryResult = await generateAndExecute(question);
      const summary = await summarizeResults(question, queryResult);
      return summary;
    },
    {
      name: 'query_salesforce',
      description: '복잡한 Salesforce 질문 처리: 통계, 분석, 팀별 현황, 특정 조건 조회 등 다른 도구로 처리할 수 없는 질문에 자연어로 SOQL을 생성해서 실행합니다.',
      schema: z.object({
        question: z.string().describe('사용자의 질문 (자연어)'),
      }),
    }
  );
}

module.exports = { createQuerySalesforceTool };
