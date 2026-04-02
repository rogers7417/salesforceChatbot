# Salesforce 스키마 (SOQL 작성용)

## User (사용자)
- Id, Name, Email, Department (부서), Team__c (직무: AE, AM, TM, 백오피스 등)
- SlackMemberID__c (Slack ID), IsActive
- Department 값: 인바운드세일즈, 채널세일즈팀, 채널세일즈, 채널매니지먼트

## Account (거래처/매장)
- Id, Name (상호), OwnerId → User
- Phone, CreatedDate
- MOUstartdate__c (MOU시작일), MOUenddate__c (MOU만료일), MOU_ContractDate__c (MOU제휴일)
- 주의: MOU_Date__c 필드는 존재하지 않음 (사용 금지)
- fm_RecordTypeDeveloperName__c (레코드 유형: 'Partner'=파트너사, 'FRBrand'=프랜차이즈본사, 그 외=일반매장)
- PartnerType__c (파트너사 사업자 구분: 사업자, 개인)
- AccountPartner__c → Account (소개 파트너사)
- HQ_Partner__c → Account (연관 파트너사/FR본사)
- PartnerTorderStoreQty__c (소개한 티오더 매장 수)
- 주의: PartnerStatus__c 필드는 존재하지 않음 (사용 금지)
- ContractTabletQuantity__c (총 계약 태블릿 수)
- ContractOrderTabletQuantity__c (계약 오더태블릿 수)
- ContractMasterTabletQuantity__c (계약 마스터태블릿 수)
- ActivableTabletNumber__c (활성화 가능 태블릿 대수)
- OperationStatus__c (운영 상태: ACTIVE 등)

## Lead (잠재고객)
- Id, Name, Company (회사), Status (상태)
- OwnerId → User, Owner.Name
- Phone, Email, CreatedDate
- IsConverted (전환여부)
- LossReason__c (취소사유), LossReasonDetail__c (취소사유 상세)
- LossReason_Contract__c (취소사유 세부항목)
- HoldReason__c (보류 사유)
- Status 값: 리터치예정, 종료, Qualified, 담당자 배정, 고민중, 배정대기, 부재중, 장기부재, 연락 완료
- LossReason__c 값: 오인입, 중복유입, 프랜차이즈본사문의, 부서이관, 파트너스 전달, 장기부재, 오생성, 추가설치, 기고객상담
- PartnerName__c → Account (소개 파트너사)
- LeadSource (유입경로)
- PartnerName__r.Name 으로 파트너사명 조회 가능

## Opportunity (영업기회)
- Id, Name, StageName (단계), Amount (금액)
- CloseDate (마감일), OwnerId → User, Owner.Name
- AccountId → Account, Account.Name
- IsClosed, IsWon, CreatedDate
- StageName 값: 방문배정, 설치진행, Closed Won, Closed Lost 등
- Name에 유형 포함: (신규), (재계약), (양도양수), (추가설치)
- Loss_Reason__c (취소사유), Loss_Reason_Oppt__c, Loss_Reason_Detail__c
- FieldUser__c → User (필드세일즈 담당), BOUser__c → User (BO 담당)
- AgeInDays (경과일), SalesInviteDate__c (영업초대일)
- InstallHopeDate__c (설치희망일), AdvancePaymentDate__c (선납일)
- fm_CompanyStatus__c (매장상태), RecordType.Name (레코드유형명)
- LeadSource (유입경로)

## Quote (견적)
- Id, Name (견적서 이름), Status (상태)
- OpportunityId → Opportunity, AccountId → Account
- ExpirationDate (만료 일자)
- ru_TotalAmounts__c (총 약정금액), ru_FinalTotalAmount__c (최종 총금액)
- PaymentTypeQuote__c (납부방법), DepositType__c (입금구분)
- ru_MITotalAmount__c (월 할부금), ru_APTotalAmount__c (선납금 총금액)

## QuoteLineItem (견적서 행 아이템)
- Id, QuoteId → Quote, Product2Id → Product2
- Quantity (수량), TotalAmount__c (총 약정금액)
- TabletType__c (구분), TabletPaymentType__c (결제 여부)
- PaymentTypeQuote__c (납부방법)

## Event (이벤트/미팅)
- Id, Subject (제목), Type (유형)
- OwnerId → User, Owner.Name
- 주의: Event에서 Owner.Team__c, Owner.Department 등 User 커스텀 필드 직접 접근 불가!
  → 팀별 미팅 조회는 Visit__c 사용 (User__r.Team__c 접근 가능)
- AccountId → Account, Account.Name
- WhoId → Contact/Lead, Who.Name
- ActivityDate (날짜), StartDateTime, EndDateTime
- SOQL 날짜 리터럴: TODAY, YESTERDAY, THIS_WEEK, LAST_WEEK, NEXT_WEEK, THIS_MONTH, LAST_MONTH, NEXT_MONTH
- 날짜 필터 예시: CreatedDate = THIS_MONTH, ActivityDate = TODAY
- CreatedDate, LastModifiedDate는 datetime 타입 → 특정 날짜 비교 시 반드시 T00:00:00Z 붙이기
  예: CreatedDate >= 2026-01-01T00:00:00Z (O)
  예: CreatedDate >= 2026-01-01 (X, 에러남)
