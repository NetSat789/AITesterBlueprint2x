package com.automation.framework.pages;

import com.automation.framework.base.DriverManager;
import com.automation.framework.utils.WaitUtils;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class DashboardPage {

    public DashboardPage() {
        PageFactory.initElements(DriverManager.getDriver(), this);
    }

    @FindBy(css = ".oxd-topbar-header-breadcrumb-module")
    private WebElement dashboardHeader;

    @FindBy(css = ".oxd-userdropdown-name")
    private WebElement userProfileDropdown;

    @FindBy(xpath = "//a[text()='Logout']")
    private WebElement logoutLink;

    public boolean isDashboardDisplayed() {
        try {
            return WaitUtils.waitForElementToBeVisible(dashboardHeader).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getDashboardHeaderText() {
        return WaitUtils.waitForElementToBeVisible(dashboardHeader).getText();
    }

    public LoginPage logout() {
        WaitUtils.waitForElementToBeClickable(userProfileDropdown).click();
        WaitUtils.waitForElementToBeClickable(logoutLink).click();
        return new LoginPage();
    }
}
