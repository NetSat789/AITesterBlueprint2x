package com.saucelabs.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.stream.Collectors;

/**
 * CartPage - Page Object for the SauceDemo shopping cart page.
 * URL: https://www.saucedemo.com/cart.html
 * Locators are defined as By constants; no @FindBy / PageFactory used.
 */
public class CartPage extends BasePage {

    // Locators
    private static final By PAGE_TITLE          = By.className("title");
    private static final By CART_ITEMS          = By.className("cart_item");
    private static final By CART_ITEM_NAMES     = By.className("inventory_item_name");
    private static final By CART_ITEM_PRICES    = By.className("inventory_item_price");
    private static final By CART_ITEM_QUANTITIES = By.className("cart_quantity");
    private static final By REMOVE_BUTTONS      = By.cssSelector("button[id^='remove']");
    private static final By CONTINUE_SHOPPING_BTN = By.id("continue-shopping");
    private static final By CHECKOUT_BTN        = By.id("checkout");

    public CartPage(WebDriver driver) {
        super(driver);
    }

    public String getPageHeader() {
        return getText(PAGE_TITLE);
    }

    public List<String> getCartItemNames() {
        return driver.findElements(CART_ITEM_NAMES).stream()
                .map(WebElement::getText)
                .collect(Collectors.toList());
    }

    public int getCartItemCount() {
        return driver.findElements(CART_ITEMS).size();
    }

    public CartPage removeItemByName(String productName) {
        String buttonId = "remove-" + productName.toLowerCase().replace(" ", "-");
        click(By.id(buttonId));
        return this;
    }

    public void clickContinueShopping() {
        click(CONTINUE_SHOPPING_BTN);
    }

    public void clickCheckout() {
        click(CHECKOUT_BTN);
    }

    public boolean isCartPageDisplayed() {
        return isDisplayed(PAGE_TITLE) && "Your Cart".equals(getPageHeader());
    }

    public boolean isCartEmpty() {
        return getCartItemCount() == 0;
    }

    public boolean isProductInCart(String productName) {
        return getCartItemNames().contains(productName);
    }

    public boolean isCheckoutBtnDisplayed() {
        return isDisplayed(CHECKOUT_BTN);
    }

    public boolean isContinueShoppingBtnDisplayed() {
        return isDisplayed(CONTINUE_SHOPPING_BTN);
    }
}
