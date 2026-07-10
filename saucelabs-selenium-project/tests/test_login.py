"""
test_login.py - Test cases for the Login page.
Covers: valid login, invalid credentials, locked user, empty fields, UI elements.
"""
import pytest
from pages.login_page import LoginPage
from pages.products_page import ProductsPage
from utils.config_reader import ConfigReader

BASE_URL = ConfigReader.get_base_url()
VALID_USER = ConfigReader.get_valid_username()
VALID_PASS = ConfigReader.get_valid_password()
LOCKED_USER = ConfigReader.get_locked_username()


@pytest.mark.login
@pytest.mark.smoke
class TestLogin:
    """Test suite for Login functionality."""

    def test_valid_login(self, driver):
        """TC_LOGIN_001: Verify successful login with valid credentials."""
        login_page = LoginPage(driver)
        login_page.navigate_to(BASE_URL)
        login_page.login(VALID_USER, VALID_PASS)

        products_page = ProductsPage(driver)
        assert products_page.is_products_page_displayed(), "Products page not displayed after valid login"
        assert "inventory" in driver.current_url, "URL should contain 'inventory'"

    def test_invalid_username(self, driver):
        """TC_LOGIN_002: Verify error message with invalid username."""
        login_page = LoginPage(driver)
        login_page.navigate_to(BASE_URL)
        login_page.login("invalid_user", VALID_PASS)

        assert login_page.is_error_displayed(), "Error message should be displayed"
        error_msg = login_page.get_error_message()
        assert "Username and password do not match" in error_msg

    def test_invalid_password(self, driver):
        """TC_LOGIN_003: Verify error message with invalid password."""
        login_page = LoginPage(driver)
        login_page.navigate_to(BASE_URL)
        login_page.login(VALID_USER, "wrong_password")

        assert login_page.is_error_displayed(), "Error message should be displayed"
        error_msg = login_page.get_error_message()
        assert "Username and password do not match" in error_msg

    def test_locked_out_user(self, driver):
        """TC_LOGIN_004: Verify locked-out user gets appropriate error."""
        login_page = LoginPage(driver)
        login_page.navigate_to(BASE_URL)
        login_page.login(LOCKED_USER, VALID_PASS)

        assert login_page.is_error_displayed(), "Error message should be displayed"
        error_msg = login_page.get_error_message()
        assert "locked out" in error_msg.lower(), f"Expected 'locked out' in: {error_msg}"

    def test_empty_credentials(self, driver):
        """TC_LOGIN_005: Verify error when submitting empty credentials."""
        login_page = LoginPage(driver)
        login_page.navigate_to(BASE_URL)
        login_page.click_login()

        assert login_page.is_error_displayed(), "Error message should be displayed"
        error_msg = login_page.get_error_message()
        assert "Username is required" in error_msg

    def test_login_page_ui_elements(self, driver):
        """TC_LOGIN_006: Verify all UI elements are present on login page."""
        login_page = LoginPage(driver)
        login_page.navigate_to(BASE_URL)

        assert login_page.is_login_page_displayed(), "Login page not displayed"
        assert login_page.get_logo_text() == "Swag Labs", "Logo text mismatch"
        assert login_page.are_credentials_displayed(), "Credentials section missing"
        assert login_page.is_password_hint_displayed(), "Password hint section missing"
