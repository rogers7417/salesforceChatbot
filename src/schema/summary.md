## Account (거래처)
Id | 거래처 ID | id
Name | 상호 | string
Type | 거래처 유형 | picklist [Analyst, Competitor, Customer, Integrator, Investor, Partner, Press, Prospect, Reseller, Other]
RecordTypeId | 거래처 레코드 유형 | reference → RecordType
ParentId | 상위 거래처 | reference → Account
Phone | 연락처 | phone
Fax | 거래처 팩스 | phone
AccountNumber | 거래처 번호 | string
Website | 웹사이트 | url
Sic | SIC Code | string
Industry | 업종 | picklist
AnnualRevenue | 연매출액 | currency
NumberOfEmployees | 직원 | int
Ownership | 소유권 | picklist [Public, Private, Subsidiary, Other]
TickerSymbol | 증권 시세 표시 | string
Description | 거래처 설명 | textarea
Rating | 거래처 등급 | picklist [Hot, Warm, Cold]
Site | 거래처사이트 | string
OwnerId | 거래처 소유자 | reference → User
CreatedDate | 작성 일자 | datetime
CreatedById | 작성자 ID | reference → User
LastActivityDate | 마지막 활동 | date
SourceSystemIdentifier | 소스 시스템 ID | string
IsPartner | 파트너 계정 | boolean
IsCustomerPortal | 고객 포털 계정 | boolean
AccountSource | 유입경로 | picklist
SicDesc | SIC 설명 | string
OperatingHoursId | 운영 시간 ID | reference → OperatingHours
AccountBDay__c | 생년월일 | date
AccountEmail__c | 정산 이메일 | email
AccountPartner__c | 소개 파트너사 | reference → Account
BalanceManager__c | 담당자 | string
BankAccountCustomer__c | 계좌(입금자명) | string
BankAccountNumber__c | 계좌(계좌번호) | string
BankNumberBank__c | 계좌(은행명) | picklist
BranchName__c | 지점명 | string
BuildingName__c | 건물명 | string
BuildingNumber__c | Building Number | string
BusinessLicenseName__c | 사업자등록증상 상호 | string
CEOAdress__c | 대표자 주소 | string
CEOName__c | 대표자명(텍스트) | string
CoCEO__c | 공동대표자명 | string
CompanyManagedType__c | 직영여부 | picklist [직영점, 가맹점]
CompanyRegistrationNumber__c | 사업자등록번호 | string
CompanyStatus__c | 매장상태 | picklist [오픈전, 오픈전(2달 이상), 영업중]
ContractCheckbox__c | 계약서 첨부파일 | boolean
ContractStatusRobot__c | 계약상태 - 서빙로봇 | picklist [계약진행전, 계약진행중, 만료, 해지]
ContractStatus__c | 계약상태 - 테이블오더 | picklist [계약진행전, 계약진행중, 만료, 해지]
HotelGroup__c | 호텔그룹 | reference → Account
Dongmyun__c | 동/면 | string
DuplicatePromotion__c | 프로모션 중복 적용 여부 | picklist [가능, 불가능]
EmployeeNumber__c | 종사업자번호 | string
ExternalID__c | ExternalID | string
FRBrand__c | FR브랜드 | reference → Account
FRHQ__c | FR본사 | reference → Account
Industry__c | 업종 | string
IsBusinessLicenseAttachment__c | 사업자등록증(첨부서류) | boolean
IsFloor__c | 층 구분 | boolean
LandNumber__c | Land Number | string
LeadIP__c | 신청자IP | string
MOUBenefitDetail__c | MOU 베네핏 상세 | string
MOUBenefit__c | MOU 베네핏 | multipicklist [페이백, 할인, 촬영지원]
NumberofBranches__c | 총매장 수 | double
OpenDueDate__c | 오픈예정일 | date
TEST_DB__c | TEST 매장 여부 | boolean
PartnerOrder__c | 파트너사 사업자 분류 | picklist [대리점, POS본사, 프리랜서, 기타업체, VAN본사, 영업조직, 프랜차이즈 본사]
PartnerTorderStoreQty__c | 소개한 티오더 매장 수 | double
PartnerType__c | 파트너사 사업자 구분 | picklist [개인, 사업자, 본사, 계열사]
PostalCode__c | 우편번호 | string
Progress__c | 진행상태 | picklist [Qualification, Negotiation, Closed Won, Closed Lost]
RecommendEmp__c | 소개처(임직원/제휴처) | string
RecommendationStore__c | 추천한 매장 | reference → Account
Ri__c | 읍/면/리 | string
RoadName__c | 도로명 | string
Sido__c | 시/도 | string
Sigugun__c | 시/군/구 | string
SpecificLeadSource__c | 세부유입경로(선택) | picklist
SpeicalManagend__c | 특수관리 | multipicklist [더본, UP전환, LG상용솔루션, LGU+인터넷 무상지원, U+화이트라벨링, 스마트상점, 티오더스테이, 뉴오더전환]
StoreCEO__c | 대표자명 | reference → Contact
StoreType__c | 매장유형 | picklist [개인매장, 프랜차이즈제휴, 프랜차이즈비제휴]
TableQty__c | 테이블 수 | double
TabletID__c | 태블릿 ID(미사용) | string
TabletPW__c | 태블릿 PW(미사용) | string
TorderStoreQty__c | 티오더매장수 | double
TypeofB__c | 업태 | string
VAN__c | 주력 VAN사 | picklist [DAOUDATA(다우데이타), JTNET(나이스페이먼츠), KCP;KFTC(금융결제원), KICC;KIS;KOCES(코세스), KOVAN(코밴), KPN(파이서브,한국결제네트웍스), KSNET;NICE(나이스정보통신), SMARTRO(스마트로), SPC(섹터나인)]
fm_Department__c | 부서명(미사용) | string
pjtCd__c | Project Code | string
trCd__c | 거래처코드 | string
Brand_Branch__c | 상호(지점명) | string
SuccessRate__c | 소개 성공률 | percent
fm_AccountHolder_Code__c | 예금주 식별번호 | string
fm_AccountType__c | 거래처 레코드 유형 이름 | string
fm_CEOPhone__c | 대표자 전화번호 | string
fm_Coverage__c | 커버리지 | percent
fm_FRBrand__c | FR브랜드명 | string
fm_FRHQ__c | FR본사명 | string
fm_LongandLat__c | 위도와경도 | boolean
fm_NaverMap__c | 네이버 지도 | string
fm_NaverPlace__c | 네이버 플레이스 | string
fm_RecordTypeDeveloperName__c | 레코드 유형 이름 | string
fm_TypeofBusiness__c | 사업자형태 | string
OldKeyValue__c | (과거)KEY값 | string
OldCreatedDate__c | (과거)생성일자 | date
POS__c | 주력 POS사 | multipicklist
B2BSpecialMatters__c | B2B전용 특이사항 | textarea
CradleColor__c | 거치대 색상 | textarea
DemoEquipmentSupport__c | Demo장비 지원 | string
DirectDiscountStore__c | 직영할인 적용 점포 수 | double
EtcDescription__c | 기타 특이사항 | textarea
HQpayback_3year__c | 본사 캐시백 금액(3년) | currency
InstallationDescription__c | 설치 관련 | textarea
IsADBanner__c | 롤링광고 | boolean
IsADDrink__c | 상품광고 | boolean
IsCategoryADDrink__c | 카테고리 주류 광고 | boolean
LatentTabletQuantity__c | 잠재태블릿 수 | double
Location__c | 주요 거점 위치 | string
POSMonthlyPrices__c | POS 월 가격 | textarea
RatingType__c | 등급 구분 | picklist [1, 2, 3, 4, 5]
Type__c | 구분 | picklist [기존, 신규]
Youtube_support__c | 유튜브 지원 내용 | textarea
direct_discount__c | 직영할인 금액 | currency
store_discount__c | 가맹할인 금액 | currency
fm_DirectDiscount__c | FR본사 직영할인 금액 | currency
fm_HQpayback__c | 본사 캐시백 금액 | currency
fm_StoreDiscount__c | FR본사 가맹할인 금액 | currency
fm_YoutubeSupport__c | FR본사 유튜브 지원 내용 | string
promotion_dupli__c | 프로모션 중복 적용(미사용) | picklist [가능, 불가능]
fm_DuplicatePromotion__c | FR브랜드 프로모션 중복 적용 여부 | string
HQ_Partner__c | 연관 파트너사 | reference → Account
fm_HQ_Partner__c | FR본사 연관 파트너사 | string
HQdivision__c | HQ구분 | picklist [기존, 신규]
MOU_YN__c | 제휴여부 | picklist [제휴, 비제휴]
MOUenddate__c | MOU종료일 | date
MOUstartdate__c | MOU시작일 | date
PartnerPOS__c | POS 소개 | picklist [대호씨엔아이, 엔텍포스시스템, 카드밴넷, 한청전, 스타정보통신, 에이스정보통신, 성화정보텍, 다브인터내셔널, 씨에이치엔(CHN), 하나코포스]
Fail_type__c | 실패유형 | picklist [타사 비딩, 광고 여부, MOU 혜택 불만 - 본사 페이백, MOU 혜택 불만 - 할인 혜택, 기능 부족, 지급 수수료 불만족, 타사 오더 영업중, 계약조항 불만, 기타]
Fail_reason__c | 실패 사유 | textarea
Financial_Deduction__c | 금융비용 공제여부 | boolean
HQpayback_2year__c | 본사 캐시백 금액(2년) | currency
HQpayback__c | 본사 캐시백 금액 | currency
LocalType__c | 국내해외 구분 | picklist [Korea, US, Canada, Other country]
numberofBrands__c | 브랜드 수 | double
Advertising_detail__c | 광고 특이사항 | textarea
Owner_Department__c | 부서 | string
ACC_Place_ID__c | 플레이스ID | string
MOU_ContractDate__c | MOU제휴일 | date
DescriptionMemo__c | 고객센터 특이사항 | textarea
PartnerPhone__c | 파트너 연락처 | phone
fm_AccountID__c | 거래처ID | string
IsNotInterchageableMenu__c | 메뉴 수정 불가 | boolean
fm_MenuNotEditable__c | 메뉴 수정 불가(프랜차이즈 매장) | boolean
MenuIVR__c | 메뉴상담 IVR 분기 | picklist [슈퍼바이저 통한 수정 (A), 카카오 채팅상담 통한 수정 (B)]
CXCheckMemo__c | 고객센터 확인용 메모 | textarea
CXNote__c | 운영 메모 | textarea
ConsiderationStoreMemo__c | 유의 매장 메모 | textarea
ConsiderationStore__c | 유의 매장 내역 | multipicklist [강성, 빠른 처리, 반복된 오류 경험, 통화 시간 민감, 기타]
ImpossibleMemuEditMemo__c | 임의 수정 제한 메모 | textarea
ImpossibleMemuEdit__c | 임의 수정 제한 내역 | multipicklist [프랜차이즈 MOU, 브랜드 요청, 기타]
IsConsiderationStore__c | 유의 매장 여부 | boolean
IsPossibleMemuEdit__c | 임의 수정 제한 여부 | boolean
OnSiteVisitMemo__c | 현장 방문 기록 | textarea
NumberOfMainPos__c | 메인포스 대수 | double
NumberOfOrderPos__c | 오더포스 대수 | double
fm_parentsAccount_Status__c | FR본사 진행상태 | string
BaseCenterOrPartner__c | 내부/외부 | picklist [본사/거점센터, 협력업체]
IsAssetCheck__c | 자산 확인 완료 | boolean
IsEcount__c | 이카운트 등록 | boolean
SelfServiceApp_Description__c | 사장님 앱 비고 | string
fm_parentsAccount_MOUstartdate__c | FR본사 MOU시작일 | date
fm_parentsAccount_MOUenddate__c | FR본사 MOU만료일 | date
ServiceStartDate__c | 서비스 시작일 | date
ServiceEndDate__c | 서비스 종료일 | date
fm_AdBizDB__c | 광고사업 DB | boolean
CRNStatus__c | 사업자 상태 | picklist [계속사업자, 휴업자, 폐업자, 미등록사업자번호]
BannerAdAgree__c | 배너광고(롤링배너) 동의여부 | picklist [Agree, Disagree]
BillingStatus__c | 납부상태 | picklist [정상 납부, 미납]
CRNClosedDate__c | 폐업 일자 | date
Gender__c | 성별 | picklist [1, 2]
LicenseActive__c | 라이선스 활성화여부 | picklist [Active, Deactive]
OperationStatus__c | 운영 상태 | picklist [UNDEFINED, ACTIVE, UNPAID, PRE_CONTRACT, EXPIRED, TERMINATED, UNDEFINED_DEACTIVE]
ProductAdAgree__c | 상품광고(주류등) 동의여부 | picklist [Agree, Disagree]
VirtualAccountBank__c | 가상계좌 발급 은행 | picklist
White_Labeling_Info__c | 화이트라벨링 정보 | picklist [SK쉴더스, U+화이트라벨링]
ActivableTabletNumber__c | 활성화 가능 태블릿 대수 | double
BankAccountNumberEncrypt__c | 계좌(계좌번호) 암호화 | encryptedstring
ContractMasterTabletQuantity__c | 계약한 마스터태블릿 수 | double
ContractOrderTabletQuantity__c | 계약한 오더태블릿 수 | double
ContractTabletQuantity__c | 총 계약 태블릿 수 | double
IsIntegrationOP__c | 오더플랫폼 연동 여부 | boolean
VirtualAccountNumber__c | 가상계좌번호 | encryptedstring
CountryCode__c | 국가 코드 | picklist
ServiceTerritory__c | 업체 | picklist
SelfServiceApp_Pemission__c | 사장님 앱 권한 | picklist [메뉴 수정 불가, 메뉴 수정 가능, 일부 지점 가능]
PenaltyWaive__c | 해지 시 위약금 면제 조치 여부 | picklist [해지 위약금 면제 (재계약 약관 내 폐업 조항), 해지 위약금 면제 (민원)]
PLIndustry_First__c | PL업종(대) | picklist
PLIndustry_Second__c | PL업종(중) | picklist
PLIndustry_Third__c | PL업종(소) | picklist
PenaltyWaiveDate__c | 해지 위약금 면제 발생일 | date
VirtualAccountStatus__c | 가상계좌 입금 상태 | picklist [입금대기, 입금완료, 취소, 환불요청, 환불완료, 요청대기, 요청취소, 부분입금]
FrontUser__c | Front 담당자 | reference → User
PLIndustry__c | PL업종 | string
isDisconnectOP__c | 오더플랫폼 연동 해제완료 | boolean
CRNStatusCalloutTime__c | 사업자 상태 조회 일자 | date
CaseSummary_richtxt__c | 최근 문의사항 요약 | textarea

