/**
 * 자주 쓰는 질문 → 고정 SOQL 쿼리
 * LLM 없이 바로 실행
 */

const FIXED_QUERIES = [
  {
    patterns: ['이번달 오인입', '이번달 오인입 건수', '오인입 몇건'],
    queries: [
      "SELECT COUNT() FROM Lead WHERE Status = '종료' AND LossReason__c = '오인입' AND CreatedDate = THIS_MONTH",
    ],
  },
  {
    patterns: ['이번달 리드 건수', '이번달 lead 건수', '이번달 신규 리드'],
    queries: [
      "SELECT COUNT() FROM Lead WHERE CreatedDate = THIS_MONTH",
    ],
  },
  {
    patterns: ['저번달 리드 건수', '지난달 리드 건수', '지난달 lead'],
    queries: [
      "SELECT COUNT() FROM Lead WHERE CreatedDate = LAST_MONTH",
    ],
  },
  {
    patterns: ['이번달 lead 소개', '이번달 리드 소개', '이번달 파트너사 리드'],
    queries: [
      "SELECT Name, Company, Status, PartnerName__r.Name, CreatedDate FROM Lead WHERE PartnerName__c != null AND CreatedDate = THIS_MONTH ORDER BY PartnerName__r.Name LIMIT 200",
    ],
  },
  {
    patterns: ['lead 안 준 파트너', 'lead 안준 파트너', '리드 안 준 파트너', '리드 안준 파트너'],
    queries: [
      "SELECT Id, Name FROM Account WHERE fm_RecordTypeDeveloperName__c = 'Partner' LIMIT 200",
      "SELECT PartnerName__c, PartnerName__r.Name FROM Lead WHERE PartnerName__c != null AND CreatedDate >= 2026-01-01T00:00:00Z LIMIT 200",
    ],
  },
  {
    patterns: ['이번달 종료건', '이번달 종료 건수'],
    queries: [
      "SELECT COUNT() FROM Lead WHERE Status = '종료' AND CreatedDate = THIS_MONTH",
    ],
  },
  {
    patterns: ['오늘 방문', '오늘 방문 일정', '오늘 방문 상담'],
    queries: [
      "SELECT Name, User__r.Name, Opportunity__r.Name, Visit_Status__c, LocalInviteDate__c FROM Visit__c WHERE DAY_ONLY(LocalInviteDate__c) = TODAY ORDER BY LocalInviteDate__c ASC LIMIT 50",
    ],
  },
  {
    patterns: ['이번주 방문', '이번주 방문 일정'],
    queries: [
      "SELECT Name, User__r.Name, Opportunity__r.Name, Visit_Status__c, LocalInviteDate__c FROM Visit__c WHERE DAY_ONLY(LocalInviteDate__c) >= THIS_WEEK ORDER BY LocalInviteDate__c ASC LIMIT 50",
    ],
  },
  {
    patterns: ['cw 미진행', 'closed won 미진행', '미진행 영업기회'],
    queries: [
      "SELECT Name, StageName, Owner.Name, Account.Name, CloseDate FROM Opportunity WHERE IsClosed = false ORDER BY CloseDate ASC LIMIT 50",
    ],
  },
  {
    patterns: ['오늘 설치', '오늘 설치 일정', '오늘 설치 현황'],
    queries: [
      "SELECT Name, Account__r.Name, InstallationDate__c, InstallationType__c, InstallationStage__c, InstallationStatus__c, Owner.Name, ServiceTerritory__r.Name, Opportunity__r.Name, NumbeofTablets__c FROM Installation__c WHERE InstallationDate__c = TODAY ORDER BY Account__r.Name LIMIT 50",
    ],
  },
  {
    patterns: ['내일 설치', '내일 설치 일정', '내일 설치 현황'],
    queries: [
      "SELECT Name, Account__r.Name, InstallationDate__c, InstallationType__c, InstallationStage__c, InstallationStatus__c, Owner.Name, ServiceTerritory__r.Name, Opportunity__r.Name, NumbeofTablets__c FROM Installation__c WHERE InstallationDate__c = TOMORROW ORDER BY Account__r.Name LIMIT 50",
    ],
  },
  {
    patterns: ['이번주 설치', '이번주 설치 일정'],
    queries: [
      "SELECT Name, Account__r.Name, InstallationDate__c, InstallationType__c, InstallationStage__c, Owner.Name, ServiceTerritory__r.Name, NumbeofTablets__c FROM Installation__c WHERE InstallationDate__c = THIS_WEEK ORDER BY InstallationDate__c LIMIT 100",
    ],
  },
  {
    patterns: ['활성 매장 수', '활성 매장 건수', '활성매장'],
    queries: [
      "SELECT COUNT() FROM Account WHERE OperationStatus__c = 'ACTIVE'",
    ],
  },
  {
    patterns: ['am 미팅', 'ae 미팅', 'am/ae 미팅', 'ae/am 미팅', 'am ae 미팅'],
    queries: [
      "SELECT Id, Name, Team__c FROM User WHERE Department IN ('채널세일즈팀','채널세일즈') AND Team__c IN ('AM','AE','AE/AM') AND IsActive = true",
      "SELECT Subject, Owner.Name, OwnerId, Account.Name, ActivityDate, StartDateTime, EndDateTime FROM Event WHERE OwnerId IN ({USER_IDS}) AND ActivityDate = THIS_MONTH ORDER BY ActivityDate, StartDateTime LIMIT 200",
    ],
  },
];

/**
 * 질문이 고정 쿼리에 매칭되는지 확인
 * @returns 매칭된 쿼리 배열 or null
 */
function matchFixedQuery(question) {
  const q = question.toLowerCase().replace(/\s+/g, ' ').trim();

  for (const fq of FIXED_QUERIES) {
    for (const pattern of fq.patterns) {
      if (q.includes(pattern.toLowerCase())) {
        console.log(`[고정 쿼리] "${pattern}" 매칭`);
        return fq.queries;
      }
    }
  }
  return null;
}

module.exports = { matchFixedQuery, FIXED_QUERIES };
