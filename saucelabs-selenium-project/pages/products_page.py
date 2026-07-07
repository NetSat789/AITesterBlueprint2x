"""
products_page.py - Page Object for the SauceDemo inventory/products page.
URL: https://www.saucedemo.com/inventory.html
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from pages.base_page import BasePage


class ProductsPage(BasePage):
    """Page Object for the Products listing page."""

    # Locators
    PAGE_TITLE = (By.CLASS_NAME, "title")
    PRODUCT_ITEMS = (By.CLASS_NAME, "inventory_item")
    PRODUCT_NAMES = (By.CLASS_NAME, "inventory_item_name")
    PRODUCT_DESCRIPTIONS = (By.CLASS_NAME, "inventory_item_desc")
    PRODUCT_PRICES = (By.CLASS_NAME, "inventory_item_price")
    PRODUCT_IMAGES = (By.CSS_SELECTOR, ".inventory_item_img img")
    SORT_DROPDOWN = (By.CLASS_NAME, "product_sort_container")
    ADD_TO_CART_BUTTONS = (By.CSS_SELECTOR, "button[id^='add-to-cart']")
    REMOVE_BUTTONS = (By.CSS_SELECTOR, "button[id^='remove']")

    def get_page_header(self):
        return self.get_text(self.PAGE_TITLE)

    def get_all_product_names(self):
        elements = self.wait_for_all_visible(self.PRODUCT_NAMES)
        return [el.text for el in elements]

    def get_all_product_prices(self):
        elements = self.wait_for_all_visible(self.PRODUCT_PRICES)
        return [el.text for el in elements]

    def get_product_count(self):
        return len(self.driver.find_elements(*self.PRODUCT_ITEMS))

    def sort_by_name_az(self):
        Select(self.driver.find_element(*self.SORT_DROPDOWN)).select_by_value("az")
        return self

    def sort_by_name_za(self):
        Select(self.driver.find_element(*self.SORT_DROPDOWN)).select_by_value("za")
        return self

    def sort_by_price_low_high(self):
        Select(self.driver.find_element(*self.SORT_DROPDOWN)).select_by_value("lohi")
        return self

    def sort_by_price_high_low(self):
        Select(self.driver.find_element(*self.SORT_DROPDOWN)).select_by_value("hilo")
        return self

    def add_product_by_name(self, product_name):
        """Add a product to cart by its display name."""
        button_id = "add-to-cart-" + product_name.lower().replace(" ", "-")
        self.click((By.ID, button_id))
        return self

    def remove_product_by_name(self, product_name):
        button_id = "remove-" + product_name.lower().replace(" ", "-")
        self.click((By.ID, button_id))
        return self

    def click_product_by_name(self, product_name):
        """Navigate to product detail page."""
        locator = (By.XPATH, f"//div[text()='{product_name}']")
        self.click(locator)

    def is_products_page_displayed(self):
        return self.is_displayed(self.PAGE_TITLE) and self.get_page_header() == "Products"

    def are_products_listed(self):
        return self.get_product_count() > 0

    def are_all_images_displayed(self):
        images = self.driver.find_elements(*self.PRODUCT_IMAGES)
        return all(img.is_displayed() for img in images)

    def is_sort_dropdown_displayed(self):
        return self.is_displayed(self.SORT_DROPDOWN)
