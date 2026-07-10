package com.saucelabs.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * ProductDetailPage - Page Object for individual product detail view.
 * URL: https://www.saucedemo.com/inventory-item.html?id=X
 */
public class ProductDetailPage extends BasePage {

    // Locators
    private static final By PRODUCT_NAME        = By.className("inventory_details_name");
    private static final By PRODUCT_DESC        = By.className("inventory_details_desc");
    private static final By PRODUCT_PRICE       = By.className("inventory_details_price");
    private static final By PRODUCT_IMAGE       = By.cssSelector(".inventory_details_img_container img");
    private static final By ADD_TO_CART_BTN     = By.cssSelector("button[id^='add-to-cart']");
    private static final By REMOVE_BTN          = By.cssSelector("button[id^='remove']");
    private static final By BACK_BTN            = By.id("back-to-products");
    private static final By DETAILS_CONTAINER   = By.className("inventory_details_container");

    public ProductDetailPage(WebDriver driver) {
        super(driver);
    }

    public String getProductName() {
        return getText(PRODUCT_NAME);
    }

    public String getProductDescription() {
        return getText(PRODUCT_DESC);
    }

    public String getProductPrice() {
        return getText(PRODUCT_PRICE);
    }

    public ProductDetailPage addToCart() {
        click(ADD_TO_CART_BTN);
        return this;
    }

    public ProductDetailPage removeFromCart() {
        click(REMOVE_BTN);
        return this;
    }

    public void goBackToProducts() {
        click(BACK_BTN);
    }

    public boolean isDetailPageDisplayed() {
        return isDisplayed(DETAILS_CONTAINER);
    }

    public boolean isImageDisplayed() {
        return isDisplayed(PRODUCT_IMAGE);
    }

    public boolean isAddToCartDisplayed() {
        return isDisplayed(ADD_TO_CART_BTN);
    }

    public boolean isRemoveDisplayed() {
        return isDisplayed(REMOVE_BTN);
    }

    public String getImageSrc() {
        return waitForVisible(PRODUCT_IMAGE).getAttribute("src");
    }
}
