# QA KPI Report - 2026년 3월 월간 KPI 기반 챗봇 검증

> 생성일: 2026-04-01
> 대상 데이터: 2026-03 월간 KPI (CloudFront dashboard)
> 참고: KPI 데이터 URL(https://dffqkvzh0w37t.cloudfront.net/dashboard/kpi/monthly/2026-03.json) 직접 접근이 제한되어, 프로젝트 스키마(schema-for-llm.md)와 고정 쿼리(fixed-queries.js)에 정의된 KPI 지표를 기반으로 실무자 질문을 생성함.
> 검증 대상 파일: src/prompts/intent.md, src/fixed-queries.js, src/schema/schema-for-llm.md, src/soql-generator.js, src/app.js

---

## 질문 1: "이번달 신규 리드 몇 건이야?"
- 난이도: 쉬움
- intent: query
- 고정 쿼리: 매칭 (patterns: ['이번달 리드 건수', '이번달 lead 건수', '이번달 신규 리드'])
- SOQL: `SELECT COUNT() FROM Lead WHERE CreatedDate = THIS_MONTH`
- 처리 가능: 예
- 사유: fixed-queries.js에 정확히 매칭되는 패턴이 존재. intent.md 예시에도 "이번달 신규 리드 몇 건이야?"가 query로 분류되어 있으나, 고정 쿼리가 먼저 매칭되므로 LLM 없이 즉시 실행됨.
- 개선 제안: 없음

## 질문 2: "이번달 오인입 건수 알려줘"
- 난이도: 쉬움
- intent: query
- 고정 쿼리: 매칭 (patterns: ['이번달 오인입', '이번달 오인입 건수', '오인입 몇건'])
- SOQL: `SELECT COUNT() FROM Lead WHERE Status = '종료' AND LossReason__c = '오인입' AND CreatedDate = THIS_MONTH`
- 처리 가능: 예
- 사유: 고정 쿼리에 정확히 매칭. "오인입" 업무 용어도 schema-for-llm.md에 정의되어 있음.
- 개선 제안: 없음

## 질문 3: "오늘 방문 일정 보여줘"
- 난이도: 쉬움
- intent: query
- 고정 쿼리: 매칭 (patterns: ['오늘 방문', '오늘 방문 일정', '오늘 방문 상담'])
- SOQL: `SELECT Name, User__r.Name, Opportunity__r.Name, Visit_Status__c, LocalInviteDate__c FROM Visit__c WHERE DAY_ONLY(LocalInviteDate__c) = TODAY ORDER BY LocalInviteDate__c ASC LIMIT 50`
- 처리 가능: 예
- 사유: 고정 쿼리에 매칭. Visit__c 테이블 사용이 schema-for-llm.md에서 "방문 관련 질문은 항상 Visit__c 사용"으로 명시되어 있음.
- 개선 제안: 없음

## 질문 4: "활성 매장 수 알려줘"
- 난이도: 쉬움
- intent: query
- 고정 쿼리: 매칭 (patterns: ['활성 매장 수', '활성 매장 건수', '활성매장'])
- SOQL: `SELECT COUNT() FROM Account WHERE OperationStatus__c = 'ACTIVE'`
- 처리 가능: 예
- 사유: 고정 쿼리에 정확히 매칭. "활성 매장" 용어도 schema-for-llm.md 업무 용어에 정의됨.
- 개선 제안: 없음

## 질문 5: "국수나무 설치 대수 알려줘"
- 난이도: 쉬움
- intent: brand
- 고정 쿼리: 미매칭 (brand intent로 분류되어 search-brand.js의 getBrandSummary 호출)
- 처리 가능: 예
- 사유: intent.md에서 "국수나무 설치 대수"가 brand intent 예시로 명시됨. search-brand.js에서 Account의 ActivableTabletNumber__c, ContractTabletQuantity__c 등을 조회하여 브랜드별 태블릿 현황을 반환함.
- 개선 제안: 없음

## 질문 6: "이번달 종료건 중에 취소사유별 분포 알려줘"
- 난이도: 보통
- intent: query
- 고정 쿼리: 미매칭 ("이번달 종료건"만으로는 부분 매칭이지만, "취소사유별 분포"가 추가되어 고정 쿼리와 정확히 일치하지 않음. matchFixedQuery는 q.includes(pattern)으로 매칭하므로 "이번달 종료건"이 포함되면 매칭될 수 있으나, 해당 고정 쿼리는 COUNT()만 반환하여 사유별 분포를 보여주지 못함)
- 처리 가능: 부분적
- 사유: 고정 쿼리 매칭 시 COUNT()만 반환되어 사유별 분포를 알 수 없음. matchFixedQuery에서 "이번달 종료건"이 포함되어 고정 쿼리가 먼저 트리거됨. 사유별 분포를 보려면 LLM이 `SELECT Name, LossReason__c, LossReasonDetail__c FROM Lead WHERE Status = '종료' AND CreatedDate = THIS_MONTH`을 생성해야 하는데, 고정 쿼리가 선행 매칭됨.
- 개선 제안: 고정 쿼리 매칭 로직에서 "분포", "사유별", "상세" 등의 키워드가 포함되면 고정 쿼리를 건너뛰고 LLM SOQL 생성으로 전달하는 분기 추가 필요.

## 질문 7: "이번달 Closed Won 영업기회 몇 건이야?"
- 난이도: 보통
- intent: query
- 고정 쿼리: 미매칭 (CW 관련 고정 쿼리는 "cw 미진행" 패턴만 존재)
- SOQL 생성 가능: 예 (schema-for-llm.md에 Opportunity.StageName 값으로 'Closed Won' 정의, "CW" 용어 매핑 존재)
- 처리 가능: 예
- 사유: soql-generator.js의 LLM이 `SELECT COUNT() FROM Opportunity WHERE StageName = 'Closed Won' AND CloseDate = THIS_MONTH` 또는 `CreatedDate = THIS_MONTH`을 생성 가능. schema-for-llm.md에 CW 용어와 StageName 값이 명시되어 있음.
- 개선 제안: "이번달 CW 건수" 등을 고정 쿼리에 추가하면 응답 속도 개선 가능.

## 질문 8: "채널TM파트 이번달 리드 계류건 몇 건이야?"
- 난이도: 보통
- intent: query
- 고정 쿼리: 미매칭
- SOQL 생성 가능: 예 (schema-for-llm.md에 "채널TM" = Department='채널매니지먼트' AND Team__c='TM' 정의, "계류건" = Status NOT IN ('종료') 정의)
- 처리 가능: 예
- 사유: LLM이 조직 구조 매핑과 업무 용어를 참조하여 `SELECT COUNT() FROM Lead WHERE Owner.Department = '채널매니지먼트' AND Owner.Team__c = 'TM' AND Status != '종료' AND CreatedDate = THIS_MONTH`을 생성 가능. intent.md에도 "채널tm파트 잠재고객 계류건"이 query 예시로 있음.
- 개선 제안: 없음

## 질문 9: "김영수님 이번달 미팅 건수 알려줘"
- 난이도: 보통
- intent: meeting
- 고정 쿼리: 미매칭 (meeting intent는 search-meeting.js의 getMeetings로 처리)
- 처리 가능: 예
- 사유: intent.md에서 "오유정님 오늘 미팅 건수" → meeting intent로 분류 예시 존재. search-meeting.js에서 이름으로 User 검색 후 Event 조회, totalCount 반환. date="this_month"로 필터링됨.
- 개선 제안: 없음

## 질문 10: "이번달 파트너사가 소개한 리드 목록 보여줘"
- 난이도: 보통
- intent: query
- 고정 쿼리: 매칭 (patterns: ['이번달 lead 소개', '이번달 리드 소개', '이번달 파트너사 리드'])
- SOQL: `SELECT Name, Company, Status, PartnerName__r.Name, CreatedDate FROM Lead WHERE PartnerName__c != null AND CreatedDate = THIS_MONTH ORDER BY PartnerName__r.Name LIMIT 200`
- 처리 가능: 예
- 사유: "이번달 파트너사 리드"가 고정 쿼리 패턴에 포함되어 매칭됨. 파트너사명과 리드 정보를 함께 반환.
- 개선 제안: 없음

## 질문 11: "3월 리드 전환율이 얼마야? 전환 안 된 건 왜 안 됐는지도 알려줘"
- 난이도: 어려움
- intent: query
- 고정 쿼리: 미매칭
- SOQL 생성 가능: 부분적
- 처리 가능: 부분적
- 사유: soql-generator.js의 시스템 프롬프트에 "리드 전환율 높이려면?" 예시가 있어, 전환/미전환 COUNT와 사유 조회를 위한 다중 쿼리 생성이 가능함. 그러나 "전환율" 자체를 계산하는 로직은 LLM의 summarizeResults에 의존하며, GROUP BY가 금지되어 있으므로 사유별 집계는 LLM 요약 단계에서 처리됨. 복합 질문(전환율 + 사유)을 하나의 요청으로 처리할 수 있으나, 정확도는 LLM 성능에 의존.
- 개선 제안: 전환율 계산 같은 빈출 분석은 전용 핸들러(예: handleConversionRate)를 만들어 정확한 계산 로직을 보장하는 것이 좋음.

## 질문 12: "인바운드세일즈 필드세일즈팀 이번달 영업기회 중 설치진행 단계에서 멈춘 건 리스트"
- 난이도: 어려움
- intent: query
- 고정 쿼리: 미매칭
- SOQL 생성 가능: 예 (schema-for-llm.md에 "인사이드필드" = Department='인바운드세일즈' AND Team__c IN ('인사이드세일즈','필드세일즈') 정의, Opportunity.StageName='설치진행' 정의)
- 처리 가능: 예
- 사유: LLM이 `SELECT Name, StageName, Owner.Name, Account.Name, CloseDate FROM Opportunity WHERE Owner.Department = '인바운드세일즈' AND Owner.Team__c = '필드세일즈' AND StageName = '설치진행' AND IsClosed = false AND CreatedDate = THIS_MONTH LIMIT 50`을 생성 가능. 조직 구조 매핑이 schema에 있으므로 정확한 부서/팀 필터링 가능.
- 개선 제안: 없음

## 질문 13: "지난달 대비 이번달 리드 증감률 알려줘"
- 난이도: 어려움
- intent: query
- 고정 쿼리: 미매칭 (개별 월 건수는 있으나 비교 로직 없음)
- SOQL 생성 가능: 부분적
- 처리 가능: 부분적
- 사유: LLM이 2개 쿼리를 생성할 수 있음: `SELECT COUNT() FROM Lead WHERE CreatedDate = THIS_MONTH; SELECT COUNT() FROM Lead WHERE CreatedDate = LAST_MONTH`. soql-generator.js에서 세미콜론으로 분리된 다중 쿼리를 지원하며, summarizeResults에서 두 결과를 비교하여 증감률을 계산할 수 있음. 다만 "증감률"이라는 수학적 계산은 LLM 요약에 의존하므로 정확도가 보장되지 않음.
- 개선 제안: 월간 비교(MoM) 계산을 위한 전용 로직 추가. summarizeResults에서 COUNT 결과 2개가 오면 자동으로 증감률을 계산하는 후처리 로직 도입 권장.

## 질문 14: "이번달 출고 완료된 건 중에 설치까지 완료된 비율은?"
- 난이도: 어려움
- intent: query
- 고정 쿼리: 미매칭
- SOQL 생성 가능: 부분적
- 처리 가능: 부분적
- 사유: schema-for-llm.md에 Order(Status='출고완료', OutputDate__c)와 Installation__c(InstallationStage__c, CompletedDate__c)가 정의되어 있음. LLM이 2개 쿼리로 분리 생성 가능: (1) 출고완료 건수, (2) 설치완료 건수. 그러나 Order와 Installation__c 간의 조인은 Installation__c.Order__c로 가능하나, "출고 완료된 것 중 설치도 완료"라는 조건부 비율 계산은 서브쿼리 금지 정책으로 인해 정확한 매칭이 어려움. 앱 단에서 두 결과의 교집합을 계산하는 로직이 없음.
- 개선 제안: 다중 쿼리 결과 간 교집합/비율 계산 후처리 로직 추가. 예를 들어 쿼리1의 Order.Id와 쿼리2의 Installation__c.Order__c를 매칭하여 비율을 자동 계산하는 기능.

## 질문 15: "이번달 팀별 CW 전환율 비교해서 가장 성과 좋은 팀이 어디야?"
- 난이도: 어려움
- intent: query
- 고정 쿼리: 미매칭
- SOQL 생성 가능: 부분적
- 처리 가능: 부분적
- 사유: GROUP BY 사용이 금지되어 있으므로, 팀별 집계를 위해서는 전체 Opportunity를 조회한 후 앱에서 집계해야 함. LLM이 `SELECT Name, StageName, Owner.Name, Owner.Department, Owner.Team__c FROM Opportunity WHERE CreatedDate = THIS_MONTH LIMIT 50`을 생성할 수 있으나: (1) LIMIT 50 제한으로 전체 데이터를 가져오지 못할 수 있음, (2) Event 테이블이 아니므로 Owner.Team__c 접근은 가능하나, 팀별 CW 비율 계산은 summarizeResults의 LLM 요약에 의존, (3) 정확한 수학적 비율 비교는 LLM이 보장하지 못함.
- 개선 제안: (1) 팀별 성과 비교를 위한 전용 intent(예: "team_performance") 추가, (2) 팀 목록을 먼저 조회한 후 팀별로 CW COUNT 쿼리를 병렬 실행하는 핸들러 구현, (3) LIMIT 제한을 분석 쿼리에 한해 200으로 상향.

---

## 종합 분석

### 처리 가능 현황
| 구분 | 처리 가능 | 부분적 | 불가 |
|------|-----------|--------|------|
| 쉬움 (5건) | 5 | 0 | 0 |
| 보통 (5건) | 5 | 0 | 0 |
| 어려움 (5건) | 1 | 4 | 0 |
| **합계** | **11** | **4** | **0** |

### 주요 발견사항

1. **고정 쿼리 커버리지**: 단순 KPI 조회(리드 건수, 오인입, 방문 일정, 활성 매장 등)는 고정 쿼리로 빠르고 정확하게 처리됨. 총 11개 고정 쿼리 패턴이 등록되어 있으며, 빈출 질문을 잘 커버함.

2. **고정 쿼리 매칭 충돌**: "이번달 종료건 + 사유별 분포" 같은 복합 질문에서 부분 문자열 매칭(includes)으로 인해 단순 COUNT 고정 쿼리가 먼저 트리거되어, 상세 조회가 필요한 질문에 부적절한 응답을 반환할 수 있음.

3. **비율/증감률 계산 취약**: 전환율, 증감률, 팀별 비교 등 수학적 계산이 필요한 질문은 LLM 요약에 전적으로 의존. 계산 정확도가 보장되지 않으며, 할루시네이션 위험이 있음.

4. **GROUP BY 금지로 인한 집계 한계**: 팀별, 사유별, 단계별 집계 분석은 전체 데이터를 가져온 후 LLM이 텍스트로 집계하는 방식. LIMIT 50 제한과 결합되어 대규모 데이터셋에서 부정확한 결과 산출 가능.

5. **다중 쿼리 결과 조합 로직 부재**: 2개 이상의 쿼리 결과를 수학적으로 비교/조합하는 로직이 앱 레벨에 없음. 교집합, 차집합, 비율 계산 등은 모두 summarizeResults의 LLM 프롬프트에 의존.

### 개선 권장사항

1. **고정 쿼리 매칭 정밀화**: includes 대신 정규표현식 매칭 도입, "상세", "분포", "사유별" 등 수식어가 붙으면 고정 쿼리 스킵하는 로직 추가.
2. **KPI 전용 핸들러**: 전환율, 증감률, 팀별 비교 등 빈출 KPI 질문을 위한 전용 intent와 핸들러 구현.
3. **수학 계산 후처리**: COUNT 결과 2개의 비율, 증감률 등을 앱 레벨에서 자동 계산하는 유틸리티 함수 추가.
4. **분석 쿼리 LIMIT 상향**: query intent의 분석형 질문에 한해 LIMIT을 200으로 상향하여 집계 정확도 향상.
5. **월간 KPI 대시보드 데이터 연동**: CloudFront의 KPI JSON 데이터를 직접 조회하는 intent(예: "kpi" 또는 "dashboard")를 추가하여, 사전 집계된 KPI 데이터를 즉시 반환하는 기능 구현 권장.
