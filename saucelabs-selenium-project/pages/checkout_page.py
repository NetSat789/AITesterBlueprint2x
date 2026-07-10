"""
checkout_page.py - Page Object for the SauceDemo checkout pages.
Covers: Checkout Step One (info), Step Two (overview), and Complete.
"""
from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class CheckoutPage(BasePage):
    """Page Object for the Checkout flow (Step 1, Step 2, Complete)."""

    # Step One - Your Information
    PAGE_TITLE = (By.CLASS_NAME, "title")
    FIRST_NAME_FIELD = (By.ID, "first-name")
    LAST_NAME_FIELD = (By.ID, "last-name")
    POSTAL_CODE_FIELD = (By.ID, "postal-code")
    CONTINUE_BTN = (By.ID, "continue")
    CANCEL_BTN = (By.ID, "cancel")
    ERROR_MESSAGE = (By.CSS_SELECTOR, "[data-test='error']")

    # Step Two - Overview
    SUMMARY_INFO = (By.CLASS_NAME, "summary_info")
    PAYMENT_INFO = (By.CSS_SELECTOR, ".summary_value_label:nth-of-type(1)")
    ITEM_TOTAL = (By.CLASS_NAME, "summary_subtotal_label")
    TAX = (By.CLASS_NAME, "summary_tax_label")
    TOTAL = (By.CLASS_NAME, "summary_total_label")
    FINISH_BTN = (By.ID, "finish")
    CART_ITEMS = (By.CLASS_NAME, "cart_item")

    # Complete
    COMPLETE_HEADER = (By.CLASS_NAME, "complete-header")
    COMPLETE_TEXT = (By.CLASS_NAME, "complete-text")
    BACK_HOME_BTN = (By.ID, "back-to-products")
    PONY_EXPRESS_IMG = (By.CLASS_NAME, "pony_express")

    # ========= Step One Actions =========
    def enter_first_name(self, name):
        self.type_text(self.FIRST_NAME_FIELD, name)
        return self

    def enter_last_name(self, name):
        self.type_text(self.LAST_NAME_FIELD, name)
        return self

    def enter_postal_code(self, code):
        self.type_text(self.POSTAL_CODE_FIELD, code)
        return self

    def fill_checkout_info(self, first_name, last_name, postal_code):
        """Fill all checkout information fields."""
        self.enter_first_name(first_name)
        self.enter_last_name(last_name)
        self.enter_postal_code(postal_code)
        return self

    def click_continue(self):
        self.click(self.CONTINUE_BTN)
        return self

    def click_cancel(self):
        self.click(self.CANCEL_BTN)

    def get_error_message(self):
        return self.get_text(self.ERROR_MESSAGE)

    def is_error_displayed(self):
        return self.is_displayed(self.ERROR_MESSAGE)

    # ========= Step Two Actions =========
    def get_item_total(self):
        return self.get_text(self.ITEM_TOTAL)

    def get_tax(self):
        return self.get_text(self.TAX)

    def get_total(self):
        return self.get_text(self.TOTAL)

    def get_overview_item_count(self):
        return len(self.driver.find_elements(*self.CART_ITEMS))

    def click_finish(self):
        self.click(self.FINISH_BTN)
        return self

    def is_summary_displayed(self):
        return self.is_displayed(self.SUMMARY_INFO)

    # ========= Complete Actions =========
    def get_complete_header(self):
        return self.get_text(self.COMPLETE_HEADER)

    def get_complete_text(self):
        return self.get_text(self.COMPLETE_TEXT)

    def click_back_home(self):
        self.click(self.BACK_HOME_BTN)

    def is_order_complete(self):
        return self.is_displayed(self.COMPLETE_HEADER)

    def get_page_header(self):
        return self.get_text(self.PAGE_TITLE)
