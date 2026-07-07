package com.saucelabs.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * CheckoutPage - Page Object for the SauceDemo checkout pages.
 * Covers: Checkout Step One (info), Step Two (overview), and Complete.
 */
public class CheckoutPage extends BasePage {

    // Step One - Your Information
    private static final By PAGE_TITLE          = By.className("title");
    private static final By FIRST_NAME_FIELD    = By.id("first-name");
    private static final By LAST_NAME_FIELD     = By.id("last-name");
    private static final By POSTAL_CODE_FIELD   = By.id("postal-code");
    private static final By CONTINUE_BTN        = By.id("continue");
    private static final By CANCEL_BTN          = By.id("cancel");
    private static final By ERROR_MESSAGE       = By.cssSelector("[data-test='error']");

    // Step Two - Overview
    private static final By SUMMARY_INFO        = By.className("summary_info");
    private static final By ITEM_TOTAL          = By.className("summary_subtotal_label");
    private static final By TAX                 = By.className("summary_tax_label");
    private static final By TOTAL              = By.className("summary_total_label");
    private static final By FINISH_BTN          = By.id("finish");
    private static final By CART_ITEMS          = By.className("cart_item");

    // Complete
    private static final By COMPLETE_HEADER     = By.className("complete-header");
    private static final By COMPLETE_TEXT       = By.className("complete-text");
    private static final By BACK_HOME_BTN       = By.id("back-to-products");
    private static final By PONY_EXPRESS_IMG    = By.className("pony_express");

    public CheckoutPage(WebDriver driver) {
        super(driver);
    }

    // ====== Step One Actions ======

    public CheckoutPage enterFirstName(String name) {
        typeText(FIRST_NAME_FIELD, name);
        return this;
    }

    public CheckoutPage enterLastName(String name) {
        typeText(LAST_NAME_FIELD, name);
        return this;
    }

    public CheckoutPage enterPostalCode(String code) {
        typeText(POSTAL_CODE_FIELD, code);
        return this;
    }

    public CheckoutPage fillCheckoutInfo(String firstName, String lastName, String postalCode) {
        enterFirstName(firstName);
        enterLastName(lastName);
        enterPostalCode(postalCode);
        return this;
    }

    public CheckoutPage clickContinue() {
        click(CONTINUE_BTN);
        return this;
    }

    public void clickCancel() {
        click(CANCEL_BTN);
    }

    public String getErrorMessage() {
        return getText(ERROR_MESSAGE);
    }

    public boolean isErrorDisplayed() {
        return isDisplayed(ERROR_MESSAGE);
    }

    // ====== Step Two Actions ======

    public String getItemTotal() {
        return getText(ITEM_TOTAL);
    }

    public String getTax() {
        return getText(TAX);
    }

    public String getTotal() {
        return getText(TOTAL);
    }

    public int getOverviewItemCount() {
        return driver.findElements(CART_ITEMS).size();
    }

    public CheckoutPage clickFinish() {
        click(FINISH_BTN);
        return this;
    }

    public boolean isSummaryDisplayed() {
        return isDisplayed(SUMMARY_INFO);
    }

    // ====== Complete Actions ======

    public String getCompleteHeader() {
        return getText(COMPLETE_HEADER);
    }

    public String getCompleteText() {
        return getText(COMPLETE_TEXT);
    }

    public void clickBackHome() {
        click(BACK_HOME_BTN);
    }

    public boolean isOrderComplete() {
        return isDisplayed(COMPLETE_HEADER);
    }

    public String getPageHeader() {
        return getText(PAGE_TITLE);
    }
}
