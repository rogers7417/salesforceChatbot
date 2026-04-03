/**
 * Tool: get_brand_summary
 * 브랜드별 태블릿 현황 조회
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getBrandSummary } = require('../search-brand');

function createGetBrandSummaryTool() {
  return tool(
    async ({ brandName }) => {
      const result = await getBrandSummary(brandName);
      return JSON.stringify(result);
    },
    {
      name: 'get_brand_summary',
      description: '브랜드 현황 조회: 브랜드명으로 설치 대수, 지점별 태블릿 현황, 계약 정보를 조회합니다.',
      schema: z.object({
        brandName: z.string().describe('브랜드명 (예: 교촌치킨, 빽다방)'),
      }),
    }
  );
}

module.exports = { createGetBrandSummaryTool };
