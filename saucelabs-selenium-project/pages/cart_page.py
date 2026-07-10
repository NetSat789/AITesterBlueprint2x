"""
cart_page.py - Page Object for the SauceDemo shopping cart page.
URL: https://www.saucedemo.com/cart.html
"""
from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class CartPage(BasePage):
    """Page Object for the Cart page."""

    # Locators
    PAGE_TITLE = (By.CLASS_NAME, "title")
    CART_ITEMS = (By.CLASS_NAME, "cart_item")
    CART_ITEM_NAMES = (By.CLASS_NAME, "inventory_item_name")
    CART_ITEM_PRICES = (By.CLASS_NAME, "inventory_item_price")
    CART_ITEM_QUANTITIES = (By.CLASS_NAME, "cart_quantity")
    REMOVE_BUTTONS = (By.CSS_SELECTOR, "button[id^='remove']")
    CONTINUE_SHOPPING_BTN = (By.ID, "continue-shopping")
    CHECKOUT_BTN = (By.ID, "checkout")

    def get_page_header(self):
        return self.get_text(self.PAGE_TITLE)

    def get_cart_item_names(self):
        elements = self.driver.find_elements(*self.CART_ITEM_NAMES)
        return [el.text for el in elements]

    def get_cart_item_count(self):
        return len(self.driver.find_elements(*self.CART_ITEMS))

    def remove_item_by_name(self, product_name):
        button_id = "remove-" + product_name.lower().replace(" ", "-")
        self.click((By.ID, button_id))
        return self

    def click_continue_shopping(self):
        self.click(self.CONTINUE_SHOPPING_BTN)

    def click_checkout(self):
        self.click(self.CHECKOUT_BTN)

    def is_cart_page_displayed(self):
        return self.is_displayed(self.PAGE_TITLE) and self.get_page_header() == "Your Cart"

    def is_cart_empty(self):
        return self.get_cart_item_count() == 0

    def is_product_in_cart(self, product_name):
        return product_name in self.get_cart_item_names()

    def is_checkout_btn_displayed(self):
        return self.is_displayed(self.CHECKOUT_BTN)

    def is_continue_shopping_btn_displayed(self):
        return self.is_displayed(self.CONTINUE_SHOPPING_BTN)
