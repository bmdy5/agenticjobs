import assert from 'node:assert/strict';
import { readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const result = JSON.parse(readFileSync('native-evidence/triage-result.json', 'utf8'));
assert.equal(process.env.GITHUB_REPOSITORY, 'bmdy5/agenticjobs');
assert.ok(Number.isInteger(result.issue_number) && result.issue_number > 0);
assert.equal(result.file, '.github/testomat/login-demo/index.html');
assert.ok(Number.isInteger(result.line) && result.line > 0);
assert.ok(typeof result.root_cause === 'string' && result.root_cause.trim());
const source = readFileSync(result.file, 'utf8').split('\n');
assert.ok(source[result.line - 1]?.includes('maxlength="8"'), 'Agent must locate the actual defect');
const issue = JSON.parse(execFileSync('gh', [
  'issue', 'view', String(result.issue_number), '--repo', process.env.GITHUB_REPOSITORY,
  '--json', 'number,title,body,url,createdAt',
], { encoding: 'utf8' }));
assert.equal(issue.title, `【Testomat 自动定位】GitHub run ${process.env.GITHUB_RUN_ID}`);
assert.equal(issue.url, result.issue_url);
assert.ok(issue.body.includes(process.env.GITHUB_RUN_URL), 'Issue must link this workflow');
assert.ok(issue.body.includes('https://app.testomat.io/'), 'Issue must link a Testomat report');
writeFileSync('native-evidence/triage-verified.json', JSON.stringify({ result, issue }, null, 2));
appendFileSync(process.env.GITHUB_ENV, `GITHUB_ISSUE_URL=${issue.url}\n`);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    `## 官方 Agent 自动定位及提 Issue\n\n[Issue #${issue.number}](${issue.url})\n\n` +
    `位置：${result.file}:${result.line}\n\n原因：${result.root_cause}\n\n`);
}
console.log(JSON.stringify({ verified: true, issue_url: issue.url, file: result.file, line: result.line }));
