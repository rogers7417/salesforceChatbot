/**
 * SOQL 문법 자동 검증 및 수정
 * 실행 전에 알려진 에러 패턴을 미리 잡아서 고침
 */

function validateAndFix(query) {
  let fixed = query.trim();
  const fixes = [];

  // 1. DISTINCT 제거
  if (/\bDISTINCT\b/i.test(fixed)) {
    fixed = fixed.replace(/\bDISTINCT\b/gi, '');
    fixes.push('DISTINCT 제거');
  }

  // 2. 테이블 alias 제거 (FROM Account a → FROM Account)
  fixed = fixed.replace(/\bFROM\s+(\w+)\s+([a-z])\b(?!\w)/gi, (match, table, alias) => {
    // alias가 WHERE, ORDER 등이면 건너뜀
    if (['WHERE', 'ORDER', 'LIMIT', 'AND', 'OR', 'GROUP'].includes(alias.toUpperCase())) return match;
    fixes.push(`alias "${alias}" 제거`);
    // alias.field → field 로도 치환
    const aliasPattern = new RegExp(`\\b${alias}\\.`, 'g');
    fixed = fixed.replace(aliasPattern, '');
    return `FROM ${table}`;
  });

  // 3. COUNT()와 다른 필드 동시 SELECT 금지
  // SELECT Name, COUNT() FROM → SELECT COUNT() FROM
  if (/\bCOUNT\(\)/i.test(fixed) && /SELECT\s+.+,\s*COUNT\(\)/i.test(fixed)) {
    fixed = fixed.replace(/SELECT\s+[\s\S]*?(COUNT\(\))/i, 'SELECT COUNT()');
    fixes.push('COUNT()와 다른 필드 동시 사용 수정');
  }
  // SELECT COUNT(), Name FROM → SELECT COUNT() FROM
  if (/\bCOUNT\(\)/i.test(fixed) && /COUNT\(\)\s*,/i.test(fixed)) {
    fixed = fixed.replace(/COUNT\(\)\s*,[\s\S]*?FROM/i, 'COUNT() FROM');
    fixes.push('COUNT() 뒤 필드 제거');
  }

  // 4. COUNT() 뒤 FROM 누락 수정 + alias 제거
  // COUNT() Lead WHERE → COUNT() FROM Lead WHERE (FROM 누락)
  if (/COUNT\(\)\s+\w+\s+WHERE/i.test(fixed) && !/COUNT\(\)\s+FROM\b/i.test(fixed)) {
    fixed = fixed.replace(/COUNT\(\)\s+(\w+)\s+WHERE/i, 'COUNT() FROM $1 WHERE');
    fixes.push('COUNT() FROM 누락 수정');
  }
  // COUNT() cnt FROM → COUNT() FROM (alias 제거, FROM이 뒤에 있는 경우만)
  if (/COUNT\(\)\s+\w+\s+FROM/i.test(fixed)) {
    fixed = fixed.replace(/COUNT\(\)\s+\w+\s+FROM/i, 'COUNT() FROM');
    fixes.push('COUNT() alias 제거');
  }

  // 5. 세미콜론이 쿼리 안에 남아있으면 제거
  fixed = fixed.replace(/;/g, '');

  // 6. GROUP BY 제거 (지원 안 됨)
  if (/\bGROUP\s+BY\b/i.test(fixed)) {
    fixed = fixed.replace(/\bGROUP\s+BY\s+[\w.,\s]+/gi, '');
    fixes.push('GROUP BY 제거');
  }

  // 7. CALENDAR_MONTH, CALENDAR_YEAR 제거
  if (/CALENDAR_/i.test(fixed)) {
    // CALENDAR_MONTH(CreatedDate) = CALENDAR_MONTH(TODAY()) → CreatedDate = THIS_MONTH
    fixed = fixed.replace(/CALENDAR_MONTH\([^)]+\)\s*=\s*CALENDAR_MONTH\(TODAY\(\)\)\s*(AND\s*CALENDAR_YEAR\([^)]+\)\s*=\s*CALENDAR_YEAR\(TODAY\(\)\))?/gi, 'CreatedDate = THIS_MONTH');
    fixes.push('CALENDAR 함수 → 날짜 리터럴 변환');
  }

  // 8. 중복 필드 제거 (SELECT Id, Name, Id → SELECT Id, Name)
  const selectMatch = fixed.match(/^SELECT\s+([\s\S]*?)\s+FROM/i);
  if (selectMatch) {
    const fields = selectMatch[1].split(',').map(f => f.trim());
    const unique = [...new Set(fields)];
    if (unique.length < fields.length) {
      fixed = fixed.replace(selectMatch[1], unique.join(', '));
      fixes.push('중복 필드 제거');
    }
  }

  // 9. FROM 누락 수정 — 간단한 replace로 처리
  if (!/\bFROM\b/i.test(fixed)) {
    fixed = fixed.replace(/COUNT\(\)\s+(\w+)\s+WHERE/i, 'COUNT() FROM $1 WHERE');
    fixed = fixed.replace(/\)\s+(\w+)\s+WHERE/i, ') FROM $1 WHERE');
    // 일반 필드: SELECT Name Lead WHERE → SELECT Name FROM Lead WHERE
    fixed = fixed.replace(/SELECT\s+([\w.,\s]+?)\s+([A-Z]\w+(?:__c)?)\s+WHERE/i, 'SELECT $1 FROM $2 WHERE');
    if (/\bFROM\b/i.test(fixed)) fixes.push('FROM 누락 수정');
  }

  // 10. Event에서 Owner 커스텀 필드 접근 불가 — SELECT/WHERE에서 제거
  if (/\bFROM\s+Event\b/i.test(fixed)) {
    if (/Owner\.Team__c|Owner\.Department|Owner\.SlackMemberID__c/i.test(fixed)) {
      fixed = fixed.replace(/,?\s*Owner\.Team__c/gi, '');
      fixed = fixed.replace(/,?\s*Owner\.Department/gi, '');
      fixed = fixed.replace(/,?\s*Owner\.SlackMemberID__c/gi, '');
      fixed = fixed.replace(/\bAND\s+Owner\.Team__c\s*(=|IN|LIKE)[^)]*(\)|'[^']*')/gi, '');
      fixed = fixed.replace(/\bWHERE\s+Owner\.Team__c\s*(=|IN|LIKE)[^)]*(\)|'[^']*')\s*AND/gi, 'WHERE');
      fixes.push('Event에서 Owner 커스텀 필드 제거');
    }
  }

  // 10. 빈 공백 정리
  fixed = fixed.replace(/\s+/g, ' ').trim();

  if (fixes.length > 0) {
    console.log(`[SOQL 검증] 자동 수정: ${fixes.join(', ')}`);
  }

  return fixed;
}

module.exports = { validateAndFix };
