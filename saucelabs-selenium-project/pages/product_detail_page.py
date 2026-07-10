"""
product_detail_page.py - Page Object for individual product detail view.
URL: https://www.saucedemo.com/inventory-item.html?id=X
"""
from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class ProductDetailPage(BasePage):
    """Page Object for the Product Detail page."""

    # Locators
    PRODUCT_NAME = (By.CLASS_NAME, "inventory_details_name")
    PRODUCT_DESC = (By.CLASS_NAME, "inventory_details_desc")
    PRODUCT_PRICE = (By.CLASS_NAME, "inventory_details_price")
    PRODUCT_IMAGE = (By.CSS_SELECTOR, ".inventory_details_img_container img")
    ADD_TO_CART_BTN = (By.CSS_SELECTOR, "button[id^='add-to-cart']")
    REMOVE_BTN = (By.CSS_SELECTOR, "button[id^='remove']")
    BACK_BTN = (By.ID, "back-to-products")
    DETAILS_CONTAINER = (By.CLASS_NAME, "inventory_details_container")

    def get_product_name(self):
        return self.get_text(self.PRODUCT_NAME)

    def get_product_description(self):
        return self.get_text(self.PRODUCT_DESC)

    def get_product_price(self):
        return self.get_text(self.PRODUCT_PRICE)

    def add_to_cart(self):
        self.click(self.ADD_TO_CART_BTN)
        return self

    def remove_from_cart(self):
        self.click(self.REMOVE_BTN)
        return self

    def go_back_to_products(self):
        self.click(self.BACK_BTN)

    def is_detail_page_displayed(self):
        return self.is_displayed(self.DETAILS_CONTAINER)

    def is_image_displayed(self):
        return self.is_displayed(self.PRODUCT_IMAGE)

    def is_add_to_cart_displayed(self):
        return self.is_displayed(self.ADD_TO_CART_BTN)

    def is_remove_displayed(self):
        return self.is_displayed(self.REMOVE_BTN)

    def get_image_src(self):
        return self.wait_for_visible(self.PRODUCT_IMAGE).get_attribute("src")
