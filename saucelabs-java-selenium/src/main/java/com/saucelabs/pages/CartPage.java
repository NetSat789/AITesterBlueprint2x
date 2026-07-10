package com.saucelabs.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;
import java.util.stream.Collectors;

/**
 * CartPage - Page Object for the SauceDemo shopping cart page.
 * URL: https://www.saucedemo.com/cart.html
 */
public class CartPage extends BasePage {

    // Elements
    @FindBy(className = "title")
    private WebElement pageTitle;

    @FindBy(className = "cart_item")
    private List<WebElement> cartItems;

    @FindBy(className = "inventory_item_name")
    private List<WebElement> cartItemNames;

    @FindBy(className = "inventory_item_price")
    private List<WebElement> cartItemPrices;

    @FindBy(className = "cart_quantity")
    private List<WebElement> cartItemQuantities;

    @FindBy(css = "button[id^='remove']")
    private List<WebElement> removeButtons;

    @FindBy(id = "continue-shopping")
    private WebElement continueShoppingBtn;

    @FindBy(id = "checkout")
    private WebElement checkoutBtn;

    public CartPage(WebDriver driver) {
        super(driver);
    }

    public String getPageHeader() {
        return getText(pageTitle);
    }

    public List<String> getCartItemNames() {
        return cartItemNames.stream()
                .map(WebElement::getText)
                .collect(Collectors.toList());
    }

    public int getCartItemCount() {
        return cartItems.size();
    }

    public CartPage removeItemByName(String productName) {
        String buttonId = "remove-" + productName.toLowerCase().replace(" ", "-");
        click(By.id(buttonId));
        return this;
    }

    public void clickContinueShopping() {
        click(continueShoppingBtn);
    }

    public void clickCheckout() {
        click(checkoutBtn);
    }

    public boolean isCartPageDisplayed() {
        return isDisplayed(pageTitle) && "Your Cart".equals(getPageHeader());
    }

    public boolean isCartEmpty() {
        return getCartItemCount() == 0;
    }

    public boolean isProductInCart(String productName) {
        return getCartItemNames().contains(productName);
    }

    public boolean isCheckoutBtnDisplayed() {
        return isDisplayed(checkoutBtn);
    }

    public boolean isContinueShoppingBtnDisplayed() {
        return isDisplayed(continueShoppingBtn);
    }
}