## Lead (잠재고객)
Id | 잠재고객 ID | id
LastName | 성명 | string
FirstName | (미입력) | string
Salutation | (미입력) | picklist [Mr., Ms., Mrs., Dr., Prof., Mx.]
Name | 전체 이름 | string
RecordTypeId | 잠재고객 레코드 유형 | reference → RecordType
Title | 직급 | string
Company | 상호 | string
Street | 상세 주소 | textarea
City | 시/군/구 | string
State | 시/도 | string
PostalCode | 우편 번호 | string
Country | 국가 | string
Phone | 연락처 | phone
MobilePhone | 휴대폰 | phone
Fax | 팩스 | phone
Email | 이메일 | email
Website | 웹사이트 | url
Description | 요청사항 | textarea
LeadSource | 유입경로 | picklist
Status | 잠재고객 상태 | picklist
Industry | 업종 | picklist
Rating | 등급 | picklist [Hot, Warm, Cold]
AnnualRevenue | 연매출액 | currency
NumberOfEmployees | 직원 | int
OwnerId | 영업 담당자 | reference → Group, User
HasOptedOutOfEmail | 이메일 수신거부 | boolean
IsConverted | 변환됨 | boolean
ConvertedDate | 변환된 날짜 | date
ConvertedAccountId | 변환된 거래처 ID | reference → Account
ConvertedContactId | 변환된 연락처 ID | reference → Contact
ConvertedOpportunityId | 변환된 영업기회 id | reference → Opportunity
IsUnreadByOwner | 소유자가 읽지 않음 | boolean
CreatedDate | 작성 일자 | datetime
CreatedById | 작성자 ID | reference → User
LastActivityDate | 마지막 활동 | date
DoNotCall | 전화사절 | boolean
HasOptedOutOfFax | 팩스 수신거부 | boolean
LastTransferDate | 마지막 전송 일자 | date
AutoNumber__c | Auto Number | string
BranchName__c | 지점명 | string
BrandNameText__c | 브랜드(입력폼) | string
BrandName__c | 브랜드 | reference → Account
BuildingName__c | Building Name | string
BuildingNumber__c | Building Number | string
BulkUpload__c | Bulk업로드 | boolean
CompanyRegistrationNumber__c | 사업자등록번호 | string
CompanyStatus__c | 매장상태 | picklist [오픈전, 오픈전(2달 이상), 영업중]
ContactType__c | 타입 | picklist [대표자, 운영자, 정산담당자, [B2B] 대표자, [B2B] 실무자, [B2B] 정산담당자, 캠페인담당자, 매체담당자]
CountryRegion__c | 국가 / 지역 | string
Dongmyun__c | Dongmyun | string
ExpectationRobotQuantity__c | 예상 로봇 수량 | double
ExpectationStoreQuantity__c | 예상 가맹점 수 | double
GCLID__c | GCLID | string
Industry__c | 업종 | string
InflowUrl__c | 유입 url | textarea
IsCEONumber__c | 소통 연락처 | boolean
IsSpecificFloor__c | 층구분 | boolean
LandNumber__c | Land Number | string
LeadIP__c | 신청자IP | string
LeadPromotionInfo__c | 잠재고객 프로모션 안내사항 | textarea
LeadSourceAutoNumber__c | 유입경로에 따른 잠재고객 순번_v1 | string
LossReasonDetail__c | 취소사유 상세 | string
LossReason__c | 취소사유 | picklist
MKTBenefits__c | MKT_프로모션 혜택 | picklist [혜택01, 혜택02, 혜택03, 혜택04, 혜택05]
MKTPromotions__c | MKT_프로모션 | picklist [MKT-24-0425-0531-패밀리프로모션, MKT-24-0122-0229-새해프로모션, MKT-24-0304-0331-제로프로모션]
Metadata_Lead_Number__c | Metadata Lead Number | double
OpenDueDate__c | 오픈예정일 | date
POSType__c | 포스 | picklist
PartnerName__c | 소개 파트너사 | reference → Account
PartnersNameText__c | 파트너스(입력폼) | string
PaymentType__c | 결제방식 | picklist [선결제, 후결제]
PostalCode__c | POSTAL CODE | string
PreimburseInfo__c | 선결제 정보 | string
PrivacyInfoDate__c | 개인정보 수집 동의(필수) 일자 | datetime
PrivacyInfoYN__c | 개인정보 수집 동의(필수) | boolean
RecommendCode__c | 추천인코드 | string
RecommendEmp__c | 소개처(임직원/제휴처) | textarea
RecommendStorePhone__c | 소개 매장 연락처 | phone
RecommendStore__c | 소개 매장 상호지점명 | string
RecommendationStore__c | 추천한 매장 | reference → Account
RequestDescription__c | 상담내역 | textarea
Ri__c | Ri | string
RoadName__c | Road Name | string
SALPromotions__c | SAL_프로모션 | picklist [5+1 스텔스 프로모션, 전기공사 5만원 페이백]
SalesInviteDate__c | 방문희망일자 | date
ServiceType__c | 서비스유형 | picklist [테이블오더, 서빙로봇, 티오더 웨이팅, CCTV, 광고문의]
Sido__c | Sido | string
Sigugun__c | SIGUGUN | string
SpecialCase__c | 특수관리 | multipicklist [더본, UP전환, LG상용솔루션, LGU+인터넷 무상지원, U+화이트라벨링, 스마트상점, 티오더스테이, 뉴오더전환]
StoreType__c | 매장유형 | picklist [개인매장, 프랜차이즈제휴, 프랜차이즈비제휴]
SubmitInquiryPage__c | 문의 제출 페이지 | textarea
TableQty__c | 테이블 수 | double
UtmCampaign__c | utm_campaign | string
UtmContent__c | utm_content | string
UtmMedium__c | utm_medium | string
UtmSource__c | utm_source | string
UtmTerm__c | utm_term | string
VAN__c | VAN | picklist
advertisinginfoDate__c | 광고성 정보 수신 동의(선택) 일자 | datetime
advertisinginfoYN__c | 광고성 정보 수신 동의(선택) | boolean
fm_Department__c | 부서(미사용) | string
fm_LeadID__c | 잠재고객ID | string
isFromLead__c | IsFromLead | boolean
isconverted__c | isconverted | boolean
referer__c | referer url | textarea
thirdpartyDate__c | 개인정보 제3자 제공 동의(로봇전용-필수) 일자 | datetime
thirdpartyYN__c | 개인정보 제3자 제공 동의(로봇전용-필수) | boolean
utm__c | utm | textarea
Brand_Branch__c | 상호(지점명) | string
LeadScore__c | 리드 스코어 | double
Lead_Approval_Status__c | 승인 상태 | picklist [요청됨, 승인됨, 거절됨]
LossReason_Contract__c | 취소사유(세부항목) | picklist
Sourcedetail__c | 세부유입경로(선택) | picklist
fm_AutoNumber__c | fm_AutoNumber | double
fm_LeadScoreStars__c | 잠재고객 등급 | string
fm_LongandLat__c | 위도와경도 | boolean
fm_MetaRoundRobin__c | Meta Round Robin | double
fm_NaverMap__c | 네이버 지도 | string
fm_NaverPlace__c | 네이버 플레이스 | string
OldCreatedDate__c | (과거)생성일자 | datetime
AssignmentDate__c | 배정일자 | date
OldRequest__c | (과거)요청사항 | textarea
OldKeyValue__c | (과거)KEY값 | string
user_isactive__c | user_isactive | boolean
Google_Maps_URL__c | Google Maps URL | url
ISKOREAN__c | IS KOREAN | boolean
LocalType__c | 국내해외 구분 | picklist [Korea, US, Canada, Other country]
Restaurant_Type__c | Restaurant Type | textarea
Cloud_POS__c | Cloud POS | boolean
Offer_Online_Delivery__c | Offer Online Delivery | boolean
Online_Reservation_Availability__c | Online Reservation Availability | boolean
Waiting_List__c | Waiting List | boolean
Serving_Robot_User__c | Serving Robot User | boolean
Restaurant_Facebook_Info__c | Restaurant Facebook Info | url
Restaurant_Instagram_Info__c | Restaurant Instagram Info | url
Restaurant_Yelp_Info__c | Restaurant Yelp Info | url
FBCLID__c | FBCLID | string
et4ae5__Mobile_Country_Code__c | Mobile Country Code | picklist
et4ae5__HasOptedOutOfMobile__c | Mobile Opt Out | boolean
Place_ID__c | 플레이스ID | string
Visit_Status__c | Visit Status | picklist [Demo with DM, Left Out, N/A]
Level_of_Interest__c | Level of Interest | picklist [Low, Medium, High]
TBQ_Category__c | TBQ Category | picklist [POS, ENGLISH, FEATURE, ALL, OTHERS]
Owner_Department__c | 부서 | string
FieldInviteDate__c | 필드방문일자 | date
Store_Contact__c | 매장 연락처 | string
LeadVoiceRecording__c | 녹취 url | textarea
Marketing_Scoring__c | 마케팅스코어링 | double
Matrix_Call_Category__c | Matrix_Call_Category | textarea
Matrix_Call_Emotion__c | Matrix_Call_Emotion | textarea
Matrix_Call_ID__c | 콜 ID | string
Matrix_Call_Summary__c | Matrix_Call_Summary | textarea
Matrix_Call_Tag__c | 콜 태그 | string
Matrix_Call_Type__c | 콜 유형 | string
Qoute_URL__c | Qoute_URL | url
PLIndustry__c | PL업종 | picklist
BusinessSensitivity__c | 영업 감도 | picklist [상, 중, 하]
fm_BrandName_Owner__c | 브랜드 거래처 소유자 | string
fm_PartnerName_Owner__c | 파트너사 거래처 소유자 | string
Campaign__c | 캠페인명 | reference → Campaign
fm_CampaignId__c | 캠페인ID | string
BudgetSize__c | 예산 규모 | picklist [500만원 미만, 500만원 - 1,000만원, 1,000만원 이상]
MKTPromotion__c | 마케팅 프로모션 | reference → Promotion__c
EmailSendDate__c | 최근 이메일 보낸 날짜 | date
EmailReceiveDate__c | 최근 이메일 받은 날짜 | date
EmailOpenDate__c | 최근 이메일 오픈일 | date
EmailContactDate__c | 최근 이메일 연락일 | date
MarketingActivityDate__c | 최근 마케팅 활동일 | date
CustomerActivityDate__c | 최근 고객 활동 | date
EmailOptOutReason__c | 이메일 수신거부 사유 | string
WebformSubmitDate__c | 최근 웹 폼 제출 날짜 | date
HoldReason__c | 보류 사유 | picklist [시기 미정, 예산 부족, 내부 논의 중, 연락 불가, 추후 관리 대상]
RevenueExpected__c | 예상 매출 | currency
fm_AdBizDB__c | 광고사업 DB | boolean
ContactDepartment__c | 연락처 부서 | string
mkt_PrivacyInfoYN__c | 마케팅 목적의 개인정보 수집 및 이용 동의(선택) | boolean
mkt_PrivacyInfoDate__c | 마케팅 목적의 개인정보 수집 및 이용 동의(선택) 일자 | datetime
UtmSummary__c | 마케팅 인입 정보 | string
CreatedTimeHour__c | 생성 시간(시) | double
CreatedTime__c | 생성 일시 | string

