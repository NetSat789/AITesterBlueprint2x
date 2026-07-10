"""
login_page.py - Page Object for the SauceDemo login page.
URL: https://www.saucedemo.com/
"""
from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class LoginPage(BasePage):
    """Page Object for the Login page."""

    # Locators
    USERNAME_FIELD = (By.ID, "user-name")
    PASSWORD_FIELD = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "login-button")
    ERROR_MESSAGE = (By.CSS_SELECTOR, "[data-test='error']")
    ERROR_CLOSE_BTN = (By.CLASS_NAME, "error-button")
    LOGIN_LOGO = (By.CLASS_NAME, "login_logo")
    LOGIN_CREDENTIALS = (By.ID, "login_credentials")
    LOGIN_PASSWORD_HINT = (By.CLASS_NAME, "login_password")

    def navigate_to(self, base_url):
        """Open the login page."""
        self.driver.get(base_url)
        return self

    def enter_username(self, username):
        self.type_text(self.USERNAME_FIELD, username)
        return self

    def enter_password(self, password):
        self.type_text(self.PASSWORD_FIELD, password)
        return self

    def click_login(self):
        self.click(self.LOGIN_BUTTON)
        return self

    def login(self, username, password):
        """Complete login action."""
        self.enter_username(username)
        self.enter_password(password)
        self.click_login()

    def close_error(self):
        self.click(self.ERROR_CLOSE_BTN)
        return self

    def is_login_page_displayed(self):
        return self.is_displayed(self.LOGIN_LOGO) and self.is_displayed(self.LOGIN_BUTTON)

    def get_error_message(self):
        return self.get_text(self.ERROR_MESSAGE)

    def is_error_displayed(self):
        return self.is_displayed(self.ERROR_MESSAGE)

    def get_logo_text(self):
        return self.get_text(self.LOGIN_LOGO)

    def are_credentials_displayed(self):
        return self.is_displayed(self.LOGIN_CREDENTIALS)

    def is_password_hint_displayed(self):
        return self.is_displayed(self.LOGIN_PASSWORD_HINT)