- ActivityDate, CloseDate 등 date 타입은 날짜만 사용: ActivityDate = 2026-01-01 (O)
- CALENDAR_MONTH, CALENDAR_YEAR 등 함수 사용 금지 → 대신 날짜 리터럴 사용

## Task (활동/과업)
- Id, Subject (제목), Status (상태), Type (유형)
- OwnerId → User, Owner.Name
- AccountId → Account, WhoId → Contact/Lead
- ActivityDate, CreatedDate
- Status 값: Not Started, In Progress, Completed

## Visit__c (방문)
- Id, Name (방문명), OwnerId → User
- Opportunity__c → Opportunity (영업기회)
- User__c → User (방문담당자)
- LocalInviteDate__c (방문일정), VisitAssignmentDate__c (방문담당자 배정일자)
- Visit_Status__c (방문 상태)
- ConselStart__c (상담시작), ConselEnd__c (상담종료), Realtime__c (실시간)
- IsVisitComplete__c (방문완료 여부)

## Case (문의사항)
- Id, CaseNumber, Subject (제목), Status (상태)
- AccountId → Account, ContactId → Contact
- OwnerId → User, Opportunity__c → Opportunity
- Type (1차 유형), Type2__c (2차 유형), Type3__c (3차 유형)
- CaseType__c (문의사항 유형), CaseType_Detail__c (사례 유형 상세)
- ClosedDate (마감 일자), CreatedDate
- TransferStatus__c (이관 상태)

## Contract__c (계약)
- Id, Name (계약명), Account__c → Account (상호)
- ContractType__c (계약유형: 신규, 재계약(HW), 재계약(SW), 재계약(AS), 양도양수, 추가)
- ContractStatus__c (계약상태: 계약서명완료, 계약만료, 요청취소, 계약해지, 양도양수)
- ContractDateStart__c (계약시작일), ContractDateEnd__c (계약만료일)
- Service_StartDate__c (서비스 시작일), Service_EndDate__c (서비스 만료일)
- ContractOwner__c → User (계약 담당자)
- Opportunity__c → Opportunity (영업기회)
- TotalAmount__c (총 약정금액), TotalTablet__c (최종 총 태블릿대수)
- PaymentType__c (납부방법), BillingStatus__c (청구 상태)
- OperationStatus__c (운영 상태)

## Installation__c (설치)
- Id, Name (설치번호), Account__c → Account (상호)
- Opportunity__c → Opportunity (관련 영업기회)
- Order__c → Order (출고 정보)
- InstallationType__c (설치 유형), InstallationStage__c (진행 상태)
- InstallationStatus__c (방문 진행상태)
- InstallationDate__c (설치 요청일자), CompletedDate__c (설치완료일)
- VisitDate__c (방문일자)
- NumbeofTablets__c (태블릿 수)
- ServiceTerritory__c → ServiceTerritory (설치 업체)
- Case__c → Case (문의사항)

## Order (출고)
- Id, Name, Status (진행상태), OrderNumber
- AccountId → Account, OpportunityId → Opportunity
- OwnerId → User
- Brand_Branch__c (상호/지점명), OutputDate__c (출고일자)
- ru_ItemQty__c (총 제품 개수), MasterTabletAmount__c (마스터 태블릿 수량)
- InstallConfirmedDate__c (설치 확정일자)
- Status 값: 출고신청서작성, 출고완료

## OrderItem (출고 품목)
- Id, OrderId → Order, Product2Id → Product2
- Quantity (수량), fm_ProductFamily__c (제품군: 태블릿, 충전기&케이블, 거치대, 공유기 등)
- InstalledQuantity__c (설치 수량)

## WorkOrder (작업 주문)
- Id, WorkOrderNumber, Status (상태), OwnerId → User
- AccountId → Account, OpportunityName__c → Opportunity
- Installation__c → Installation__c (설치)
- CaseId → Case (문의사항)
- WorkOrderType__c (작업 주문 유형), ASType1__c (1차 분류), ASType2__c (2차 분류)
- NumbeofTablets__c (태블릿 수)
- StartDate (작업 확정 일자), EndDate (마감 일자)
- fm_InstallationDate__c (설치 요청일자)
- BOUser__c → User (담당자), ITOwner__c → User (연동 담당자)
- ServiceTerritoryId → ServiceTerritory (업체)
- TerminationType__c (종료 유형)