## Opportunity (영업기회)
Id | 영업기회 id | id
AccountId | 상호 | reference → Account
RecordTypeId | 영업기회 레코드 유형 | reference → RecordType
IsPrivate | 비공개 | boolean
Name | 영업기회 이름 | string
Description | 요청사항 | textarea
StageName | 단계 | picklist
Amount | 예상 금액 | currency
Probability | 성공 확률 (%) | percent
ExpectedRevenue | 예상 금액 | currency
TotalOpportunityQuantity | 수량 | double
CloseDate | 마감 일자 | date
Type | 영업기회 유형 | picklist [Existing Business, New Business]
NextStep | 다음 단계 | string
LeadSource | 유입경로 | picklist
IsClosed | 마감됨 | boolean
IsWon | 수주 | boolean
ForecastCategory | 예측 범주 | picklist [Omitted, Pipeline, BestCase, MostLikely, Forecast, Closed]
ForecastCategoryName | 예측 범주 | picklist [Omitted, Pipeline, Best Case, Commit, Closed]
CampaignId | 캠페인 id | reference → Campaign
HasOpportunityLineItem | 줄 항목 있음 | boolean
Pricebook2Id | 가격 목록 id | reference → Pricebook2
OwnerId | 영업기회 소유자 | reference → User
CreatedDate | 작성 일자 | datetime
AgeInDays | 경과일 | int
CreatedById | 작성자 ID | reference → User
LastActivityDate | 마지막 활동 | date
LastActivityInDays | 최근 활동 | int
PushCount | 푸시 횟수 | int
LastStageChangeDate | 마지막 단계 변경일 | datetime
LastStageChangeInDays | 단계의 일 | int
FiscalQuarter | 회계 분기 | int
FiscalYear | 회계 연도 | int
Fiscal | 회계 기간 | string
ContactId | 연락처 ID | reference → Contact
SyncedQuoteId | 견적서 ID | reference → Quote
ContractId | 계약 id | reference → Contract
HasOpenActivity | 진행 중인 활동 있음 | boolean
HasOverdueTask | 지연 과업 있음 | boolean
LastAmountChangedHistoryId | 영업기회 내역 id | reference → OpportunityHistory
LastCloseDateChangedHistoryId | 영업기회 내역 id | reference → OpportunityHistory
IsPriorityRecord | 중요 | boolean
Budget_Confirmed__c | Budget Confirmed | boolean
Discovery_Completed__c | Discovery Completed | boolean
ROI_Analysis_Completed__c | ROI Analysis Completed | boolean
AddAdvancedPaymantAmount__c | 추가선납금 입금액 | currency
Loss_Reason__c | 취소 시점 | picklist
AddAdvancedPaymantDate__c | 추가선납금 입금일자 | date
AdvancePaymentAmount__c | 선/후납 입금액 | currency
AdvancePaymentDate__c | 입금일자 | datetime
AdvancePaymentRate__c | 선납금비율 | percent
SubmitInquiryPage__c | 문의 제출 페이지 | textarea
Opportunity_Timing__c | 재계약 기회 시점 | picklist [만기재계약, 조기재계약]
Approval_Status_MenuPhotos__c | 승인 상태 | picklist [요청됨, 승인됨, 거절됨]
BOUser__c | BO담당자 | reference → User
Benefits__c | 혜택지원 | multipicklist
CEONAME__c | 대표자명 | reference → Contact
CeilingCheck__c | 천장 유무(룸 있는경우) | picklist [있음, 없음]
CommuicationName__c | 소통_이름 | string
CommuicationPhone__c | 소통_연락처 | string
CommuicationType__c | 소통_타입 | string
ContractPeriod__c | 약정 | double
ContractStatus__c | 계약상태(수정금지) | string
CradleColor__c | 거치대 색상 | picklist [블랙, 실버, 로즈골드, 골드, 핑크, 브론즈, 기타]
UtmSource__c | utm_source | textarea
DeployDate__c | Deploy결정일자 | date
DepositUser__c | 입금자명 | string
Expected_InstallationNumber__c | 예상 대수 | double
PaymentMethod__c | 납부수단 | picklist [카드+현금, 카드, 현금]
GCLID__c | GCLID | string
GovermentSupportPrice__c | 국가지원금 | currency
InstallConfirmedDate__c | 설치 확정일자 | date
InternetType__c | 인터넷 | picklist
IsADBanner__c | 롤링광고 | boolean
IsADDrink__c | 상품광고 | boolean
IsApprovalNeeded__c | 승인 필요한 프로모션 유무 | boolean
IsCurve__c | 바닥면 굴곡 유무 | boolean
IsElevator__c | 엘리베이터 유무 | boolean
IsLetterOfAttorney__c | 위임장 서명요청 | boolean
IsOfficialMW__c | OFFICIAL 미들웨어 | boolean
IsPrintCheck__c | 프린터 | boolean
IsRouterCheckbox__c | 공유기 설치유무 | boolean
IsSlope__c | 경사 유무 | boolean
LocalInviteDate__c | 로컬팀 방문일정 | datetime
Loss_Reason_Detail__c | 취소사유 상세 | textarea
MenuShots__c | 메뉴 사진 촬영 장수 | double
MixProduct__c | 복합상품 | multipicklist [전화, TV, CCTV, POS, Printer, Cash Drawer, KDS]
OpptPromotionInfo__c | 잠재고객 프로모션 안내사항 | textarea
POCDateEnd__c | POC_End | date
POCDateStart__c | POC_Start | date
POCDescription__c | POC 진행사항 | textarea
POSContact__c | 포스사 연락처 | phone
PaymentType_Oppt__c | 납부방법 | picklist [Deposit_Included, 선납금, 후납금, 일시납]
PaymentType__c | 결제방식 | picklist [선결제, 후결제, 고민중, Prepayment, Postpayment]
PersonalContribution__c | 자부담금 | currency
PosType__c | 포스 | picklist
PrepaymentInfo__c | 선결제 정보 | string
PresidentName__c | 대표자명 | string
PresidentPhone__c | 대표자 연락처 | string
PrintQty__c | 프린터대수 | double
Promotion_Amount__c | 프로모션 금액 | currency
Promotion_Quant__c | 프로모션 수량 | double
RenewalType__c | 재계약 방식 | picklist [H/W 재계약, S/W 재계약, 상위 모델 무료 업그레이드, 월 요금 5만원 할인, 50% 할인]
RequestDescription__c | 요청사항 | textarea
RoomCheck__c | 룸 유무(개수) | double
RouterNumber__c | 공유기 설치 수 | double
SalesInviteDate__c | 방문희망일자 | date
SmartPaymentType__c | (스마트) 결제방식 | picklist [카드결제, 계좌이체]
SmartStatus__c | (스마트) 진행상태 | picklist [SS-0. 초기상담완료, SS-1. 보급계약서접수, SS-2. 협약접수, SS-3. 협약승인, SS-4. 자부담금 입금, SS-5. 완료보고서 제출, SS-6. 대금요청, SS-7. 대금승인]
SpecialCompanyType__c | 특별매장여부 | multipicklist
SpeicalManagend__c | 특수관리 | multipicklist [더본, UP전환, LG상용솔루션, LGU+인터넷 무상지원, U+화이트라벨링, 스마트상점, 티오더스테이, 뉴오더전환, IBS/CHS공동실적]
SubBatteryQty__c | 보조배터리(1+1) 수량 | double
SubsidiaryAmount__c | 부자재 입금액 | currency
SupportBusinessType__c | 지원사업명 | picklist [스마트상점, 여의도 지원사업]
SupportPriceMax__c | 지원최대금액 | currency
SupportRate__c | 지원비율 | percent
TableDistance__c | 테이블 간격 | picklist [60~80cm, 80~100cm]
TableSize__c | 테이블 규격 | picklist [12cm미만, 12cm초과(확인필요)]
TotalAmount__c | 최종 총금액(미사용) | currency
TransferContract__c | 양도 계약명 | reference → Contract__c
TransferOpportunity__c | 양도 영업기회 | reference → Opportunity
Type__c | 타입 | string
UTM_del__c | UTM | string
VAN__c | VAN | picklist
VAT__c | 부가세 | currency
VisitRepresentative__c | 방문담당자 | reference → User
WindowsVersion__c | 윈도우버전 | picklist [확인필요, Win7미만(xp등), Win7, Win10이상, Android, IOS]
fm_AccountPhone__c | 대표번호 | string
fm_Department__c | 부서(미사용) | string
UtmMedium__c | utm_medium | textarea
fm_NaverPlace__c | 네이버 플레이스 | string
fm_OpportunityID__c | 영업기회ID | string
isFromLead__c | IsFromLead | boolean
is_Budget_Confirmed__c | Budget Confirmed | boolean
is_Discovery_Completed__c | Discovery Completed | boolean
is_FianlQuoteCheck__c | is_FianlQuoteCheck | boolean
is_InternetGuideCheck__c | 인터넷 안내완료 | boolean
is_ROI_Analysis_Completed__c | ROI Analysis Completed | boolean
is_ServingRobot__c | 서빙로봇 | boolean
ru_APTotalAmount__c | 선납금 총금액 | currency
ru_AllPaymentTotalAmount__c | 일시납 총금액 | currency
ru_MITotalAmount__c | 월 할부금 총금액 (VAT미포함) | currency
ru_MasterTabletQty__c | 마스터 태블릿 수량 | double
ru_RobotQty__c | 로봇 수량 | double
ru_SubsidiaryTotalAmount__c | 부자재 총금액 | currency
ru_TabletQty__c | 태블릿 수량 | double
ru_TotalAmounts2__c | 초기 입금액 | currency
ru_TotalAmounts__c | 총 약정금액 | currency
ru_WatingMasterTabletQty__c | 웨이팅 마스터 태블릿 수량 | double
ru_WatingTabletQty__c | 웨이팅 태블릿 수량 | double
DateRequired__c | 소요일자 | string
Loss_Reason_Oppt_2depth__c | 취소사유(중) | picklist
Loss_Reason_Oppt__c | 취소사유(대) | picklist
RealPaymentAmount__c | 실제 입금액(선납+부자재+추가선납) | currency
TotalNumberofEveryTablet__c | 최종 총 태블릿대수 | double
fm_AccountCRN__c | 사업자등록번호 | string
fm_AccountEmail__c | 이메일 | string
fm_AccountFRName__c | 프렌차이즈 본사명 | string
fm_AccountPartner__c | 파트너사 | string
fm_BranchName__c | 지점명 | string
fm_Brand_Branch__c | 상호(지점명) | string
fm_Brandname__c | 브랜드명 | string
fm_CEONAME__c | 대표자명(1) | string
fm_CompanyManagedType__c | 직영여부 | string
fm_CompanyStatus__c | 매장상태 | string
fm_ExpectedAmount__c | 예상금액 | currency
UtmCampaign__c | utm_campaign | textarea
fm_NaverMap__c | 네이버 지도 | string
fm_OpenDueDate__c | 오픈예정일 | date
fm_OpportunityRecordTypeDeveloperName__c | fm_OpportunityRecordTypeDeveloperName | string
fm_RecommendEmp__c | 소개직원 | string
fm_RemainingAmount__c | 잔여 할부금 | currency
fm_Sigugun__c | 시/군/구 | string
UtmContent__c | utm_content | textarea
fm_StoreType__c | 매장유형 | string
fm_TableQty__c | 테이블 수 | double
fm_VAT__c | 총 약정금액 부가세 | currency
fm_sido__c | 시/도 | string
ru_MITotalAmount2__c | 월 할부금 총금액 (VAT포함) | currency
OldCreatedDate__c | (과거)생성일자 | datetime
AssignmentDate__c | 배정일자 | date
OldRequest__c | (과거)요청사항 | textarea
OldKeyValue__c | (과거)KEY값 | string
RobotPurchaseType__c | Robot매입유형 | picklist [렌탈, 구매]
UtmTerm__c | utm_term | textarea
POCRobotType__c | POC로봇유형 | picklist [LG로봇 3세대 클로이, 베어로보틱스 서비, 베어로보틱스 서비플러스]
PreCheckDate__c | 사전점검 일자 | date
ru_FinalTotalAmount__c | (최종)총금액 | currency
ru_AllPaymentDiscountAmount__c | 일시납 할인금액 | currency
InflowUrl__c | 유입 url | textarea
fm_DepartmentBO__c | 부서(BO)(미사용) | string
DepositAmountTAX__c | Deposit Amount (+TAX) | currency
CradleType__c | 거치대 유형 | multipicklist [고정형, 전용 거치대, 이동형, 목재용, 벽걸이용, 벽케이스, 북케이스, 젤리케이스, 웨이팅용, 미정]
RobotOption__c | Robot_Option | multipicklist
referer__c | referer url | textarea
utm__c | utm | textarea
new_LeadSource__c | new_유입경로 | picklist
new_Specific_LeadSource__c | new_세부유입경로(선택) | picklist
ConvertedLeadID__c | 변환 잠재고객id | string
Deposit__c | Deposit Amount | currency
GlobalDescription__c | Description | string
IsAccountLocalTypeChanged__c | IsAccountLocalTypeChanged | boolean
LocalType__c | 국내해외 구분 | picklist [Korea, US, Canada, Other country]
OverseaTotalAmount__c | Total Amount | currency
SalesAmountTAX__c | Sales Amount (+TAX) | currency
TAX1AmountDeposit__c | TAX1 Amount | currency
TAX1AmountSales__c | TAX1 Amount | currency
TAX1Rate__c | TAX1 Rate | percent
TAX2AmountDeposit__c | TAX2 Amount | currency
TAX2AmountSales__c | TAX2 Amount | currency
TAX2Rate__c | TAX2 Rate | percent
TAX3AmountDeposit__c | TAX3 Amount | currency
TAX3AmountSales__c | TAX3 Amount | currency
TAX3Rate__c | TAX3 Rate | percent
TotalAmountExclDeposit__c | Total Amount (Excl. Deposit) | currency
SubTotalOverseaOnly__c | Sales Amount | currency
fm_Onetimepaymentbenefits__c | One-time payment benefits | currency
Intergration_Unable__c | 선 연동불가 | boolean
attributable_date__c | 영업 본부 귀속 년월 | date
Owner_Department__c | 부서 | string
BO_Department__c | 부서(BO) | string
isVoiceRecording__c | 녹취록유무 | boolean
isStoreImage__c | 매장이미지유무 | boolean
isAttachedFile__c | 첨부서류유무 | boolean
FBCLID__c | FBCLID | string
Demo_Held__c | Demo Held | boolean
Metadata_Opportunity_Number__c | Metadata Opportunity Number | double
ru_NFCQty__c | 멀티오더 수량 | double
sido_texttype__c | 시/도text | string
Loss_Reason_Status__c | 취소상태 | picklist [재계약 계약 거절, 재계약 라이선스 종료]
PosInfo__c | 포스 정보 | string
previous_InstallmentInfo__c | 직전_약정 | double
previous_TotalTablet__c | 직전_최종 총 태블릿대수 | double
previous_FinalTotalAmount__c | 직전_(최종)총금액 | currency
previous_ContractDateEnd__c | 직전_계약만료일 | date
previous_ContractDateStart__c | 직전_계약시작일 | date
CreditCard__c | 카드결제 여부 | picklist [KB국민카드, 삼성카드]
CocaColaPromotion__c | 코카콜라 프로모션 | boolean
PaymentApprovalNumber__c | 결제 승인 번호 | string
PaymentApprovalDate__c | 승인 일자 | date
OpprtunityType__c | 기회유형 | picklist [AS재계약, HW재계약, SW재계약, 미정, HW계약, SW계약]
AccountReport_Outsource__c | 매장 특이사항 (외주전달용) | string
ChurnCompetitor__c | 이탈경쟁사명 | picklist
PreviousOpportunity__c | 직전 영업기회 | reference → Opportunity
PreviousOpportunityID__c | 직전 영업기회 ID | string
ParentsOpportunity__c | 상위 영업기회 | reference → Opportunity
CocaCola_POScheck__c | 코카콜라 POS 등록 여부 | boolean
CocaCola_Code__c | 코카콜라 상품코드 | string
IsInstallationDateChange__c | IsInstallationDateChange | boolean
Loss_Reason_Oppt_3depth__c | 취소사유(소) | picklist
CardIssuanceType__c | 카드 발급유형 | picklist [신규발급, 기존카드]
InstallHopeDate__c | 설치희망일자 | date
BudgetSize__c | 예산 규모 | picklist [500만원 미만, 500만원 - 1,000만원, 1,000만원 이상]
FieldUser__c | 필드세일즈 담당자 | reference → User
AdDisplayQtyExpected__c | 예상 광고 송출 대수 | double
AdDisplayRevenueExpected__c | 예상 광고 매출 | currency
AdType__c | 광고 유형 | multipicklist [롤링광고, 상품광고, 주문 완료 광고]
AdTypeDetailed__c | 광고 유형(세부) | multipicklist [이미지형, 동영상형, 쿠폰형, 퀴즈형, 서베이형, 슬롯형]
CampaignContact__c | 캠페인 담당자 | reference → Contact
Advertiser__c | 광고주 상호 | reference → Account
AdAgency__c | 대행사 상호 | reference → Account
AdContract_Amount__c | 광고 계약금액 | currency
AdContract_FinalAmount__c | 광고 최종 계약금액 | currency
fm_AdDiscount_Rate__c | 광고 할인율 | percent
fm_AdDiscount_Amount__c | 광고 할인금액 | currency
Campaign__c | 캠페인명 | reference → Campaign
fm_CampaignId__c | 캠페인 ID | string
RecommendCode__c | 추천인코드 | string
MKTPromotion__c | 마케팅 프로모션 | reference → Promotion__c
fm_AdBizDB__c | 광고사업 DB | boolean

