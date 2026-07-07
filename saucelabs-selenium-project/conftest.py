"""
conftest.py - Pytest fixtures for WebDriver setup/teardown and Sauce Labs reporting.
"""
import pytest
from utils.driver_factory import DriverFactory
from utils.config_reader import ConfigReader
from pages.login_page import LoginPage


@pytest.fixture(scope="function")
def driver(request):
    """Create a WebDriver instance before each test and quit after."""
    test_name = request.node.name
    _driver = DriverFactory.create_driver(test_name=test_name)
    yield _driver

    # Update Sauce Labs result if running on Sauce
    if ConfigReader.is_sauce_enabled():
        passed = not request.node.rep_call.failed if hasattr(request.node, "rep_call") else True
        DriverFactory.update_sauce_result(_driver, passed)

    _driver.quit()


@pytest.fixture(scope="function")
def logged_in_driver(driver):
    """Fixture that provides a driver already logged in with valid credentials."""
    login_page = LoginPage(driver)
    login_page.navigate_to(ConfigReader.get_base_url())
    login_page.login(ConfigReader.get_valid_username(), ConfigReader.get_valid_password())
    return driver


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture test result for Sauce Labs reporting."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)
