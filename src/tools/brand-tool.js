/**
 * LangChain Tool: 브랜드 현황 조회
 * 기존 모듈: search-brand.js (getBrandSummary), format.js (formatBrandSummary)
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { getBrandSummary } = require('../search-brand');
const { formatBrandSummary } = require('../format');

const brandTool = tool(
  async ({ brandName }) => {
    const data = await getBrandSummary(brandName);

    if (!data || data.branchCount === 0) {
      return JSON.stringify({
        text: `"${brandName}" 브랜드 정보를 찾을 수 없습니다.`,
        blocks: [],
      });
    }

    const { blocks } = formatBrandSummary(data);

    return JSON.stringify({
      blocks,
      text: `${brandName} 브랜드 현황: ${data.branchCount}개 지점, 총 ${data.totalCurrent}대 태블릿`,
    });
  },
  {
    name: 'brand',
    description:
      '브랜드(프랜차이즈) 전체 현황을 조회합니다. 지점별 태블릿 수, 계약 정보, 운영 상태를 Block Kit 형식으로 보여줍니다. ' +
      '"OO 브랜드 현황", "OO 몇 대", "OO 지점별 현황", "OO 전체 매장" 등의 질문에 사용합니다. ' +
      '이 Tool은 Block Kit JSON 문자열을 반환합니다 (다른 Tool과 다르게 JSON.parse해서 say()에 전달). ' +
      '조회 필드 - Account: Name(상호), ContractTabletQuantity__c(총 계약 태블릿), ActivableTabletNumber__c(활성화 가능 태블릿), OperationStatus__c(운영상태) / ' +
      'Contract__c: ContractType__c(계약유형), ContractDateStart__c(시작일), ContractDateEnd__c(만료일) / ' +
      'Opportunity: Name(이름에 유형 포함 - 신규/재계약/양도양수/추가설치), StageName',
    schema: z.object({
      brandName: z.string().describe('조회할 브랜드(프랜차이즈) 이름 (예: 맥도날드, BBQ, 교촌치킨)'),
    }),
  }
);

module.exports = { brandTool };
