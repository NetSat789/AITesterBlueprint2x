"""
test_product_detail.py - Test cases for the Product Detail page.
Covers: detail display, add/remove cart, navigation, content verification.
"""
import pytest
from pages.products_page import ProductsPage
from pages.product_detail_page import ProductDetailPage


PRODUCT_NAME = "Sauce Labs Backpack"


@pytest.mark.product_detail
@pytest.mark.regression
class TestProductDetail:
    """Test suite for Product Detail page functionality."""

    def test_product_detail_page_displayed(self, logged_in_driver):
        """TC_DETAIL_001: Verify product detail page loads correctly."""
        products = ProductsPage(logged_in_driver)
        products.click_product_by_name(PRODUCT_NAME)

        detail = ProductDetailPage(logged_in_driver)
        assert detail.is_detail_page_displayed(), "Detail page not displayed"
        assert detail.get_product_name() == PRODUCT_NAME

    def test_product_detail_has_image(self, logged_in_driver):
        """TC_DETAIL_002: Verify product image is displayed on detail page."""
        products = ProductsPage(logged_in_driver)
        products.click_product_by_name(PRODUCT_NAME)

        detail = ProductDetailPage(logged_in_driver)
        assert detail.is_image_displayed(), "Product image not displayed"
        assert detail.get_image_src() is not None

    def test_product_detail_has_description_and_price(self, logged_in_driver):
        """TC_DETAIL_003: Verify product description and price are present."""
        products = ProductsPage(logged_in_driver)
        products.click_product_by_name(PRODUCT_NAME)

        detail = ProductDetailPage(logged_in_driver)
        desc = detail.get_product_description()
        price = detail.get_product_price()
        assert len(desc) > 0, "Product description is empty"
        assert "$" in price, "Price should contain dollar sign"

    def test_add_to_cart_from_detail(self, logged_in_driver):
        """TC_DETAIL_004: Verify adding item to cart from detail page."""
        products = ProductsPage(logged_in_driver)
        products.click_product_by_name(PRODUCT_NAME)

        detail = ProductDetailPage(logged_in_driver)
        assert detail.is_add_to_cart_displayed(), "Add to cart button missing"
        detail.add_to_cart()
        assert detail.is_remove_displayed(), "Remove button should appear after adding"
        assert detail.get_cart_item_count() == 1

    def test_back_to_products_navigation(self, logged_in_driver):
        """TC_DETAIL_005: Verify back button returns to products page."""
        products = ProductsPage(logged_in_driver)
        products.click_product_by_name(PRODUCT_NAME)

        detail = ProductDetailPage(logged_in_driver)
        detail.go_back_to_products()

        products_again = ProductsPage(logged_in_driver)
        assert products_again.is_products_page_displayed(), "Should return to products page"
