package com.automation.tests;

import com.automation.framework.base.BaseTest;
import com.automation.framework.pages.DashboardPage;
import com.automation.framework.pages.LoginPage;
import com.automation.framework.utils.JsonUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.lang.reflect.Method;

public class DashboardTest extends BaseTest {

    private DashboardPage dashboardPage;

    @BeforeMethod
    public void loginToApplication() {
        
        // Ensure successful login before dashboard tests
        Object[][] validData = JsonUtils.getTestData("validUser");
        String username = (String) validData[0][0];
        String password = (String) validData[0][1];

        LoginPage loginPage = new LoginPage();
        dashboardPage = loginPage
                .enterUsername(username)
                .enterPassword(password)
                .clickLogin();
    }

    @Test(description = "Verify successful logout from dashboard")
    public void verifyLogout() {
        LoginPage loginPage = dashboardPage.logout();
        
        // After logout, URL should be back to login or dashboard shouldn't be accessible
        // In OrangeHRM, it routes back to login screen. 
        // Adding a simple assert for now.
        Assert.assertFalse(dashboardPage.isDashboardDisplayed(), "Dashboard should not be displayed after logout");
    }
}
