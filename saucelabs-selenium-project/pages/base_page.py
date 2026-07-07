"""
base_page.py - Abstract base class for all Page Objects.
Contains common methods shared across pages.
"""
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from utils.config_reader import ConfigReader


class BasePage:
    """Base Page Object with common helper methods."""

    # Common locators
    BURGER_MENU_BTN = (By.ID, "react-burger-menu-btn")
    BURGER_CLOSE_BTN = (By.ID, "react-burger-cross-btn")
    LOGOUT_LINK = (By.ID, "logout_sidebar_link")
    ALL_ITEMS_LINK = (By.ID, "inventory_sidebar_link")
    SHOPPING_CART_LINK = (By.CLASS_NAME, "shopping_cart_link")
    SHOPPING_CART_BADGE = (By.CLASS_NAME, "shopping_cart_badge")

    def __init__(self, driver: WebDriver):
        self.driver = driver
        self.wait = WebDriverWait(driver, ConfigReader.get_explicit_wait())

    def get_page_title(self):
        return self.driver.title

    def get_current_url(self):
        return self.driver.current_url

    def wait_for_visible(self, locator):
        return self.wait.until(EC.visibility_of_element_located(locator))

    def wait_for_clickable(self, locator):
        return self.wait.until(EC.element_to_be_clickable(locator))

    def wait_for_all_visible(self, locator):
        return self.wait.until(EC.visibility_of_all_elements_located(locator))

    def click(self, locator):
        self.wait_for_clickable(locator).click()

    def type_text(self, locator, text):
        element = self.wait_for_visible(locator)
        element.clear()
        element.send_keys(text)

    def get_text(self, locator):
        return self.wait_for_visible(locator).text

    def is_displayed(self, locator):
        try:
            return self.driver.find_element(*locator).is_displayed()
        except Exception:
            return False

    def open_burger_menu(self):
        self.click(self.BURGER_MENU_BTN)

    def logout(self):
        self.open_burger_menu()
        self.click(self.LOGOUT_LINK)

    def go_to_cart(self):
        self.click(self.SHOPPING_CART_LINK)

    def get_cart_item_count(self):
        try:
            badge = self.driver.find_element(*self.SHOPPING_CART_BADGE)
            return int(badge.text)
        except Exception:
            return 0