## ServiceAppointment (서비스 약속)
- Id, Status (상태), OwnerId → User
- ParentRecordId → WorkOrder/Account/Case 등 (상위 레코드)
- AccountId → Account, ServiceTerritoryId → ServiceTerritory
- DueDate (기한)
- WorkOrder__c → WorkOrder
- fm_InstallConfirmedDate__c (설치 요청일자)
- InstallTime__c (설치시간)

## Asset (자산/장비)
- Id, Name (자산 이름), Status (상태)
- AccountId → Account, Product2Id → Product2
- Opportunity__c → Opportunity, Installation__c → Installation__c
- WorkOrder__c → WorkOrder, OrderItem__c → OrderItem
- InstallDate (설치 날짜), UsageEndDate (사용 종료 날짜)
- ASEndDate__c (A/S 만료일)

## ITService__c (IT서비스)
- Id, Name (순번), OwnerId → User
- Related__c → Opportunity (관련 영업기회)
- ConnectionPerson__c → User (연동담당자)
- ProcessingStatus__c (연동처리여부), Type__c (유형)

## 관계
- Account ← Lead (Company LIKE), Opportunity (AccountId), Order (AccountId), Event (AccountId), Case (AccountId), Contract__c (Account__c), Installation__c (Account__c), Visit__c (via Opportunity)
- Opportunity ← Quote (OpportunityId), Visit__c (Opportunity__c), Contract__c (Opportunity__c), Installation__c (Opportunity__c), Case (Opportunity__c)
- User ← Lead/Opportunity/Event/Order/Task (OwnerId), Visit__c (User__c)
- Order ← OrderItem (OrderId), Installation__c (Order__c)
- Installation__c ← WorkOrder (Installation__c), Asset (Installation__c)
- WorkOrder ← ServiceAppointment (WorkOrder__c)

## 업무 용어
- "오인입" = Lead에서 Status='종료' AND LossReason__c='오인입'
- "종료건" = Lead에서 Status='종료'
- "계류건" = Lead에서 Status NOT IN ('종료')
- "CW" 또는 "Closed Won" = Opportunity에서 StageName='Closed Won'
- "CW 미진행" = Opportunity에서 StageName != 'Closed Won' AND IsClosed = false
- "활성 매장" = Account에서 OperationStatus__c = 'ACTIVE'
- "파트너사" = Account에서 fm_RecordTypeDeveloperName__c = 'Partner'
- "프랜차이즈" = Account에서 fm_RecordTypeDeveloperName__c = 'FRBrand'
- "파트너사가 소개한 Lead" = Lead에서 PartnerName__r.Name LIKE '%파트너사명%'
- 파트너사-Lead 조회 시 서브쿼리 사용 금지 → Lead에서 직접 조회
  예: SELECT Name, Company, Status, PartnerName__r.Name FROM Lead WHERE PartnerName__r.Name LIKE '%파트너사명%' AND CreatedDate = THIS_MONTH
- "이번달 Lead 소개한 파트너사" → Lead에서 PartnerName__c != null AND CreatedDate = THIS_MONTH 조회
- "Lead 안 준 파트너사" → 전체 파트너사 목록과 Lead 소개 파트너사를 각각 조회, 앱에서 비교

## 조직 구조 (User의 Department + Team__c)
- 인바운드세일즈: 인사이드세일즈, 필드세일즈, 백오피스, 영업지원, 정산
- 아웃바운드세일즈: 필드세일즈, 백오피스, TM
- 채널세일즈: AE, AM, 팀장
- 채널매니지먼트: TM, 백오피스, 채널거버넌스
- 리텐션: 필드세일즈, 백오피스, TM
- "인사이드필드" = Department='인바운드세일즈' AND Team__c IN ('인사이드세일즈','필드세일즈')
- "채널AE/AM" = Department IN ('채널세일즈','채널세일즈팀') AND Team__c IN ('AE','AM','AE/AM')
- "채널TM" = Department='채널매니지먼트' AND Team__c='TM'
- "채널BO" = Department='채널매니지먼트' AND Team__c='백오피스'
- "방문 상담", "방문 일정" = Visit__c에서 조회 (Event가 아님!)
- "방문" 관련 질문은 항상 Visit__c 사용
중요! 설치 vs 방문 구분:
- "설치" = Installation__c 사용 (절대 Visit__c 아님!)
  예: "오늘 설치 일정" → SELECT ... FROM Installation__c WHERE InstallationDate__c = TODAY
  예: "설치 현황" → SELECT ... FROM Installation__c WHERE ...
- "방문" = Visit__c 사용 (절대 Installation__c 아님!)
  예: "오늘 방문 일정" → SELECT ... FROM Visit__c WHERE DAY_ONLY(LocalInviteDate__c) = TODAY
- "작업", "AS" = WorkOrder 사용
- 키워드 매핑: 설치→Installation__c, 방문→Visit__c, 작업/AS→WorkOrder
- Visit__c 날짜 필터: DAY_ONLY(LocalInviteDate__c) = TODAY
- Visit__c 상태 값: 배정완료, 방문완료, 방문취소 등
