package com.saucelabs.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * ProductDetailPage - Page Object for individual product detail view.
 * URL: https://www.saucedemo.com/inventory-item.html?id=X
 */
public class ProductDetailPage extends BasePage {

    // Elements
    @FindBy(className = "inventory_details_name")
    private WebElement productName;

    @FindBy(className = "inventory_details_desc")
    private WebElement productDesc;

    @FindBy(className = "inventory_details_price")
    private WebElement productPrice;

    @FindBy(css = ".inventory_details_img_container img")
    private WebElement productImage;

    @FindBy(css = "button[id^='add-to-cart']")
    private WebElement addToCartBtn;

    @FindBy(css = "button[id^='remove']")
    private WebElement removeBtn;

    @FindBy(id = "back-to-products")
    private WebElement backBtn;

    @FindBy(className = "inventory_details_container")
    private WebElement detailsContainer;

    public ProductDetailPage(WebDriver driver) {
        super(driver);
    }

    public String getProductName() {
        return getText(productName);
    }

    public String getProductDescription() {
        return getText(productDesc);
    }

    public String getProductPrice() {
        return getText(productPrice);
    }

    public ProductDetailPage addToCart() {
        click(addToCartBtn);
        return this;
    }

    public ProductDetailPage removeFromCart() {
        click(removeBtn);
        return this;
    }

    public void goBackToProducts() {
        click(backBtn);
    }

    public boolean isDetailPageDisplayed() {
        return isDisplayed(detailsContainer);
    }

    public boolean isImageDisplayed() {
        return isDisplayed(productImage);
    }

    public boolean isAddToCartDisplayed() {
        return isDisplayed(addToCartBtn);
    }

    public boolean isRemoveDisplayed() {
        return isDisplayed(removeBtn);
    }

    public String getImageSrc() {
        return waitForVisible(productImage).getAttribute("src");
    }
}
