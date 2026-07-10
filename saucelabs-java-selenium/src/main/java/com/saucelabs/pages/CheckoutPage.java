package com.saucelabs.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import java.util.List;

/**
 * CheckoutPage - Page Object for the SauceDemo checkout pages.
 * Covers: Checkout Step One (info), Step Two (overview), and Complete.
 */
public class CheckoutPage extends BasePage {

    // Step One - Your Information
    @FindBy(className = "title")
    private WebElement pageTitle;

    @FindBy(id = "first-name")
    private WebElement firstNameField;

    @FindBy(id = "last-name")
    private WebElement lastNameField;

    @FindBy(id = "postal-code")
    private WebElement postalCodeField;

    @FindBy(id = "continue")
    private WebElement continueBtn;

    @FindBy(id = "cancel")
    private WebElement cancelBtn;

    @FindBy(css = "[data-test='error']")
    private WebElement errorMessage;

    // Step Two - Overview
    @FindBy(className = "summary_info")
    private WebElement summaryInfo;

    @FindBy(className = "summary_subtotal_label")
    private WebElement itemTotal;

    @FindBy(className = "summary_tax_label")
    private WebElement tax;

    @FindBy(className = "summary_total_label")
    private WebElement total;

    @FindBy(id = "finish")
    private WebElement finishBtn;

    @FindBy(className = "cart_item")
    private List<WebElement> cartItems;

    // Complete
    @FindBy(className = "complete-header")
    private WebElement completeHeader;

    @FindBy(className = "complete-text")
    private WebElement completeText;

    @FindBy(id = "back-to-products")
    private WebElement backHomeBtn;

    @FindBy(className = "pony_express")
    private WebElement ponyExpressImg;

    public CheckoutPage(WebDriver driver)
     {
        super(driver);
    }

    // ====== Step One Actions ======

    public CheckoutPage enterFirstName(String name) {
        typeText(firstNameField, name);
        return this;
    }

    public CheckoutPage enterLastName(String name) {
        typeText(lastNameField, name);
        return this;
    }

    public CheckoutPage enterPostalCode(String code) {
        typeText(postalCodeField, code);
        return this;
    }

    public CheckoutPage fillCheckoutInfo(String firstName, String lastName, String postalCode) {
        enterFirstName(firstName);
        enterLastName(lastName);
        enterPostalCode(postalCode);
        return this;
    }

    public CheckoutPage clickContinue() {
        click(continueBtn);
        return this;
    }

    public void clickCancel() {
        click(cancelBtn);
    }

    public String getErrorMessage() {
        return getText(errorMessage);
    }

    public boolean isErrorDisplayed() {
        return isDisplayed(errorMessage);
    }

    // ====== Step Two Actions ======

    public String getItemTotal() {
        return getText(itemTotal);
    }

    public String getTax() {
        return getText(tax);
    }

    public String getTotal() {
        return getText(total);
    }

    public int getOverviewItemCount() {
        return cartItems.size();
    }

    public CheckoutPage clickFinish() {
        click(finishBtn);
        return this;
    }

    public boolean isSummaryDisplayed() {
        return isDisplayed(summaryInfo);
    }

    // ====== Complete Actions ======

    public String getCompleteHeader() {
        return getText(completeHeader);
    }

    public String getCompleteText() {
        return getText(completeText);
    }

    public void clickBackHome() {
        click(backHomeBtn);
    }

    public boolean isOrderComplete() {
        return isDisplayed(completeHeader);
    }

    public String getPageHeader() {
        return getText(pageTitle);
    }
}
