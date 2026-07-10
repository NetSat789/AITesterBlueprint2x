"""
test_products.py - Test cases for the Products/Inventory page.
Covers: product listing, sorting, add to cart, remove from cart, navigation.
"""
import pytest
from pages.products_page import ProductsPage
from utils.config_reader import ConfigReader


@pytest.mark.products
@pytest.mark.regression
class TestProducts:
    """Test suite for Products page functionality."""

    def test_products_page_displayed(self, logged_in_driver):
        """TC_PROD_001: Verify products page loads with correct title."""
        products = ProductsPage(logged_in_driver)
        assert products.is_products_page_displayed(), "Products page not displayed"
        assert products.get_page_header() == "Products"

    def test_products_count(self, logged_in_driver):
        """TC_PROD_002: Verify 6 products are listed on the page."""
        products = ProductsPage(logged_in_driver)
        assert products.get_product_count() == 6, "Expected 6 products on SauceDemo"

    def test_all_product_images_displayed(self, logged_in_driver):
        """TC_PROD_003: Verify all product images are visible."""
        products = ProductsPage(logged_in_driver)
        assert products.are_all_images_displayed(), "Not all product images are displayed"

    def test_sort_products_name_za(self, logged_in_driver):
        """TC_PROD_004: Verify sorting products by Name Z-A."""
        products = ProductsPage(logged_in_driver)
        products.sort_by_name_za()
        names = products.get_all_product_names()
        assert names == sorted(names, reverse=True), "Products not sorted Z to A"

    def test_sort_products_price_low_high(self, logged_in_driver):
        """TC_PROD_005: Verify sorting products by Price Low to High."""
        products = ProductsPage(logged_in_driver)
        products.sort_by_price_low_high()
        prices = products.get_all_product_prices()
        numeric_prices = [float(p.replace("$", "")) for p in prices]
        assert numeric_prices == sorted(numeric_prices), "Products not sorted by price low to high"

    def test_add_product_to_cart(self, logged_in_driver):
        """TC_PROD_006: Verify adding a product updates the cart badge."""
        products = ProductsPage(logged_in_driver)
        products.add_product_by_name("sauce-labs-backpack")
        assert products.get_cart_item_count() == 1, "Cart badge should show 1"

    def test_remove_product_from_cart(self, logged_in_driver):
        """TC_PROD_007: Verify removing a product updates the cart badge."""
        products = ProductsPage(logged_in_driver)
        products.add_product_by_name("sauce-labs-backpack")
        assert products.get_cart_item_count() == 1
        products.remove_product_by_name("sauce-labs-backpack")
        assert products.get_cart_item_count() == 0, "Cart badge should be empty"
