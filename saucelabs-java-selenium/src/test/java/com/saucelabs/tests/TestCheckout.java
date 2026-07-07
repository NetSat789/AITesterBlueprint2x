package com.saucelabs.tests;

import com.saucelabs.pages.CartPage;
import com.saucelabs.pages.CheckoutPage;
import com.saucelabs.pages.ProductsPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * TestCheckout - Test cases for the Checkout flow.
 * Covers: checkout info, validation, overview, order completion.
 */
@Test(groups = {"checkout", "regression"})
public class TestCheckout extends BaseTest {

    @BeforeMethod(alwaysRun = true)
    @Override
    public void setUp(java.lang.reflect.Method method) {
        super.setUp(method);
        getLoggedInDriver(); // log in before each test
    }

    /**
     * Helper: Add an item, navigate to cart, then proceed to checkout.
     */
    private CheckoutPage addItemAndGoToCheckout() {
        ProductsPage products = new ProductsPage(driver);
        products.addProductByName("sauce-labs-backpack");
        products.goToCart();

        CartPage cart = new CartPage(driver);
        cart.clickCheckout();

        return new CheckoutPage(driver);
    }

    @Test(description = "TC_CHKOUT_001: Verify checkout information page loads.")
    public void testCheckoutInfoPageDisplayed() {
        CheckoutPage checkout = addItemAndGoToCheckout();
        Assert.assertEquals(checkout.getPageHeader(), "Checkout: Your Information");
    }

    @Test(description = "TC_CHKOUT_002: Verify proceeding with valid checkout info.")
    public void testCheckoutWithValidInfo() {
        CheckoutPage checkout = addItemAndGoToCheckout();
        checkout.fillCheckoutInfo("John", "Doe", "12345");
        checkout.clickContinue();
        Assert.assertEquals(checkout.getPageHeader(), "Checkout: Overview");
    }

    @Test(description = "TC_CHKOUT_003: Verify error when first name is empty.")
    public void testCheckoutEmptyFirstNameError() {
        CheckoutPage checkout = addItemAndGoToCheckout();
        checkout.clickContinue();
        Assert.assertTrue(checkout.isErrorDisplayed());
        Assert.assertTrue(checkout.getErrorMessage().contains("First Name is required"),
                "Expected 'First Name is required' error");
    }

    @Test(description = "TC_CHKOUT_004: Verify complete checkout flow end to end.")
    public void testCheckoutOverviewAndFinish() {
        CheckoutPage checkout = addItemAndGoToCheckout();
        checkout.fillCheckoutInfo("Jane", "Smith", "54321");
        checkout.clickContinue();

        // Verify overview page
        Assert.assertTrue(checkout.isSummaryDisplayed(), "Summary info not shown");
        Assert.assertTrue(checkout.getTotal().contains("$"), "Total should show dollar amount");

        // Finish order
        checkout.clickFinish();
        Assert.assertTrue(checkout.isOrderComplete(), "Order should be complete");
        Assert.assertTrue(checkout.getCompleteHeader().contains("Thank you for your order"),
                "Expected thank-you message");
    }

    @Test(description = "TC_CHKOUT_005: Verify cancel button returns to cart.")
    public void testCheckoutCancelReturnsToCart() {
        CheckoutPage checkout = addItemAndGoToCheckout();
        checkout.clickCancel();

        CartPage cart = new CartPage(driver);
        Assert.assertTrue(cart.isCartPageDisplayed(), "Should return to cart page");
    }
}