## Event (이벤트)
Id | 활동 id | id
WhoId | 이름 ID | reference → Contact, Lead
WhatId | 관련 항목 ID | reference → Account, ApptBundleAggrDurDnscale, ApptBundleAggrPolicy, ApptBundleConfig, ApptBundlePolicy, ApptBundlePolicySvcTerr, ApptBundlePropagatePolicy, ApptBundleRestrictPolicy, ApptBundleSortPolicy, Asset, AssetAccountParticipant, AssetContactParticipant, AssetDowntimePeriod, AssetRelationship, AssetWarranty, AssignedResource, AttributeDefinition, AttributePicklist, AttributePicklistValue, Billing__c, CMSUpload__c, CalculationMatrix, CalculationMatrixVersion, CalculationProcedure, CalculationProcedureVersion, Campaign, Case, ChangeRequest, ChannelProgram, ChannelProgramLevel, CheckListOriginal__c, CheckListSave__c, CheckList__c, ContactRequest, Contract, ContractLineItem, ContractProductOrder__c, ContractProductPromotion__c, Contract__c, DocumentRecipient, EngagementAttendee, EngagementInteraction, EngagementTopic, Entitlement, Expense, ExpenseReport, ExpenseReportEntry, ExpressionSet, ExpressionSetVersion, ExternalCooperation__c, FAQ__c, HelpDesk__c, ITService__c, Image, Incident, Installation__c, JiraUser__c, Jira__c, ListEmail, Location, MaintenanceAsset, MaintenancePlan, Notification__c, OperatingHoursHoliday, Opportunity, Order, Problem, ProcessException, Product2, ProductConsumed, ProductItem, ProductRequest, ProductRequestLineItem, ProductServiceCampaign, ProductServiceCampaignItem, ProductTransfer, PromotionList__c, Promotion__c, Quote, RecordAlert, RelatedTerritory__c, ResourceAbsence, ReturnOrder, ReturnOrderLineItem, ServiceAppointment, ServiceContract, ServiceCrew, ServiceCrewMember, ServiceResource, Shift, ShiftPattern, ShiftPatternEntry, Shipment, ShipmentItem, Solution, Space__c, SurveyItem__c, SurveyResponseItem__c, SurveyResponse__c, Survey__c, Territory__c, TimeSheet, TimeSheetEntry, TravelMode, Visit__c, WarrantyTerm, WhiteLabelingInstallation__c, WhiteLabelingStore__c, WorkOrder, WorkOrderLineItem, WorkPlan, WorkPlanSelectionRule, WorkPlanTemplate, WorkPlanTemplateEntry, WorkStep, WorkStepTemplate, dfsle__AgreementConfiguration__c, dfsle__BulkList__c, dfsle__BulkStatus__c, dfsle__CustomParameterMap__c, dfsle__EnvelopeConfiguration__c, dfsle__EnvelopeStatus__c, dfsle__GenTemplate__c, dfsle__Log__c, dfsle__RecipientStatus__c, dsfs__CustomParameterMap__c, dsfs__DocuSign_Recipient_Status__c, dsfs__DocuSign_Status__c, dsfs__EnvelopeConfiguration__c, et4ae5__Triggered_Send_Execution__c
WhoCount | 관계 카운트 | int
WhatCount | 카운트에 연결됨 | int
Subject | 제목 | combobox [통화, 방문, 메일, 기타]
Location | 위치 | string
IsAllDayEvent | 종일 이벤트 | boolean
ActivityDateTime | 기한 시간 | datetime
ActivityDate | 기한 전용 | date
DurationInMinutes | 소요기간(시간) | int
StartDateTime | 시작 일자/시간 | datetime
EndDateTime | 마감 일자/시간 | datetime
EndDate | 종료 일자 | date
Description | 상세 설명 | textarea
AccountId | 거래처 | reference → Account
OwnerId | 담당자 ID | reference → Calendar, User
Type | 유형 | picklist [Email, Meeting, Other, Call]
IsPrivate | 비공개 | boolean
ShowAs | 시간 표시 | picklist [Busy, OutOfOffice, Free]
IsChild | 하위임 | boolean
IsGroupEvent | 그룹 이벤트 | boolean
GroupEventType | 그룹 이벤트 유형 | picklist [0, 1, 2, 3]
CreatedDate | 작성 일자 | datetime
CreatedById | 작성자 ID | reference → User
IsArchived | 보관됨 | boolean
IsVisibleInSelfService | 공개 | boolean
RecurrenceActivityId | 반복 활동 ID | reference → Event
IsRecurrence | 이벤트의 반복 시리즈 만들기 | boolean
RecurrenceStartDateTime | 반복 시작 | datetime
RecurrenceEndDateOnly | 반복 종료 | date
RecurrenceTimeZoneSidKey | 반복 시간대 | picklist
RecurrenceType | 반복 유형 | picklist [RecursDaily, RecursEveryWeekday, RecursMonthly, RecursMonthlyNth, RecursWeekly, RecursYearly, RecursYearlyNth]
RecurrenceInterval | 반복 간격 | int
RecurrenceDayOfWeekMask | 주별 마스크의 반복 일자 | int
RecurrenceDayOfMonth | 월의 반복 일자 | int
RecurrenceInstance | 반복 인스턴스 | picklist [First, Second, Third, Fourth, Last]
RecurrenceMonthOfYear | 연의 반복 월 | picklist
ReminderDateTime | 미리 알림 일자/시간 | datetime
IsReminderSet | 미리 알림 설정 | boolean
EventSubtype | 이벤트 하위 유형 | picklist [Event]
IsRecurrence2Exclusion | 내역 이벤트, 이어지지 않는 반복 | boolean
Recurrence2PatternText | 반복 패턴 | textarea
Recurrence2PatternVersion | 패턴 버전 | picklist [1, 2]
IsRecurrence2 | 반복 | boolean
IsRecurrence2Exception | 예외 | boolean
Recurrence2PatternStartDate | 반복 패턴 시작 날짜 | datetime
Recurrence2PatternTimeZone | 반복 패턴 시간대 기본 설정 | string
CallDateTime__c | 통화시간 | datetime
Lead__c | 잠재고객 | reference → Lead
fm_Brand_Branch__c | 상호(지점명) | string
Matrix_Agent_ID__c | 상담원ID | string
Matrix_Answered_At__c | 통화연결시간 | datetime
Matrix_Call_ID__c | 콜ID | string
Matrix_Call_State__c | 콜 상태 | string
Matrix_Call_Type__c | 콜 유형 | string
Matrix_Callback_Rec__c | 콜백녹음 | url
Matrix_CallerID__c | 발신번호 | string
Matrix_Created_At__c | 콜시작시간 | datetime
Matrix_DNIS_Memo__c | 인입회선이름 | string
Matrix_DNIS__c | 인입회선번호 | string
Matrix_Extension__c | 내선번호 | string
Matrix_IVR_Tag_Memo__c | IVR 인입경로 | string
Matrix_IVR_Tag__c | IVR 태그 | string
Matrix_Is_Ans__c | 통화연결 | boolean
Matrix_Phone_Number__c | 전화번호 | phone
Matrix_Queue_Name__c | 큐 이름 | string
Matrix_Queued_At__c | 큐진입시간 | datetime
Matrix_Ring_At__c | 링시작시간 | datetime
Matrix_TM_Connect__c | 통화시간 | double
Matrix_TM_Queue__c | 큐대기시간 | double
Matrix_TM_Ring__c | 링시간 | double
Matrix_Updated_At__c | 통화종료시간 | datetime
Matrix_C_20s_Abandon_Calls__c | 20초내 포기호 | double
Matrix_C_20s_Answered_Calls__c | 20초내 응답호 | double
Matrix_C_Abandon_Calls__c | 포기호 | double
Matrix_C_Answered_Calls__c | 응대호 | double
Matrix_C_IVR_Abandon_Calls__c | IVR 포기호 | double
Matrix_C_Inbound_Calls__c | 전체인입호 | double
Matrix_C_Queue_Calls__c | 큐인입호 | double
Matrix_Call_Info__c | 통화정보 | string
Matrix_Call_Recording__c | 녹취 | string
Matrix_TM_Abandon__c | 큐포기시간 | double
Matrix_TM_Occupancy__c | 점유시간 | double
Matrix_TM_Queue_Wait__c | 큐대기시간(누적) | double
Matrix_TM_Total_Wait__c | 전체대기시간 | double
FSL__Count_of_Events__c | 이벤트 수 | double
FSL__Count_of_Tasks__c | 작업 수 | double
FSL__Event_Type__c | 이벤트 유형 | picklist [Service Appointment, Resource Absence]
CustomerPhone__c | 고객 전화번호 | string
CallId__c | 통화ID | string
CallStartDate__c | 통화시작일시 | datetime
CallTime__c | 총 통화시간 | string
CallType__c | 통화유형 | string
UserPhone__c | 상담원 전화번호 | string
Matrix_Category__c | 상담유형 추천 | string
Matrix_Emotion__c | 고객감정 | string
Matrix_STT__c | Matrix STT | reference → Matrix_STT__c

