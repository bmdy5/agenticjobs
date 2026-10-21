#!/usr/bin/env bash
set -euo pipefail

# 仅在官方执行报告存在真实失败时启动官方分析 Agent。
if ! node --input-type=module -e '
  import fs from "node:fs";
  const xml = fs.readFileSync("native-evidence/defect.xml", "utf8");
  process.exit(/<testsuite\b[^>]*failures="[1-9][0-9]*"/.test(xml) ? 0 : 1);
'; then
  echo "No failed tests; skipping code analysis and Issue creation."
  exit 0
fi

node --input-type=module -e '
  import fs from "node:fs";
  let task = fs.readFileSync(".github/testomat/native-agent/triage-task.md", "utf8");
  for (const [placeholder, value] of Object.entries({
    RUN_URL: process.env.GITHUB_RUN_URL,
    REPO: process.env.GITHUB_REPOSITORY,
    RUN_ID: process.env.GITHUB_RUN_ID,
  })) {
    if (!value) throw new Error(`Missing ${placeholder}`);
    task = task.replaceAll(`{{${placeholder}}}`, value);
  }
  fs.writeFileSync("native-evidence/triage-task-expanded.md", task);
'

timeout --signal=INT 240 node .github/testomat/native-agent/node_modules/testeiya/dist/src/cli.js task \
  --model vercel-ai-gateway/openai/gpt-4.1 \
  --session-file native-evidence/testeiya-session.jsonl \
  --output native-evidence/testeiya-analysis.md \
  --output native-evidence/testeiya-run.json \
  --exit-zero < native-evidence/triage-task-expanded.md \
  > native-evidence/testeiya.log 2>&1

# 不信任 Agent 的完成声明，独立核对 GitHub 记录和源码位置。
node .github/testomat/native-agent/verify-triage.mjs
