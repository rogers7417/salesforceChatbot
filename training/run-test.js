require('dotenv').config();
const fs = require('fs');
const { classifyIntent } = require('../src/intent');

async function main() {
  const lines = fs.readFileSync('./training/intent-dataset.jsonl', 'utf-8').trim().split('\n');
  const results = [];
  let pass = 0, fail = 0;

  for (let i = 0; i < lines.length; i++) {
    const { text, label: expected } = JSON.parse(lines[i]);
    try {
      const result = await classifyIntent(text);
      const actual = result.intent;
      const matched = actual === expected;
      if (matched) pass++; else fail++;

      results.push({ text, expected, actual, matched, detail: JSON.stringify(result) });

      if (!matched) {
        console.log(`[FAIL ${i+1}/${lines.length}] "${text}" → expected: ${expected}, got: ${actual}`);
      } else {
        console.log(`[PASS ${i+1}/${lines.length}] "${text}" → ${actual}`);
      }

      // Rate limit 방지 (100ms 대기)
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      fail++;
      results.push({ text, expected, actual: 'ERROR', matched: false, detail: err.message });
      console.log(`[ERROR ${i+1}/${lines.length}] "${text}" → ${err.message}`);
    }
  }

  // 결과 저장
  fs.writeFileSync('./training/test-results.jsonl', results.map(r => JSON.stringify(r)).join('\n'));

  // 요약
  console.log('\n=== 테스트 요약 ===');
  console.log(`총: ${lines.length}건, PASS: ${pass}건, FAIL: ${fail}건`);
  console.log(`정확도: ${(pass / lines.length * 100).toFixed(1)}%`);

  // intent별 정확도
  const byIntent = {};
  results.forEach(r => {
    if (!byIntent[r.expected]) byIntent[r.expected] = { total: 0, pass: 0 };
    byIntent[r.expected].total++;
    if (r.matched) byIntent[r.expected].pass++;
  });
  Object.entries(byIntent).forEach(([intent, stat]) => {
    console.log(`  ${intent}: ${stat.pass}/${stat.total} (${(stat.pass/stat.total*100).toFixed(0)}%)`);
  });

  // 실패 목록
  const fails = results.filter(r => !r.matched);
  if (fails.length > 0) {
    console.log('\n=== 실패 목록 ===');
    fails.forEach(f => console.log(`  "${f.text}" → expected: ${f.expected}, got: ${f.actual}`));
  }

  // 요약을 파일로도 저장
  const summary = {
    total: lines.length,
    pass,
    fail,
    accuracy: (pass / lines.length * 100).toFixed(1) + '%',
    byIntent,
    fails: fails.map(f => ({ text: f.text, expected: f.expected, actual: f.actual })),
  };
  fs.writeFileSync('./training/test-summary.json', JSON.stringify(summary, null, 2));
}

main().catch(console.error);
