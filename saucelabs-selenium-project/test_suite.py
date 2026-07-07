"""
test_suite.py - Unified test suite runner for all test classes.
Equivalent to a TestNG XML suite in Java.
Runs all 28 test cases across 5 test modules in a defined order.

Usage:
    python test_suite.py
    python test_suite.py --html=reports/report.html
"""
import sys
import pytest


# Define the test suite: ordered list of all test modules
TEST_SUITE = [
    "tests/test_login.py",
    "tests/test_products.py",
    "tests/test_product_detail.py",
    "tests/test_cart.py",
    "tests/test_checkout.py",
]


def run_suite():
    """Execute the full test suite with verbose output and HTML reporting."""
    args = [
        *TEST_SUITE,
        "-v",                                    # Verbose output
        "--tb=short",                            # Short traceback
        "--html=reports/suite_report.html",      # HTML report
        "--self-contained-html",                 # Embed CSS in report
        "-p", "no:cacheprovider",                # Disable cache warnings
    ]

    # Append any extra CLI args (e.g., -k, -m, -n)
    args.extend(sys.argv[1:])

    print("=" * 70)
    print("  SAUCE LABS SELENIUM TEST SUITE")
    print("  Target: https://www.saucedemo.com/")
    print(f"  Modules: {len(TEST_SUITE)}")
    print("=" * 70)

    exit_code = pytest.main(args)
    return exit_code


if __name__ == "__main__":
    sys.exit(run_suite())
