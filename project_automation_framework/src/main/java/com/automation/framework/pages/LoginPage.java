package com.automation.framework.pages;

import com.automation.framework.base.DriverManager;
import com.automation.framework.utils.WaitUtils;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

import java.util.List;

public class LoginPage {

    public LoginPage() {
        PageFactory.initElements(DriverManager.getDriver(), this);
    }

    @FindBy(name = "username")
    private WebElement usernameInput;

    @FindBy(name = "password")
    private WebElement passwordInput;

    @FindBy(css = "button[type='submit']")
    private WebElement loginButton;

    @FindBy(css = ".oxd-alert-content-text")
    private WebElement invalidCredentialsMessage;

    @FindBy(css = ".oxd-input-group__message")
    private List<WebElement> requiredMessages;

    public LoginPage enterUsername(String username) {
        WaitUtils.waitForElementToBeVisible(usernameInput).clear();
        usernameInput.sendKeys(username);
        return this;
    }

    public LoginPage enterPassword(String password) {
        WaitUtils.waitForElementToBeVisible(passwordInput).clear();
        passwordInput.sendKeys(password);
        return this;
    }

    public DashboardPage clickLogin() {
        WaitUtils.waitForElementToBeClickable(loginButton).click();
        return new DashboardPage();
    }

    public LoginPage clickLoginWithInvalidExpected() {
        WaitUtils.waitForElementToBeClickable(loginButton).click();
        return this;
    }

    public String getErrorMessage() {
        return WaitUtils.waitForElementToBeVisible(invalidCredentialsMessage).getText();
    }

    public boolean areRequiredMessagesDisplayed() {
        if (requiredMessages.isEmpty()) return false;
        for (WebElement msg : requiredMessages) {
            if (!msg.isDisplayed() || !msg.getText().equals("Required")) {
                return false;
            }
        }
        return true;
    }
}
