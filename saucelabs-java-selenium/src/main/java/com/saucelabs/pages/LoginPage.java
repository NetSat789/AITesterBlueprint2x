package com.saucelabs.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * LoginPage - Page Object for the SauceDemo login page.
 * URL: https://www.saucedemo.com/
 */
public class LoginPage extends BasePage {

    // Locators
    private static final By USERNAME_FIELD       = By.id("user-name");
    private static final By PASSWORD_FIELD       = By.id("password");
    private static final By LOGIN_BUTTON         = By.id("login-button");
    private static final By ERROR_MESSAGE        = By.cssSelector("[data-test='error']");
    private static final By ERROR_CLOSE_BTN      = By.className("error-button");
    private static final By LOGIN_LOGO           = By.className("login_logo");
    private static final By LOGIN_CREDENTIALS    = By.id("login_credentials");
    private static final By LOGIN_PASSWORD_HINT  = By.className("login_password");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public LoginPage navigateTo(String baseUrl) {
        driver.get(baseUrl);
        return this;
    }

    public LoginPage enterUsername(String username) {
        typeText(USERNAME_FIELD, username);
        return this;
    }

    public LoginPage enterPassword(String password) {
        typeText(PASSWORD_FIELD, password);
        return this;
    }

    public LoginPage clickLogin() {
        click(LOGIN_BUTTON);
        return this;
    }

    public void login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLogin();
    }

    public LoginPage closeError() {
        click(ERROR_CLOSE_BTN);
        return this;
    }

    public boolean isLoginPageDisplayed() {
        return isDisplayed(LOGIN_LOGO) && isDisplayed(LOGIN_BUTTON);
    }

    public String getErrorMessage() {
        return getText(ERROR_MESSAGE);
    }

    public boolean isErrorDisplayed() {
        return isDisplayed(ERROR_MESSAGE);
    }

    public String getLogoText() {
        return getText(LOGIN_LOGO);
    }

    public boolean areCredentialsDisplayed() {
        return isDisplayed(LOGIN_CREDENTIALS);
    }

    public boolean isPasswordHintDisplayed() {
        return isDisplayed(LOGIN_PASSWORD_HINT);
    }
}
