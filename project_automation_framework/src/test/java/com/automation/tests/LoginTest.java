package com.automation.tests;

import com.automation.framework.base.BaseTest;
import com.automation.framework.pages.DashboardPage;
import com.automation.framework.pages.LoginPage;
import com.automation.framework.utils.JsonUtils;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test(dataProvider = "validLoginData", description = "Verify successful login with valid credentials")
    public void verifyValidLogin(String username, String password) {
        LoginPage loginPage = new LoginPage();
        
        DashboardPage dashboardPage = loginPage
                .enterUsername(username)
                .enterPassword(password)
                .clickLogin();

        Assert.assertTrue(dashboardPage.isDashboardDisplayed(), "Dashboard should be displayed after valid login");
        Assert.assertEquals(dashboardPage.getDashboardHeaderText(), "Dashboard", "Dashboard header text mismatched");
    }

    @DataProvider(name = "validLoginData")
    public Object[][] getValidLoginData() {
        return JsonUtils.getTestData("validUser");
    }
}
