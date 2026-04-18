package com.automation.tests;

import com.automation.framework.base.BaseTest;
import com.automation.framework.pages.DashboardPage;
import com.automation.framework.pages.LoginPage;
import com.automation.framework.utils.JsonUtils;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class InvalidLoginTest extends BaseTest {

    @Test(dataProvider = "invalidLoginData", description = "Verify invalid login (intentionally failing)")
    public void verifyInvalidLogin(String username, String password) {
        LoginPage loginPage = new LoginPage();
        
        DashboardPage dashboardPage = loginPage
                 .enterUsername(username)
                 .enterPassword(password)
                 .clickLogin();

        // Intentionally fail by assuming the dashboard is displayed
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Assumed dashboard should be displayed for invalid credentials (Intentional Failure 1)");
    }

    @Test(dataProvider = "emptyLoginData", description = "Verify required messages for empty fields (intentionally failing)")
    public void verifyEmptyFieldsLogin(String username, String password) {
        LoginPage loginPage = new LoginPage();
        
        DashboardPage dashboardPage = loginPage
                 .enterUsername(username)
                 .enterPassword(password)
                 .clickLogin();

        // Intentionally fail by assuming login works without credentials
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Login should work with empty fields (Intentional Failure 2)");
    }
    
    @Test(description = "Verify required message for empty password only (intentionally failing)")
    public void verifyEmptyPasswordLogin() {
        LoginPage loginPage = new LoginPage();
        
        DashboardPage dashboardPage = loginPage
                 .enterUsername("Admin")
                 .clickLogin();

        // Intentionally fail by assuming login works with an empty password
        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Login should work without a password (Intentional Failure 3)");
    }

    @DataProvider(name = "invalidLoginData")
    public Object[][] getInvalidLoginData() {
        return JsonUtils.getTestData("invalidUser");
    }

    @DataProvider(name = "emptyLoginData")
    public Object[][] getEmptyLoginData() {
        return JsonUtils.getTestData("emptyUser");
    }
}