## Task (과업)
Id | 활동 id | id
WhoId | 이름 ID | reference → Contact, Lead
WhatId | 관련 항목 ID | reference → Account, ApptBundleAggrDurDnscale, ApptBundleAggrPolicy, ApptBundleConfig, ApptBundlePolicy, ApptBundlePolicySvcTerr, ApptBundlePropagatePolicy, ApptBundleRestrictPolicy, ApptBundleSortPolicy, Asset, AssetAccountParticipant, AssetContactParticipant, AssetDowntimePeriod, AssetRelationship, AssetWarranty, AssignedResource, AttributeDefinition, AttributePicklist, AttributePicklistValue, Billing__c, CMSUpload__c, CalculationMatrix, CalculationMatrixVersion, CalculationProcedure, CalculationProcedureVersion, Campaign, Case, ChangeRequest, ChannelProgram, ChannelProgramLevel, CheckListOriginal__c, CheckListSave__c, CheckList__c, ContactRequest, Contract, ContractLineItem, ContractProductOrder__c, ContractProductPromotion__c, Contract__c, DocumentRecipient, EngagementAttendee, EngagementInteraction, EngagementTopic, Entitlement, Expense, ExpenseReport, ExpenseReportEntry, ExpressionSet, ExpressionSetVersion, ExternalCooperation__c, FAQ__c, HelpDesk__c, ITService__c, Image, Incident, Installation__c, JiraUser__c, Jira__c, ListEmail, Location, MaintenanceAsset, MaintenancePlan, Notification__c, OperatingHoursHoliday, Opportunity, Order, Problem, ProcessException, Product2, ProductConsumed, ProductItem, ProductRequest, ProductRequestLineItem, ProductServiceCampaign, ProductServiceCampaignItem, ProductTransfer, PromotionList__c, Promotion__c, Quote, RecordAlert, RelatedTerritory__c, ResourceAbsence, ReturnOrder, ReturnOrderLineItem, ServiceAppointment, ServiceContract, ServiceCrew, ServiceCrewMember, ServiceResource, Shift, ShiftPattern, ShiftPatternEntry, Shipment, ShipmentItem, Solution, Space__c, SurveyItem__c, SurveyResponseItem__c, SurveyResponse__c, Survey__c, Territory__c, TimeSheet, TimeSheetEntry, TravelMode, Visit__c, WarrantyTerm, WhiteLabelingInstallation__c, WhiteLabelingStore__c, WorkOrder, WorkOrderLineItem, WorkPlan, WorkPlanSelectionRule, WorkPlanTemplate, WorkPlanTemplateEntry, WorkStep, WorkStepTemplate, dfsle__AgreementConfiguration__c, dfsle__BulkList__c, dfsle__BulkStatus__c, dfsle__CustomParameterMap__c, dfsle__EnvelopeConfiguration__c, dfsle__EnvelopeStatus__c, dfsle__GenTemplate__c, dfsle__Log__c, dfsle__RecipientStatus__c, dsfs__CustomParameterMap__c, dsfs__DocuSign_Recipient_Status__c, dsfs__DocuSign_Status__c, dsfs__EnvelopeConfiguration__c, et4ae5__Triggered_Send_Execution__c
WhoCount | 관계 카운트 | int
WhatCount | 카운트에 연결됨 | int
Subject | 제목 | combobox
ActivityDate | 기한 전용 | date
Status | 상태 | picklist [Open, Completed]
Priority | 중요도 | picklist [High, Normal]
IsHighPriority | 높은 우선권 | boolean
OwnerId | 담당자 ID | reference → Group, User
Description | 상세 설명 | textarea
Type | 유형 | picklist [Call, Meeting, Other]
AccountId | 거래처 | reference → Account
IsClosed | 마감됨 | boolean
CreatedDate | 작성 일자 | datetime
CreatedById | 작성자 ID | reference → User
IsArchived | 보관됨 | boolean
IsVisibleInSelfService | 공개 | boolean
CallDurationInSeconds | 소요기간(시간) | int
CallType | 통화 유형 | picklist [Internal, Inbound, Outbound]
CallDisposition | 통화 결과 | string
CallObject | 통화 개체 식별자 | string
ReminderDateTime | 미리 알림 일자/시간 | datetime
IsReminderSet | 미리 알림 설정 | boolean
RecurrenceActivityId | 반복 활동 ID | reference → Task
IsRecurrence | 과업의 반복 시리즈 만들기 | boolean
RecurrenceStartDateOnly | 반복 시작 | date
RecurrenceEndDateOnly | 반복 종료 | date
RecurrenceTimeZoneSidKey | 반복 시간대 | picklist
RecurrenceType | 반복 유형 | picklist [RecursDaily, RecursEveryWeekday, RecursMonthly, RecursMonthlyNth, RecursWeekly, RecursYearly, RecursYearlyNth]
RecurrenceInterval | 반복 간격 | int
RecurrenceDayOfWeekMask | 주별 마스크의 반복 일자 | int
RecurrenceDayOfMonth | 월의 반복 일자 | int
RecurrenceInstance | 반복 인스턴스 | picklist [First, Second, Third, Fourth, Last]
RecurrenceMonthOfYear | 연의 반복 월 | picklist
RecurrenceRegeneratedType | 이 과업 반복 | picklist [RecurrenceRegenerateAfterDueDate, RecurrenceRegenerateAfterToday, RecurrenceRegenerated]
TaskSubtype | 과업 하위 유형 | picklist [Task, Email, ListEmail, Cadence, Call, LinkedIn]
CompletedDateTime | 완료 일자 | datetime
CallDateTime__c | 통화시간 | datetime
Lead__c | 잠재고객 | reference → Lead
fm_Brand_Branch__c | 상호(지점명) | string
Matrix_Agent_ID__c | 상담원ID | string
Matrix_Answered_At__c | 통화연결시간 | datetime
Matrix_Call_ID__c | 콜ID | string
Matrix_Call_State__c | 콜 상태 | string
Matrix_Call_Type__c | 콜 유형 | string
Matrix_Callback_Rec__c | 콜백녹음 | url
Matrix_CallerID__c | 발신번호 | string
Matrix_Created_At__c | 콜시작시간 | datetime
Matrix_DNIS_Memo__c | 인입회선이름 | string
Matrix_DNIS__c | 인입회선번호 | string
Matrix_Extension__c | 내선번호 | string
Matrix_IVR_Tag_Memo__c | IVR 인입경로 | string
Matrix_IVR_Tag__c | IVR 태그 | string
Matrix_Is_Ans__c | 통화연결 | boolean
Matrix_Phone_Number__c | 전화번호 | phone
Matrix_Queue_Name__c | 큐 이름 | string
Matrix_Queued_At__c | 큐진입시간 | datetime
Matrix_Ring_At__c | 링시작시간 | datetime
Matrix_TM_Connect__c | 통화시간 | double
Matrix_TM_Queue__c | 큐대기시간 | double
Matrix_TM_Ring__c | 링시간 | double
Matrix_Updated_At__c | 통화종료시간 | datetime
Matrix_C_20s_Abandon_Calls__c | 20초내 포기호 | double
Matrix_C_20s_Answered_Calls__c | 20초내 응답호 | double
Matrix_C_Abandon_Calls__c | 포기호 | double
Matrix_C_Answered_Calls__c | 응대호 | double
Matrix_C_IVR_Abandon_Calls__c | IVR 포기호 | double
Matrix_C_Inbound_Calls__c | 전체인입호 | double
Matrix_C_Queue_Calls__c | 큐인입호 | double
Matrix_Call_Info__c | 통화정보 | string
Matrix_Call_Recording__c | 녹취 | string
Matrix_TM_Abandon__c | 큐포기시간 | double
Matrix_TM_Occupancy__c | 점유시간 | double
Matrix_TM_Queue_Wait__c | 큐대기시간(누적) | double
Matrix_TM_Total_Wait__c | 전체대기시간 | double
FSL__Count_of_Events__c | 이벤트 수 | double
FSL__Count_of_Tasks__c | 작업 수 | double
FSL__Event_Type__c | 이벤트 유형 | picklist [Service Appointment, Resource Absence]
CustomerPhone__c | 고객 전화번호 | string
CallId__c | 통화ID | string
CallStartDate__c | 통화시작일시 | datetime
CallTime__c | 총 통화시간 | string
CallType__c | 통화유형 | string
UserPhone__c | 상담원 전화번호 | string
Matrix_Category__c | 상담유형 추천 | string
Matrix_Emotion__c | 고객감정 | string
Matrix_STT__c | Matrix STT | reference → Matrix_STT__c

