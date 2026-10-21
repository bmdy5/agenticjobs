"""将个人试用流水线的 JUnit 结果同步为飞书任务。"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

API = "https://open.feishu.cn/open-apis"
PREFIX = "【Testomat 自动回归】"


def request(path, token="", payload=None, method=None):
    """调用飞书 API，并在失败时停止同步。"""
    data = json.dumps(payload).encode() if payload is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(API + path, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as response:
        result = json.load(response)
    if result.get("code") != 0:
        raise RuntimeError(f"Feishu API code={result.get('code')}: {result.get('msg')}")
    return result


def main():
    """失败时创建或重新打开任务，通过时完成同一用例对应的任务。"""
    root = ET.parse(sys.argv[1]).getroot()
    cases = root.findall(".//testcase")
    if not cases:
        raise ValueError("No test cases; refusing to infer a successful run")
    token = request("/auth/v3/tenant_access_token/internal", payload={
        "app_id": os.environ["FEISHU_TESTOMAT_APP_ID"],
        "app_secret": os.environ["FEISHU_TESTOMAT_APP_SECRET"],
    })["tenant_access_token"]
    list_guid = os.environ["FEISHU_TESTOMAT_LIST_GUID"]
    user_id = os.environ["FEISHU_TESTOMAT_USER_OPEN_ID"]
    tasks = []
    page_token = ""
    while True:
        query = "?page_size=100" + ("&page_token=" + urllib.parse.quote(page_token) if page_token else "")
        data = request(f"/task/v2/tasklists/{list_guid}/tasks{query}", token)["data"]
        tasks.extend(data.get("items", []))
        if not data.get("has_more"):
            break
        page_token = data["page_token"]
    by_title = {task["summary"]: task for task in tasks}
    evidence = []
    run_url = os.environ["GITHUB_RUN_URL"]
    for case in cases:
        name = case.attrib["name"]
        if case.find("skipped") is not None:
            continue
        failure = case.find("failure")
        if failure is None:
            failure = case.find("error")
        title = PREFIX + name
        task = by_title.get(title)
        if failure is not None:
            description = ("个人仓库自动回归，请勿当作公司缺陷。\n"
                           f"用例：{name}\nGitHub：{run_url}\n"
                           "Testomat：https://app.testomat.io/projects/agenticjobs-personal-trial/runs\n"
                           f"失败：{failure.get('message', '')}\n{failure.text or ''}")[:6000]
            if task is None:
                task = request("/task/v2/tasks", token, {
                    "summary": title,
                    "description": description,
                    "members": [{"id": user_id, "type": "user", "role": "assignee"}],
                    "tasklists": [{"tasklist_guid": list_guid}],
                })["data"]["task"]
                by_title[title] = task
                action = "created"
            else:
                request(f"/task/v2/tasks/{task['guid']}", token, {
                    "task": {"description": description, "completed_at": "0"},
                    "update_fields": ["description", "completed_at"],
                }, "PATCH")
                action = "reopened_or_updated"
        elif task is not None:
            request(f"/task/v2/tasks/{task['guid']}", token, {
                "task": {"completed_at": str(int(time.time() * 1000))},
                "update_fields": ["completed_at"],
            }, "PATCH")
            action = "completed"
        else:
            continue
        current = request(f"/task/v2/tasks/{task['guid']}", token)["data"]["task"]
        evidence.append({"test": name, "action": action, "guid": task["guid"],
                         "status": current["status"], "url": current["url"]})
    print(json.dumps(evidence, ensure_ascii=False, indent=2))
    with open("feishu-sync-result.json", "w") as output:
        json.dump(evidence, output, ensure_ascii=False, indent=2)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as output:
            output.write("## 飞书任务同步\n\n")
            for item in evidence:
                output.write(f"- {item['action']}: [{item['test']}]({item['url']}) — {item['status']}\n")


if __name__ == "__main__":
    main()
