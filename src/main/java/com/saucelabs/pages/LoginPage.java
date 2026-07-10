package com.saucelabs.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * LoginPage - Page Object for the SauceDemo login page.
 * URL: https://www.saucedemo.com/
 */
public class LoginPage extends BasePage {

    // Elements
    @FindBy(id = "user-name")
    private WebElement usernameField;

    @FindBy(id = "password")
    private WebElement passwordField;

    @FindBy(id = "login-button")
    private WebElement loginButton;

    @FindBy(css = "[data-test='error']")
    private WebElement errorMessage;

    @FindBy(className = "error-button")
    private WebElement errorCloseBtn;

    @FindBy(className = "login_logo")
    private WebElement loginLogo;

    @FindBy(id = "login_credentials")
    private WebElement loginCredentials;

    @FindBy(className = "login_password")
    private WebElement loginPasswordHint;

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public LoginPage navigateTo(String baseUrl) {
        driver.get(baseUrl);
        return this;
    }

    public LoginPage enterUsername(String username) {
        typeText(usernameField, username);
        return this;
    }

    public LoginPage enterPassword(String password) {
        typeText(passwordField, password);
        return this;
    }

    public LoginPage clickLogin() {
        click(loginButton);
        return this;
    }

    public void login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLogin();
    }

    public LoginPage closeError() {
        click(errorCloseBtn);
        return this;
    }

    public boolean isLoginPageDisplayed() {
        return isDisplayed(loginLogo) && isDisplayed(loginButton);
    }

    public String getErrorMessage() {
        return getText(errorMessage);
    }

    public boolean isErrorDisplayed() {
        return isDisplayed(errorMessage);
    }

    public String getLogoText() {
        return getText(loginLogo);
    }

    public boolean areCredentialsDisplayed() {
        return isDisplayed(loginCredentials);
    }

    public boolean isPasswordHintDisplayed() {
        return isDisplayed(loginPasswordHint);
    }
}