## Order (출고)
Id | 출고 ID | id
OwnerId | 출고 소유자 | reference → Group, User
ContractId | 계약 id | reference → Contract
AccountId | 상호 | reference → Account
Pricebook2Id | 가격 목록 id | reference → Pricebook2
OriginalOrderId | 최초 출고 | reference → Order
OpportunityId | 영업기회 | reference → Opportunity
QuoteId | 견적서 ID | reference → Quote
EffectiveDate | 출고신청서 작성일자 | date
EndDate | 출고 마감 일자 | date
IsReductionOrder | 축소 출고 | boolean
Status | 진행상태 | picklist [출고신청서작성, 재작성요청, 출고전, 출고진행중, 출고완료]
Description | 설명 | textarea
CustomerAuthorizedById | ID에 의하여 인증된 고객 | reference → Contact
CustomerAuthorizedDate | 고객 인증 일자 | date
CompanyAuthorizedById | ID에 의하여 인증된 회사 | reference → User
CompanyAuthorizedDate | 회사 인증 일자 | date
Type | 출고 유형 | picklist [일반, 추가구매, A/S, 긴급민원_고객지원팀, 샘플, 본사 출고(샘플X)]
Name | 출고 이름 | string
PoDate | PO 일자 | date
PoNumber | PO 번호 | string
OrderReferenceNumber | 출고 참조 번호 | string
BillToContactId | 요금 청구 연락처 ID | reference → Contact
ShipToContactId | 배송지 연락처 ID | reference → Contact
ActivatedDate | 활성화된 일자 | datetime
ActivatedById | 활성화한 사람 ID | reference → User
StatusCode | 상태 범주 | picklist [Draft, Activated, Canceled, Expired, Superseded]
OrderNumber | 출고 번호 | string
TotalAmount | 출고 금액 | currency
CreatedDate | 작성 일자 | datetime
CreatedById | 작성자 ID | reference → User
AmaranthCode__c | Amaranth Code | string
DeliveryType__c | 배송방법 | picklist [00004, 00001, 퀵(긴급), 00002, 00003, -]
InstallConfirmedDate__c | 설치 확정일자 | date
InstallationPartners__c | 설치 업체 | picklist
InternalUserContact__c | 연락처 | phone
MasterTabletAmount__c | 마스터 태블릿 수량 | double
OrderDecision__c | 출고 구분 | picklist [신규 출고, 계약서 업데이트용, A/S, 소모품 추가구매, 양도양수]
OrderRequest__c | 물류신청서 특이사항(인쇄용) | string
OrderType__c | 출고유형 | picklist
OutputDate__c | 출고 일자 | date
Request_Internal__c | 요청사항(내부용) | string
fm_OrdersPhone__c | 출고 소유자 연락처 | string
fm_OwnerDepartment__c | 출고 소유자 부서(미사용) | string
Brand_Branch__c | 상호(지점명) | string
Field1__c | 견적 내용 | string
fm_BranchName__c | 지점명 | string
fm_CommuicationPhone__c | 소통_연락처 | string
fm_ContractStatus__c | 계약상태 | string
fm_PresidentPhone__c | 대표자 연락처 | string
fm_TabletID__c | 태블릿 ID | string
fm_TabletPW__c | 태블릿 PW | string
IsCallout__c | IsCallout | boolean
OwnerEmpCd__c | Owner empCd | string
OldKeyValue__c | (과거)KEY값 | string
OldCreatedDate__c | (과거)생성일자 | datetime
ru_OrderitemRecordQty__c | 출고제품 레코드 수량 | double
fm_OpportunityId__c | 영업기회 ID | string
fm_BOUser__c | BO담당자 | string
fm_DepartmentBO__c | 부서(BO) | string
PresidentPhone__c | 대표자 연락처 | string
CommunicationPhone__c | 소통 연락처 | string
LocalType__c | 국내해외 구분 | picklist [Korea, US, Canada, Other country]
Owner_Department__c | 부서 | string
TorderTag_Status__c | 멀티오더 출고 여부 | boolean
torderTag_senddate__c | 멀티오더 출고예정일 | date
fm_PaymentType__c | 결제방식 | string
Courier__c | 택배사 | picklist [CJ대한통운, 경동택배]
CourierDescription__c | 비고(택배) | textarea
TrackingNumber__c | 운송장번호 | string
IsSignedConfirmation__c | 서명 완료 | boolean
Installation__c | 설치 | reference → Installation__c
Case__c | 문의사항 | reference → Case
SignedDate__c | 서명 완료 날짜 | datetime
fm_Account_FRHQ__c | 상호의 FR본사 | string
ru_ItemQty__c | 총 제품 개수 | double

