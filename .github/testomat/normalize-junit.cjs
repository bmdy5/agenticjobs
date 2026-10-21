const fs = require('node:fs');

// Node's JUnit reporter emits testcase elements directly under testsuites.
// Testomat reporter 2.20.0 requires a testsuite element with count attributes.
const file = process.argv[2];
const xml = fs.readFileSync(file, 'utf8');
if (!xml.includes('<testsuites>') || xml.includes('<testsuite ')) {
  throw new Error('Unexpected Node JUnit structure');
}
const tests = (xml.match(/<testcase\b/g) || []).length;
const failures = (xml.match(/<failure\b/g) || []).length;
const skipped = (xml.match(/<skipped\b/g) || []).length;
if (!tests) throw new Error('No test results found');
const opening = `<testsuite name="Agenticjobs personal trial" tests="${tests}" failures="${failures}" skipped="${skipped}" errors="0" time="0">`;
fs.writeFileSync(file, xml.replace('<testsuites>', opening).replace('</testsuites>', '</testsuite>'));
console.log(JSON.stringify({ tests, failures, skipped }));
