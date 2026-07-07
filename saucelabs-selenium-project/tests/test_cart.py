"""
test_cart.py - Test cases for the Cart page.
Covers: cart display, add/remove items, continue shopping, checkout navigation.
"""
import pytest
from pages.products_page import ProductsPage
from pages.cart_page import CartPage


@pytest.mark.cart
@pytest.mark.regression
class TestCart:
    """Test suite for Cart page functionality."""

    def test_empty_cart_displayed(self, logged_in_driver):
        """TC_CART_001: Verify empty cart page loads correctly."""
        products = ProductsPage(logged_in_driver)
        products.go_to_cart()

        cart = CartPage(logged_in_driver)
        assert cart.is_cart_page_displayed(), "Cart page not displayed"
        assert cart.is_cart_empty(), "Cart should be empty initially"

    def test_added_item_appears_in_cart(self, logged_in_driver):
        """TC_CART_002: Verify item added from products page appears in cart."""
        products = ProductsPage(logged_in_driver)
        products.add_product_by_name("sauce-labs-backpack")
        products.go_to_cart()

        cart = CartPage(logged_in_driver)
        assert cart.get_cart_item_count() == 1
        assert cart.is_product_in_cart("Sauce Labs Backpack")

    def test_remove_item_from_cart(self, logged_in_driver):
        """TC_CART_003: Verify removing an item from the cart."""
        products = ProductsPage(logged_in_driver)
        products.add_product_by_name("sauce-labs-backpack")
        products.go_to_cart()

        cart = CartPage(logged_in_driver)
        cart.remove_item_by_name("sauce-labs-backpack")
        assert cart.is_cart_empty(), "Cart should be empty after removal"

    def test_continue_shopping_button(self, logged_in_driver):
        """TC_CART_004: Verify Continue Shopping returns to products page."""
        products = ProductsPage(logged_in_driver)
        products.go_to_cart()

        cart = CartPage(logged_in_driver)
        assert cart.is_continue_shopping_btn_displayed()
        cart.click_continue_shopping()

        products_page = ProductsPage(logged_in_driver)
        assert products_page.is_products_page_displayed()

    def test_multiple_items_in_cart(self, logged_in_driver):
        """TC_CART_005: Verify adding multiple items to the cart."""
        products = ProductsPage(logged_in_driver)
        products.add_product_by_name("sauce-labs-backpack")
        products.add_product_by_name("sauce-labs-bike-light")
        products.go_to_cart()

        cart = CartPage(logged_in_driver)
        assert cart.get_cart_item_count() == 2
        assert cart.is_product_in_cart("Sauce Labs Backpack")
        assert cart.is_product_in_cart("Sauce Labs Bike Light")
