package com.saucelabs.tests;

import com.saucelabs.pages.CartPage;
import com.saucelabs.pages.ProductsPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * TestCart - Test cases for the Cart page.
 * Covers: cart display, add/remove items, continue shopping, checkout navigation.
 */
@Test(groups = {"cart", "regression"})
public class TestCart extends BaseTest {

    @BeforeMethod(alwaysRun = true)
    @Override
    public void setUp(java.lang.reflect.Method method) {
        super.setUp(method);
        getLoggedInDriver(); // log in before each test
    }

    @Test(description = "TC_CART_001: Verify empty cart page loads correctly.")
    public void testEmptyCartDisplayed() {
        ProductsPage products = new ProductsPage(driver);
        products.goToCart();

        CartPage cart = new CartPage(driver);
        Assert.assertTrue(cart.isCartPageDisplayed(), "Cart page not displayed");
        Assert.assertTrue(cart.isCartEmpty(), "Cart should be empty initially");
    }

    @Test(description = "TC_CART_002: Verify item added from products page appears in cart.")
    public void testAddedItemAppearsInCart() {
        ProductsPage products = new ProductsPage(driver);
        products.addProductByName("sauce-labs-backpack");
        products.goToCart();

        CartPage cart = new CartPage(driver);
        Assert.assertEquals(cart.getCartItemCount(), 1);
        Assert.assertTrue(cart.isProductInCart("Sauce Labs Backpack"));
    }

    @Test(description = "TC_CART_003: Verify removing an item from the cart.")
    public void testRemoveItemFromCart() {
        ProductsPage products = new ProductsPage(driver);
        products.addProductByName("sauce-labs-backpack");
        products.goToCart();

        CartPage cart = new CartPage(driver);
        cart.removeItemByName("sauce-labs-backpack");
        Assert.assertTrue(cart.isCartEmpty(), "Cart should be empty after removal");
    }

    @Test(description = "TC_CART_004: Verify Continue Shopping returns to products page.")
    public void testContinueShoppingButton() {
        ProductsPage products = new ProductsPage(driver);
        products.goToCart();

        CartPage cart = new CartPage(driver);
        Assert.assertTrue(cart.isContinueShoppingBtnDisplayed());
        cart.clickContinueShopping();

        ProductsPage productsPage = new ProductsPage(driver);
        Assert.assertTrue(productsPage.isProductsPageDisplayed());
    }

    @Test(description = "TC_CART_005: Verify adding multiple items to the cart.")
    public void testMultipleItemsInCart() {
        ProductsPage products = new ProductsPage(driver);
        products.addProductByName("sauce-labs-backpack");
        products.addProductByName("sauce-labs-bike-light");
        products.goToCart();

        CartPage cart = new CartPage(driver);
        Assert.assertEquals(cart.getCartItemCount(), 2);
        Assert.assertTrue(cart.isProductInCart("Sauce Labs Backpack"));
        Assert.assertTrue(cart.isProductInCart("Sauce Labs Bike Light"));
    }
}
