/**
 * 브랜드 전체 현황 조회 (Account 기준 태블릿 수)
 */
const { getSalesforceToken, soqlQuery } = require('./salesforce');

async function getBrandSummary(brandName) {
  const { accessToken, instanceUrl } = await getSalesforceToken();

  // Account에서 태블릿 운영 정보 + Opportunity로 유형 파악
  const accountQuery = `
    SELECT Id, Name,
      ContractTabletQuantity__c, ContractOrderTabletQuantity__c,
      ContractMasterTabletQuantity__c, ActivableTabletNumber__c,
      OperationStatus__c
    FROM Account
    WHERE Name LIKE '%${brandName}%'
      AND ActivableTabletNumber__c > 0
    ORDER BY ContractTabletQuantity__c DESC
  `.replace(/\s+/g, ' ').trim();

  // 계약 정보 (계약서명완료 건만)
  const contractQuery = `
    SELECT Name, ContractType__c, ContractDateStart__c, ContractDateEnd__c
    FROM Contract__c
    WHERE Account__r.Name LIKE '%${brandName}%'
      AND ContractStatus__c = '계약서명완료'
    ORDER BY ContractDateStart__c DESC
  `.replace(/\s+/g, ' ').trim();

  // 영업기회 (유형 파악용 - 지점명은 Opp Name에 있음)
  const oppQuery = `
    SELECT Name, StageName, Account.Name, AccountId
    FROM Opportunity
    WHERE Account.Name LIKE '%${brandName}%'
      AND StageName = 'Closed Won'
    ORDER BY CloseDate DESC
  `.replace(/\s+/g, ' ').trim();

  const [accountResult, contractResult, oppResult] = await Promise.all([
    soqlQuery(instanceUrl, accessToken, accountQuery),
    soqlQuery(instanceUrl, accessToken, contractQuery),
    soqlQuery(instanceUrl, accessToken, oppQuery),
  ]);

  const accounts = accountResult.records || [];
  const contracts = contractResult.records || [];
  const opps = oppResult.records || [];

  // Account별 영업기회 유형 매핑
  const oppTypeMap = {};  // accountId → [유형들]
  opps.forEach(o => {
    const accId = o.AccountId;
    if (!oppTypeMap[accId]) oppTypeMap[accId] = [];
    let type = '신규';
    if (o.Name.includes('재계약')) type = '재계약';
    else if (o.Name.includes('양도양수')) type = '양도양수';
    else if (o.Name.includes('추가설치')) type = '추가설치';
    if (!oppTypeMap[accId].includes(type)) oppTypeMap[accId].push(type);
  });

  // 지점별 데이터 구성
  const branches = {};
  let totalCurrent = 0;

  accounts.forEach(a => {
    // 지점명은 Opp Name에서 추출 (Account Name은 브랜드명만)
    // Opp에서 이 Account의 지점명 찾기
    const accOpps = opps.filter(o => o.AccountId === a.Id);
    let branchName = a.Name;
    if (accOpps.length > 0) {
      const match = accOpps[0].Name.match(/^(.+?)_/);
      if (match) branchName = match[1];
    }

    const current = a.ActivableTabletNumber__c || 0;
    const types = oppTypeMap[a.Id] || ['신규'];

    // 계약 매칭
    let contract = null;
    for (const c of contracts) {
      if (c.Name.includes(branchName)) {
        contract = {
          type: c.ContractType__c,
          start: c.ContractDateStart__c,
          end: c.ContractDateEnd__c,
        };
        break;
      }
    }

    branches[branchName] = {
      current,
      active: a.ActivableTabletNumber__c || 0,
      master: a.ContractMasterTabletQuantity__c || 0,
      order: a.ContractOrderTabletQuantity__c || 0,
      status: a.OperationStatus__c || '-',
      types,
      contract,
    };

    totalCurrent += current;
  });

  return {
    brandName,
    totalCurrent,
    branchCount: Object.keys(branches).length,
    branches,
  };
}

module.exports = { getBrandSummary };
