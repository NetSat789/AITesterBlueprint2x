"""
test_checkout.py - Test cases for the Checkout flow.
Covers: checkout info, validation, overview, order completion.
"""
import pytest
from pages.products_page import ProductsPage
from pages.cart_page import CartPage
from pages.checkout_page import CheckoutPage


@pytest.mark.checkout
@pytest.mark.regression
class TestCheckout:
    """Test suite for Checkout flow functionality."""

    def _add_item_and_go_to_checkout(self, driver):
        """Helper: add an item, go to cart, then checkout."""
        products = ProductsPage(driver)
        products.add_product_by_name("sauce-labs-backpack")
        products.go_to_cart()
        cart = CartPage(driver)
        cart.click_checkout()
        return CheckoutPage(driver)

    def test_checkout_info_page_displayed(self, logged_in_driver):
        """TC_CHKOUT_001: Verify checkout information page loads."""
        checkout = self._add_item_and_go_to_checkout(logged_in_driver)
        assert checkout.get_page_header() == "Checkout: Your Information"

    def test_checkout_with_valid_info(self, logged_in_driver):
        """TC_CHKOUT_002: Verify proceeding with valid checkout info."""
        checkout = self._add_item_and_go_to_checkout(logged_in_driver)
        checkout.fill_checkout_info("John", "Doe", "12345")
        checkout.click_continue()
        assert checkout.get_page_header() == "Checkout: Overview"

    def test_checkout_empty_first_name_error(self, logged_in_driver):
        """TC_CHKOUT_003: Verify error when first name is empty."""
        checkout = self._add_item_and_go_to_checkout(logged_in_driver)
        checkout.click_continue()
        assert checkout.is_error_displayed()
        assert "First Name is required" in checkout.get_error_message()

    def test_checkout_overview_and_finish(self, logged_in_driver):
        """TC_CHKOUT_004: Verify complete checkout flow end to end."""
        checkout = self._add_item_and_go_to_checkout(logged_in_driver)
        checkout.fill_checkout_info("Jane", "Smith", "54321")
        checkout.click_continue()

        # Verify overview page
        assert checkout.is_summary_displayed(), "Summary info not shown"
        assert "$" in checkout.get_total(), "Total should show dollar amount"

        # Finish order
        checkout.click_finish()
        assert checkout.is_order_complete(), "Order should be complete"
        assert "Thank you for your order" in checkout.get_complete_header()

    def test_checkout_cancel_returns_to_cart(self, logged_in_driver):
        """TC_CHKOUT_005: Verify cancel button returns to cart."""
        checkout = self._add_item_and_go_to_checkout(logged_in_driver)
        checkout.click_cancel()

        cart = CartPage(logged_in_driver)
        assert cart.is_cart_page_displayed(), "Should return to cart page"