## OrderItem (출고 제품)
Id | 출고 제품 ID | id
Product2Id | 제품 ID | reference → Product2
OrderId | 출고 ID | reference → Order
PricebookEntryId | 가격 목록 항목 ID | reference → PricebookEntry
OriginalOrderItemId | 최초 출고 제품 | reference → OrderItem
QuoteLineItemId | 견적서 행 아이템 ID | reference → QuoteLineItem
AvailableQuantity | 가능 수량 | double
Quantity | 수량 | double
UnitPrice | 단가 | currency
ListPrice | 정가 | currency
TotalPrice | 총액 | currency
ServiceDate | 시작 일자 | date
EndDate | 마감 일자 | date
Description | 라인 설명 | string
CreatedDate | 작성 일자 | datetime
CreatedById | 작성자 ID | reference → User
OrderItemNumber | 제품 주문 번호 | string
Description__c | 비고 | string
fm_OrderStatus__c | fm_OrderStatus | string
fm_ProductFamily__c | 제품군(중) | string
fm_Quantity__c | 수량 | double
InstalledQuantity__c | 설치 수량 | double
SerialNumberTemp__c | 일련번호(임시지장) | textarea

## User (사용자)
Id | 사용자 ID | id
Username | 사용자 이름 | string
LastName | 성 | string
FirstName | 이름(성 없이) | string
Name | 전체 이름 | string
CompanyName | 회사 이름 | string
Division | 디비전 | string
Department | 부서 | string
Title | 직급 | string
Street | 상세 주소 | textarea
City | 시 | string
State | 시/도 | string
PostalCode | 우편 번호 | string
Country | 국가 | string
Email | 이메일 | email
EmailPreferencesAutoBcc | AutoBcc | boolean
EmailPreferencesAutoBccStayInTouch | AutoBccStayInTouch | boolean
EmailPreferencesStayInTouchReminder | StayInTouchReminder | boolean
SenderEmail | 이메일 보낸 사람 주소 | email
SenderName | 이메일 보낸 사람 이름 | string
Signature | 이메일 서명 | textarea
StayInTouchSubject | 연락처 관리 이메일 제목 | string
StayInTouchSignature | 연락처 관리 이메일 서명 | textarea
StayInTouchNote | 연락처 관리 이메일 노트 | string
Phone | 전화 | phone
Fax | 팩스 | phone
MobilePhone | 모바일 | phone
Alias | 별칭 | string
CommunityNickname | 별명 | string
BadgeText | 사용자 사진 배지 텍스트 오버레이 | string
IsActive | 활성 | boolean
TimeZoneSidKey | 표준 시간대 | picklist
UserRoleId | 역할 ID | reference → UserRole
LocaleSidKey | 로캘 | picklist
ReceivesInfoEmails | 정보 이메일 | boolean
ReceivesAdminInfoEmails | 관리자 정보 이메일 | boolean
EmailEncodingKey | 이메일 인코딩 | picklist [UTF-8, ISO-8859-1, Shift_JIS, ISO-2022-JP, EUC-JP, ks_c_5601-1987, Big5, GB2312, Big5-HKSCS, x-SJIS_0213]
ProfileId | 프로필 ID | reference → Profile
UserType | 사용자 유형 | picklist [Standard, PowerPartner, PowerCustomerSuccess, CustomerSuccess, Guest, CspLitePortal, CsnOnly, SelfService]
StartDay | 시작일 | picklist
EndDay | 종료일 | picklist
LanguageLocaleKey | 언어 | picklist
EmployeeNumber | 직원 번호 | string
DelegatedApproverId | 위임된 승인자 ID | reference → Group, User
ManagerId | 관리자 ID | reference → User
LastLoginDate | 최종 로그인 | datetime
LastPasswordChangeDate | 마지막 암호 변경 또는 재설정 | datetime
CreatedDate | 작성 일자 | datetime
CreatedById | 작성자 ID | reference → User
PasswordExpirationDate | 암호 만료 일자 | datetime
NumberOfFailedLogins | 실패한 로그인 시도 횟수 | int
SuAccessExpirationDate | SU 액세스 만료 일자 | date
OfflineTrialExpirationDate | Offline Edition 평가 만료 일자 | datetime
OfflinePdaTrialExpirationDate | Sales Anywhere 평가 만료 일자 | datetime
UserPermissionsMarketingUser | 마케팅 사용자 | boolean
UserPermissionsOfflineUser | 오프라인 사용자 | boolean
UserPermissionsAvantgoUser | AvantGo 사용자 | boolean
UserPermissionsCallCenterAutoLogin | 콜 센터에 자동 로그인 | boolean
UserPermissionsSFContentUser | Salesforce CRM Content 사용자 | boolean
UserPermissionsKnowledgeUser | 지식 사용자 | boolean
UserPermissionsInteractionUser | Flow 사용자 | boolean
UserPermissionsSupportUser | Service Cloud 사용자 | boolean
ForecastEnabled | 예측 허용 | boolean
UserPreferencesActivityRemindersPopup | ActivityRemindersPopup | boolean
UserPreferencesEventRemindersCheckboxDefault | EventRemindersCheckboxDefault | boolean
UserPreferencesTaskRemindersCheckboxDefault | TaskRemindersCheckboxDefault | boolean
UserPreferencesReminderSoundOff | ReminderSoundOff | boolean
UserPreferencesDisableAllFeedsEmail | DisableAllFeedsEmail | boolean
UserPreferencesDisableFollowersEmail | DisableFollowersEmail | boolean
UserPreferencesDisableProfilePostEmail | DisableProfilePostEmail | boolean
UserPreferencesDisableChangeCommentEmail | DisableChangeCommentEmail | boolean
UserPreferencesDisableLaterCommentEmail | DisableLaterCommentEmail | boolean
UserPreferencesDisProfPostCommentEmail | DisProfPostCommentEmail | boolean
UserPreferencesContentNoEmail | ContentNoEmail | boolean
UserPreferencesContentEmailAsAndWhen | ContentEmailAsAndWhen | boolean
UserPreferencesApexPagesDeveloperMode | ApexPagesDeveloperMode | boolean
UserPreferencesReceiveNoNotificationsAsApprover | ReceiveNoNotificationsAsApprover | boolean
UserPreferencesReceiveNotificationsAsDelegatedApprover | ReceiveNotificationsAsDelegatedApprover | boolean
UserPreferencesHideCSNGetChatterMobileTask | HideCSNGetChatterMobileTask | boolean
UserPreferencesDisableMentionsPostEmail | DisableMentionsPostEmail | boolean
UserPreferencesDisMentionsCommentEmail | DisMentionsCommentEmail | boolean
UserPreferencesHideCSNDesktopTask | HideCSNDesktopTask | boolean
UserPreferencesHideChatterOnboardingSplash | HideChatterOnboardingSplash | boolean
UserPreferencesHideSecondChatterOnboardingSplash | HideSecondChatterOnboardingSplash | boolean
UserPreferencesDisCommentAfterLikeEmail | DisCommentAfterLikeEmail | boolean
UserPreferencesDisableLikeEmail | DisableLikeEmail | boolean
UserPreferencesSortFeedByComment | SortFeedByComment | boolean
UserPreferencesDisableMessageEmail | DisableMessageEmail | boolean
UserPreferencesDisableBookmarkEmail | DisableBookmarkEmail | boolean
UserPreferencesDisableSharePostEmail | DisableSharePostEmail | boolean
UserPreferencesEnableAutoSubForFeeds | EnableAutoSubForFeeds | boolean
UserPreferencesDisableFileShareNotificationsForApi | DisableFileShareNotificationsForApi | boolean
UserPreferencesShowTitleToExternalUsers | ShowTitleToExternalUsers | boolean
UserPreferencesShowManagerToExternalUsers | ShowManagerToExternalUsers | boolean
UserPreferencesShowEmailToExternalUsers | ShowEmailToExternalUsers | boolean
UserPreferencesShowWorkPhoneToExternalUsers | ShowWorkPhoneToExternalUsers | boolean
UserPreferencesShowMobilePhoneToExternalUsers | ShowMobilePhoneToExternalUsers | boolean
UserPreferencesShowFaxToExternalUsers | ShowFaxToExternalUsers | boolean
UserPreferencesShowCityToExternalUsers | ShowCityToExternalUsers | boolean
UserPreferencesShowStateToExternalUsers | ShowStateToExternalUsers | boolean
UserPreferencesShowPostalCodeToExternalUsers | ShowPostalCodeToExternalUsers | boolean
UserPreferencesShowCountryToExternalUsers | ShowCountryToExternalUsers | boolean
UserPreferencesShowProfilePicToGuestUsers | ShowProfilePicToGuestUsers | boolean
UserPreferencesShowTitleToGuestUsers | ShowTitleToGuestUsers | boolean
UserPreferencesShowCityToGuestUsers | ShowCityToGuestUsers | boolean
UserPreferencesShowStateToGuestUsers | ShowStateToGuestUsers | boolean
UserPreferencesShowPostalCodeToGuestUsers | ShowPostalCodeToGuestUsers | boolean
UserPreferencesShowCountryToGuestUsers | ShowCountryToGuestUsers | boolean
UserPreferencesShowForecastingChangeSignals | ShowForecastingChangeSignals | boolean
UserPreferencesLiveAgentMiawSetupDeflection | LiveAgentMiawSetupDeflection | boolean
UserPreferencesHideS1BrowserUI | HideS1BrowserUI | boolean
UserPreferencesDisableEndorsementEmail | DisableEndorsementEmail | boolean
UserPreferencesPathAssistantCollapsed | PathAssistantCollapsed | boolean
UserPreferencesCacheDiagnostics | CacheDiagnostics | boolean
UserPreferencesShowEmailToGuestUsers | ShowEmailToGuestUsers | boolean
UserPreferencesShowManagerToGuestUsers | ShowManagerToGuestUsers | boolean
UserPreferencesShowWorkPhoneToGuestUsers | ShowWorkPhoneToGuestUsers | boolean
UserPreferencesShowMobilePhoneToGuestUsers | ShowMobilePhoneToGuestUsers | boolean
UserPreferencesShowFaxToGuestUsers | ShowFaxToGuestUsers | boolean
UserPreferencesLightningExperiencePreferred | LightningExperiencePreferred | boolean
UserPreferencesPreviewLightning | PreviewLightning | boolean
UserPreferencesHideEndUserOnboardingAssistantModal | HideEndUserOnboardingAssistantModal | boolean
UserPreferencesHideLightningMigrationModal | HideLightningMigrationModal | boolean
UserPreferencesHideSfxWelcomeMat | HideSfxWelcomeMat | boolean
UserPreferencesHideBiggerPhotoCallout | HideBiggerPhotoCallout | boolean
UserPreferencesGlobalNavBarWTShown | GlobalNavBarWTShown | boolean
UserPreferencesGlobalNavGridMenuWTShown | GlobalNavGridMenuWTShown | boolean
UserPreferencesCreateLEXAppsWTShown | CreateLEXAppsWTShown | boolean
UserPreferencesFavoritesWTShown | FavoritesWTShown | boolean
UserPreferencesRecordHomeSectionCollapseWTShown | RecordHomeSectionCollapseWTShown | boolean
UserPreferencesRecordHomeReservedWTShown | RecordHomeReservedWTShown | boolean
UserPreferencesFavoritesShowTopFavorites | FavoritesShowTopFavorites | boolean
UserPreferencesExcludeMailAppAttachments | ExcludeMailAppAttachments | boolean
UserPreferencesSuppressTaskSFXReminders | SuppressTaskSFXReminders | boolean
UserPreferencesSuppressEventSFXReminders | SuppressEventSFXReminders | boolean
UserPreferencesPreviewCustomTheme | PreviewCustomTheme | boolean
UserPreferencesHasCelebrationBadge | HasCelebrationBadge | boolean
UserPreferencesUserDebugModePref | UserDebugModePref | boolean
UserPreferencesSRHOverrideActivities | SRHOverrideActivities | boolean
UserPreferencesNewLightningReportRunPageEnabled | NewLightningReportRunPageEnabled | boolean
UserPreferencesReverseOpenActivitiesView | ReverseOpenActivitiesView | boolean
UserPreferencesShowTerritoryTimeZoneShifts | ShowTerritoryTimeZoneShifts | boolean
UserPreferencesHasSentWarningEmail | HasSentWarningEmail | boolean
UserPreferencesHasSentWarningEmail238 | HasSentWarningEmail238 | boolean
UserPreferencesHasSentWarningEmail240 | HasSentWarningEmail240 | boolean
UserPreferencesNativeEmailClient | NativeEmailClient | boolean
UserPreferencesSendListEmailThroughExternalService | SendListEmailThroughExternalService | boolean
UserPreferencesHideBrowseProductRedirectConfirmation | HideBrowseProductRedirectConfirmation | boolean
UserPreferencesHideOnlineSalesAppWelcomeMat | HideOnlineSalesAppWelcomeMat | boolean
UserPreferencesShowForecastingRoundedAmounts | ShowForecastingRoundedAmounts | boolean
IsPartner | 파트너 | boolean
ContactId | 연락처 ID | reference → Contact
AccountId | 거래처 ID | reference → Account
CallCenterId | 콜 센터 ID | reference → CallCenter
Extension | 내선 번호 | phone
PortalRole | 포털 역할 수준 | picklist [Executive, Manager, Worker, PersonAccount]
IsPortalEnabled | 포털 활성화 | boolean
FederationIdentifier | SAML 연합 ID | string
AboutMe | 내 정보 | textarea
IsExtIndicatorVisible | 외부 표시기 표시 | boolean
OutOfOfficeMessage | 부재중 메시지 | string
DigestFrequency | Chatter 이메일 강조 빈도 | picklist [D, W, N]
DefaultGroupNotificationFrequency | 그룹 가입 시 기본 알림 주기 | picklist [P, D, W, N]
IsProfilePhotoActive | 프로파일 사진 있음 | boolean
dsfs__DSProSFUsername__c | DSProSFUsername | string
dfsle__CanManageAccount__c | DocuSign 계정 관리 가능 | boolean
dfsle__Provisioned__c | DocuSign 프로비저닝된 날짜 | date
dfsle__Status__c | DocuSign 사용자 상태 | picklist [Inactive, Pending, Active]
dfsle__Username__c | DocuSign 사용자 이름 | string
SlackMemberID__c | 슬랙ID | string
Division__c | 본부 | string
Team__c | 직무 | string
empCd__c | 사원코드 | string
businessId__c | businessId | double
businessName__c | businessName | string
businessType__c | businessType | string
departmentId__c | departmentId | double
employeeId__c | employeeId | double
employeeName__c | employeeName | string
userId__c | userId | double
et4ae5__Default_ET_Page__c | Default Marketing Cloud Page | string
et4ae5__Default_MID__c | Default MID | string
et4ae5__ExactTargetForAppExchangeAdmin__c | Marketing Cloud for AppExchange Admin | boolean
et4ae5__ExactTargetForAppExchangeUser__c | Marketing Cloud for AppExchange User | boolean
et4ae5__ExactTargetUsername__c | Marketing Cloud Username | string
et4ae5__ExactTarget_OAuth_Token__c | @deprecated | encryptedstring
et4ae5__ValidExactTargetAdmin__c | Valid Marketing Cloud Admin | boolean
et4ae5__ValidExactTargetUser__c | Valid Marketing Cloud User | boolean
fm_ProfileName__c | fm_ProfileName | string
fm_UserId__c | 사용자 Id | string

