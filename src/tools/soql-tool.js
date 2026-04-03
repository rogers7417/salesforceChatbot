/**
 * LangChain Tool: 자유 질문 → SOQL 변환 실행
 * 기존 모듈: soql-generator.js (generateAndExecute, summarizeResults)
 */
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const { generateAndExecute, summarizeResults } = require('../soql-generator');

const soqlTool = tool(
  async ({ question, history }) => {
    const historyMessages = [];
    if (history) {
      historyMessages.push({ role: 'user', content: history });
    }

    const queryResults = await generateAndExecute(question, historyMessages);

    const hasData = queryResults.results?.some(
      r => r.success && (r.records?.length > 0 || r.totalSize > 0)
    );

    if (!hasData && queryResults.results?.every(r => !r.success)) {
      const errors = queryResults.results.map(r => r.error).filter(Boolean).join(', ');
      return `질문을 처리하지 못했습니다. SOQL 변환/실행 중 오류가 발생했습니다: ${errors || '알 수 없는 오류'}`;
    }

    const summary = await summarizeResults(question, queryResults);
    return summary;
  },
  {
    name: 'soql',
    description:
      '자유로운 질문을 Salesforce SOQL 쿼리로 변환하여 실행하고 결과를 요약합니다. ' +
      '다른 Tool로 처리할 수 없는 복잡한 질문이나 통계/분석 질문에 사용합니다. ' +
      '"이번달 리드 몇 건", "CW 전환율", "팀별 영업기회", "지난달 대비 실적", "파트너사별 리드 수" 등의 질문에 사용합니다. ' +
      '후속 질문("그 중에", "거기서", "전환은?")의 경우 history에 이전 대화 내용을 전달하세요. ' +
      '사용 가능한 전체 스키마 (schema-for-llm.md 기반): ' +
      'Account(Name,OwnerId,Phone,MOUstartdate__c,OperationStatus__c,fm_RecordTypeDeveloperName__c,PartnerType__c,ContractTabletQuantity__c,ActivableTabletNumber__c), ' +
      'Lead(Name,Company,Status,OwnerId,Phone,Email,IsConverted,LossReason__c,HoldReason__c,PartnerName__c,LeadSource), ' +
      'Opportunity(Name,StageName,Amount,CloseDate,OwnerId,AccountId,IsClosed,IsWon,Loss_Reason__c,FieldUser__c,BOUser__c,LeadSource), ' +
      'Quote(Name,Status,OpportunityId,AccountId,ru_TotalAmounts__c,ru_FinalTotalAmount__c,PaymentTypeQuote__c), ' +
      'Event(Subject,Type,OwnerId,AccountId,ActivityDate,StartDateTime,EndDateTime), ' +
      'Task(Subject,Status,Type,OwnerId,AccountId,ActivityDate), ' +
      'Visit__c(Name,User__c,Opportunity__c,LocalInviteDate__c,Visit_Status__c,IsVisitComplete__c), ' +
      'Contract__c(Name,Account__c,ContractType__c,ContractStatus__c,ContractDateStart__c,ContractDateEnd__c,TotalAmount__c,TotalTablet__c), ' +
      'Installation__c(Name,Account__c,InstallationType__c,InstallationStage__c,InstallationDate__c,CompletedDate__c,ServiceTerritory__c,NumbeofTablets__c), ' +
      'Order(Name,Status,AccountId,OutputDate__c,ru_ItemQty__c), ' +
      'WorkOrder(WorkOrderNumber,Status,AccountId,WorkOrderType__c,ASType1__c,StartDate,ServiceTerritoryId), ' +
      'Case(CaseNumber,Subject,Status,AccountId,Type,ClosedDate)',
    schema: z.object({
      question: z.string().describe('사용자의 자연어 질문 (예: "이번달 신규 리드 몇 건이야?")'),
      history: z
        .string()
        .optional()
        .describe('이전 대화 컨텍스트. 후속 질문인 경우 이전 질문과 결과를 포함한 문자열'),
    }),
  }
);

module.exports = { soqlTool };
