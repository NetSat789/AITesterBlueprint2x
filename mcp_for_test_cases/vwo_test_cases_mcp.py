import csv
import os
from typing import Any
from mcp.server.fastmcp import FastMCP

CSV_PATH = os.path.join(os.path.dirname(__file__), "testcases_vwo_100.csv")

mcp = FastMCP("VWO 100 Test Cases MCP Server")

def load_test_cases() -> list[dict[str, str]]:
    if not os.path.exists(CSV_PATH):
        return []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [row for row in reader]

def match_row(row: dict[str, str], query: str) -> bool:
    q = query.lower()
    for val in row.values():
        if q in val.lower():
            return True
    return False

@mcp.tool()
def search_by_priority(priority: str) -> list[dict[str, str]]:
    """Search test cases by priority level (e.g., Critical, High, Medium, Low)."""
    rows = load_test_cases()
    p = priority.strip().lower()
    return [r for r in rows if r.get("Priority", "").strip().lower() == p]

@mcp.tool()
def search_by_module(module: str) -> list[dict[str, str]]:
    """Search test cases by module name (e.g., Authentication System, User Input Validation)."""
    rows = load_test_cases()
    m = module.strip().lower()
    return [r for r in rows if m in r.get("Module", "").strip().lower()]

@mcp.tool()
def get_test_case_by_id(test_case_id: str) -> dict[str, str] | None:
    """Get a single test case by its Test Case ID (e.g., TC_001)."""
    rows = load_test_cases()
    tid = test_case_id.strip().lower()
    for r in rows:
        if r.get("Test Case ID", "").strip().lower() == tid:
            return r
    return None

@mcp.tool()
def search_test_cases(query: str) -> list[dict[str, str]]:
    """Full-text search across all test case fields (description, steps, expected result, etc.)."""
    rows = load_test_cases()
    return [r for r in rows if match_row(r, query)]

@mcp.tool()
def list_all_test_cases(limit: int = 50, offset: int = 0) -> list[dict[str, str]]:
    """List all test cases with pagination (default limit 50, max 100, offset 0)."""
    rows = load_test_cases()
    capped = min(limit, 100)
    return rows[offset:offset + capped]

@mcp.tool()
def get_summary_stats() -> dict[str, Any]:
    """Get summary statistics (counts by priority, module, etc.)."""
    rows = load_test_cases()
    total = len(rows)
    priority_counts: dict[str, int] = {}
    module_counts: dict[str, int] = {}
    for r in rows:
        p = r.get("Priority", "Unknown")
        priority_counts[p] = priority_counts.get(p, 0) + 1
        m = r.get("Module", "Unknown")
        module_counts[m] = module_counts.get(m, 0) + 1
    return {
        "total_test_cases": total,
        "by_priority": priority_counts,
        "by_module": module_counts,
    }

@mcp.tool()
def add_test_case(
    module: str,
    description: str,
    steps: str,
    expected_result: str,
    priority: str,
) -> dict[str, str]:
    """Append a new test case to the CSV. Auto-generates the next Test Case ID (e.g., TC_101)."""
    rows = load_test_cases()
    last_id = 0
    for r in rows:
        tid = r.get("Test Case ID", "")
        if tid.startswith("TC_"):
            try:
                num = int(tid[3:])
                if num > last_id:
                    last_id = num
            except ValueError:
                pass
    new_id = f"TC_{last_id + 1:03d}"
    new_row = {
        "Test Case ID": new_id,
        "Module": module,
        "Test Case Description": description,
        "Test Steps": steps,
        "Expected Result": expected_result,
        "Priority": priority,
    }
    fieldnames = ["Test Case ID", "Module", "Test Case Description", "Test Steps", "Expected Result", "Priority"]
    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writerow(new_row)
    return new_row

if __name__ == "__main__":
    mcp.run()
