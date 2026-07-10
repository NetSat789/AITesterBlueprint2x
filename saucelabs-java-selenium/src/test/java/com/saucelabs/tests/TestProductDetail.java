package com.saucelabs.tests;

import com.saucelabs.pages.ProductDetailPage;
import com.saucelabs.pages.ProductsPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * TestProductDetail - Test cases for the Product Detail page.
 * Covers: detail display, add/remove cart, navigation, content verification.
 */
@Test(groups = {"product_detail", "regression"})
public class TestProductDetail extends BaseTest {

    private static final String PRODUCT_NAME = "Sauce Labs Backpack";

    @BeforeMethod(alwaysRun = true)
    @Override
    public void setUp(java.lang.reflect.Method method) {
        super.setUp(method);
        getLoggedInDriver(); // log in before each test
    }

    @Test(description = "TC_DETAIL_001: Verify product detail page loads correctly.")
    public void testProductDetailPageDisplayed() {
        ProductsPage products = new ProductsPage(driver);
        products.clickProductByName(PRODUCT_NAME);

        ProductDetailPage detail = new ProductDetailPage(driver);
        Assert.assertTrue(detail.isDetailPageDisplayed(), "Detail page not displayed");
        Assert.assertEquals(detail.getProductName(), PRODUCT_NAME);
    }

    @Test(description = "TC_DETAIL_002: Verify product image is displayed on detail page.")
    public void testProductDetailHasImage() {
        ProductsPage products = new ProductsPage(driver);
        products.clickProductByName(PRODUCT_NAME);

        ProductDetailPage detail = new ProductDetailPage(driver);
        Assert.assertTrue(detail.isImageDisplayed(), "Product image not displayed");
        Assert.assertNotNull(detail.getImageSrc(), "Image src should not be null");
    }

    @Test(description = "TC_DETAIL_003: Verify product description and price are present.")
    public void testProductDetailHasDescriptionAndPrice() {
        ProductsPage products = new ProductsPage(driver);
        products.clickProductByName(PRODUCT_NAME);

        ProductDetailPage detail = new ProductDetailPage(driver);
        String desc  = detail.getProductDescription();
        String price = detail.getProductPrice();
        Assert.assertTrue(desc.length() > 0, "Product description is empty");
        Assert.assertTrue(price.contains("$"), "Price should contain dollar sign");
    }

    @Test(description = "TC_DETAIL_004: Verify adding item to cart from detail page.")
    public void testAddToCartFromDetail() {
        ProductsPage products = new ProductsPage(driver);
        products.clickProductByName(PRODUCT_NAME);

        ProductDetailPage detail = new ProductDetailPage(driver);
        Assert.assertTrue(detail.isAddToCartDisplayed(), "Add to cart button missing");
        detail.addToCart();
        Assert.assertTrue(detail.isRemoveDisplayed(), "Remove button should appear after adding");
        Assert.assertEquals(detail.getCartItemCount(), 1);
    }

    @Test(description = "TC_DETAIL_005: Verify back button returns to products page.")
    public void testBackToProductsNavigation() {
        ProductsPage products = new ProductsPage(driver);
        products.clickProductByName(PRODUCT_NAME);

        ProductDetailPage detail = new ProductDetailPage(driver);
        detail.goBackToProducts();

        ProductsPage productsAgain = new ProductsPage(driver);
        Assert.assertTrue(productsAgain.isProductsPageDisplayed(), "Should return to products page");
    }
}
