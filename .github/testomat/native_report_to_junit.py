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
        if status in {"failed", "broken"}:
            failed += 1
            failure = ET.SubElement(case, "failure", message="Official Explorbot: " + status)
            failure.text = section.split("<details>")[0]
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
