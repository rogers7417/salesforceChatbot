# QA 테스트 리포트

- 일시: 2026-04-01
- 대상: sales-chatbot (Salesforce + Slack 검색 챗봇)

---

## 테스트 1: 의도 분류 검증 (classifyIntent)

Claude Haiku 4.5 모델을 사용한 의도 분류 결과.

| # | 질문 | 예상 intent | 실제 결과 | 판정 |
|---|------|------------|-----------|------|
| 1 | 오늘 뭐해 | todo | `{"intent":"todo"}` | PASS |
| 2 | 노꼬치킨 현황 | search | `{"intent":"search","keyword":"노꼬치킨"}` | PASS |
| 3 | 국수나무 설치 대수 | brand | `{"intent":"search","keyword":"국수나무"}` | FAIL |
| 4 | 오유정 이번주 미팅 | meeting | `{"intent":"meeting","names":["오유정"],"date":"this_week"}` | PASS |
| 5 | 이번달 오인입 건수 | query | `{"intent":"query"}` | PASS |
| 6 | 문은기/정용현 다음달 미팅 | meeting | `{"intent":"meeting","names":["문은기","정용현"],"date":"next_month"}` | PASS |
| 7 | ae/am의 미팅일정 | query | `{"intent":"query"}` | PASS |
| 8 | 1월부터 Lead 안 준 파트너사 | query | `{"intent":"query"}` | PASS |
| 9 | 채널bo파트 cw 미진행 현황 | query | `{"intent":"query"}` | PASS |

**결과: 8/9 PASS (88.9%)**

### 이슈 분석

- **#3 "국수나무 설치 대수"**: "설치 대수"는 브랜드 전체 현황 질문이므로 `brand`로 분류되어야 하나, `search`로 분류됨. 프롬프트에 "설치 대수" 키워드가 brand 예시에 명시되어 있으나 모델이 매장명 검색으로 해석함. 프롬프트 보강 또는 few-shot 예시 추가 권장.

---

## 테스트 2: 고정 쿼리 매칭 검증 (matchFixedQuery)

패턴 기반 고정 쿼리 매칭 결과.

| # | 질문 | 예상 | 실제 결과 | 판정 |
|---|------|------|-----------|------|
| 1 | 이번달 오인입 건수 | MATCH | MATCHED (1쿼리) | PASS |
| 2 | 오늘 방문 일정 | MATCH | MATCHED (1쿼리) | PASS |
| 3 | am/ae 미팅 | MATCH | MATCHED (2쿼리) | PASS |
| 4 | 활성 매장 수 | MATCH | MATCHED (1쿼리) | PASS |
| 5 | 이번달 리드 건수 | MATCH | MATCHED (1쿼리) | PASS |
| 6 | 투파인드피터 브랜드 현황 | NO MATCH | NO MATCH | PASS |

**결과: 6/6 PASS (100%)**

### 분석

- 모든 고정 쿼리 패턴이 정상 작동.
- "투파인드피터 브랜드 현황"은 고정 쿼리에 등록되지 않은 질문이므로 NO MATCH가 정상 동작.

---

## 테스트 3: SOQL Validator 검증 (validateAndFix)

잘못된 SOQL 쿼리의 자동 수정 결과.

| # | 입력 쿼리 | 수정 결과 | 수정 내용 | 판정 |
|---|----------|-----------|-----------|------|
| 1 | `SELECT DISTINCT Name FROM Lead WHERE Status = 종료` | `SELECT Name FROM Lead WHERE Status = 종료` | DISTINCT 제거 | PASS |
| 2 | `SELECT COUNT() Lead WHERE CreatedDate = THIS_MONTH` | `SELECT COUNT() FROM Lead WHERE CreatedDate = THIS_MONTH` | FROM 누락 수정 | PASS |
| 3 | `SELECT Id, Name, Id FROM Account LIMIT 10` | `SELECT Id, Name FROM Account LIMIT 10` | 중복 필드 제거 | PASS |
| 4 | `SELECT COUNT() cnt FROM Lead WHERE Status = 종료` | `SELECT COUNT() FROM Lead WHERE Status = 종료` | COUNT() alias 제거 | PASS |
| 5 | `SELECT Name FROM Account a WHERE a.Name LIKE test` | `SELECT Name FROM Account WHERE a.Name LIKE test` | alias "a" 제거 (불완전) | FAIL |
| 6 | `SELECT Owner.Team__c FROM Event WHERE ActivityDate = TODAY` | `SELECT FROM Event WHERE ActivityDate = TODAY` | Owner 커스텀 필드 제거 (SELECT 비어짐) | FAIL |

**결과: 4/6 PASS (66.7%)**

### 이슈 분석

- **#5 alias 제거 불완전**: `FROM Account a`에서 alias "a"를 제거했으나, WHERE 절의 `a.Name`이 `Name`으로 치환되지 않음. 원인: alias 치환 로직(`fixed = fixed.replace(aliasPattern, '')`)이 `FROM` replace 콜백 내부에서 실행되지만, 이 시점에서 `fixed`가 아직 원래 값을 참조하고 있어 콜백의 반환값과 내부 치환이 충돌함. 정규식 replace 콜백 내에서 `fixed` 변수를 직접 수정하는 것은 예측 불가능한 동작을 유발.
  - **권장 수정**: alias 감지와 치환을 2단계로 분리. 먼저 alias를 파싱한 후, 별도 단계에서 `alias.field` -> `field` 치환 수행.

- **#6 SELECT 절이 비어짐**: `Owner.Team__c`가 Event의 유일한 SELECT 필드인데 제거 후 `SELECT FROM Event`가 됨. SELECT 절이 비어지면 쿼리 자체가 유효하지 않음.
  - **권장 수정**: Owner 커스텀 필드 제거 후 SELECT 필드가 비어있으면 `SELECT Id` 등의 기본 필드를 추가하는 폴백 로직 필요.

---

## 종합 요약

| 테스트 | 통과 | 총 | 통과율 |
|--------|------|----|--------|
| 의도 분류 | 8 | 9 | 88.9% |
| 고정 쿼리 매칭 | 6 | 6 | 100% |
| SOQL Validator | 4 | 6 | 66.7% |
| **합계** | **18** | **21** | **85.7%** |

### 우선 수정 필요 항목

1. **[높음] SOQL Validator - alias 치환 로직 버그** (`src/soql-validator.js` 17-25행): replace 콜백 내에서 `fixed` 변수를 직접 수정하는 패턴이 정상 동작하지 않음. alias 감지 후 별도 단계에서 치환하도록 리팩토링 필요.

2. **[높음] SOQL Validator - SELECT 필드 비어짐 방어** (`src/soql-validator.js` 88-97행): Event에서 Owner 커스텀 필드 제거 시 SELECT 절이 비어지는 케이스에 대한 폴백 로직 추가 필요.

3. **[중간] 의도 분류 - brand vs search 혼동** (`src/prompts/intent.md`): "국수나무 설치 대수"와 같은 질문이 brand 대신 search로 분류됨. 프롬프트에 유사 예시 추가 권장.
