package com.saucelabs.tests;

import com.saucelabs.pages.ProductsPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.List;
import java.util.stream.Collectors;

/**
 * TestProducts - Test cases for the Products/Inventory page.
 * Covers: product listing, sorting, add to cart, remove from cart, navigation.
 */
@Test(groups = {"products", "regression"})
public class TestProducts extends BaseTest {

    @BeforeMethod(alwaysRun = true)
    @Override
    public void setUp(java.lang.reflect.Method method) {
        super.setUp(method);
        getLoggedInDriver(); // log in before each test
    }

    @Test(description = "TC_PROD_001: Verify products page loads with correct title.")
    public void testProductsPageDisplayed() {
        ProductsPage products = new ProductsPage(driver);
        Assert.assertTrue(products.isProductsPageDisplayed(), "Products page not displayed");
        Assert.assertEquals(products.getPageHeader(), "Products");
    }

    @Test(description = "TC_PROD_002: Verify 6 products are listed on the page.")
    public void testProductsCount() {
        ProductsPage products = new ProductsPage(driver);
        Assert.assertEquals(products.getProductCount(), 6, "Expected 6 products on SauceDemo");
    }

    @Test(description = "TC_PROD_003: Verify all product images are visible.")
    public void testAllProductImagesDisplayed() {
        ProductsPage products = new ProductsPage(driver);
        Assert.assertTrue(products.areAllImagesDisplayed(), "Not all product images are displayed");
    }

    @Test(description = "TC_PROD_004: Verify sorting products by Name Z-A.")
    public void testSortProductsNameZA() {
        ProductsPage products = new ProductsPage(driver);
        products.sortByNameZA();
        List<String> names = products.getAllProductNames();
        List<String> sorted = names.stream()
                .sorted((a, b) -> b.compareTo(a))
                .collect(Collectors.toList());
        Assert.assertEquals(names, sorted, "Products not sorted Z to A");
    }

    @Test(description = "TC_PROD_005: Verify sorting products by Price Low to High.")
    public void testSortProductsPriceLowHigh() {
        ProductsPage products = new ProductsPage(driver);
        products.sortByPriceLowHigh();
        List<Double> prices = products.getAllProductPrices().stream()
                .map(p -> Double.parseDouble(p.replace("$", "")))
                .collect(Collectors.toList());
        List<Double> sorted = prices.stream().sorted().collect(Collectors.toList());
        Assert.assertEquals(prices, sorted, "Products not sorted by price low to high");
    }

    @Test(description = "TC_PROD_006: Verify adding a product updates the cart badge.")
    public void testAddProductToCart() {
        ProductsPage products = new ProductsPage(driver);
        products.addProductByName("sauce-labs-backpack");
        Assert.assertEquals(products.getCartItemCount(), 1, "Cart badge should show 1");
    }

    @Test(description = "TC_PROD_007: Verify removing a product updates the cart badge.")
    public void testRemoveProductFromCart() {
        ProductsPage products = new ProductsPage(driver);
        products.addProductByName("sauce-labs-backpack");
        Assert.assertEquals(products.getCartItemCount(), 1);
        products.removeProductByName("sauce-labs-backpack");
        Assert.assertEquals(products.getCartItemCount(), 0, "Cart badge should be empty");
    }
}
