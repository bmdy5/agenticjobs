"""将官方 Explorbot 的逐用例报告转换成飞书同步需要的 JUnit。"""

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def convert(source, destination):
    """严格保留官方报告状态，拒绝空报告和无法识别的状态。"""
    content = Path(source).read_text()
    sections = re.split(r"(?m)^#### ", content)[1:]
    if not sections:
        raise ValueError("Official report contains no test cases")
    report_link = re.search(r"https://app\.testomat\.io/[^>\s|]+", content)
    suite = ET.Element("testsuite", name="Official Explorbot", tests=str(len(sections)))
    failed = 0
    skipped = 0
    for section in sections:
        name = section.splitlines()[0].strip()
        match = re.search(r"(?m)^\| Status \| ([^|]+) \|", section)
        if not match:
            raise ValueError("Official test has no status: " + name)
        status = match.group(1).strip()
        case = ET.SubElement(suite, "testcase", name=name, classname="official-explorbot")
        if report_link:
            case.set("testomat_report_url", report_link.group(0))
        if status in {"failed", "broken"}:
            failed += 1
            failure = ET.SubElement(case, "failure", message="官方 AI 判定此用例未达到预期")
            message = re.search(r"\*\*Message\*\*\s+>\s*([^\n]+)", section)
            if message:
                summary = message.group(1)
            else:
                steps = section.split("**Steps**", 1)[-1].split("**Stack Trace**", 1)[0]
                symptoms = [line[2:] for line in steps.splitlines()
                            if line.startswith("- ") and re.search(r"only|truncat|not achieved|not accept", line, re.I)]
                summary = "\n".join(symptoms[:2]) or "请查看官方测试报告中的失败分析。"
            failure.text = re.sub(r" _\([^\n]*\)_", "", summary)[:400]
        elif status in {"skipped", "todo"}:
            skipped += 1
            ET.SubElement(case, "skipped", message="Official Explorbot: " + status)
        elif status != "passed":
            raise ValueError("Unsupported official test status: " + status)
    suite.set("failures", str(failed))
    suite.set("skipped", str(skipped))
    ET.ElementTree(suite).write(destination, encoding="utf-8", xml_declaration=True)
    print(f"Official results: {len(sections)} tests, {failed} failed, {skipped} skipped")
    return failed


if __name__ == "__main__":
    convert(sys.argv[1], sys.argv[2])
