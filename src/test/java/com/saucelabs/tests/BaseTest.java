package com.saucelabs.tests;

import org.openqa.selenium.WebDriver;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import com.saucelabs.config.ConfigReader;
import com.saucelabs.driver.DriverFactory;
import com.saucelabs.pages.LoginPage;

/**
 * BaseTest - TestNG base test class.
 * Handles WebDriver setup/teardown and Sauce Labs reporting.
 * Equivalent to conftest.py in the Python project.
 */
public class BaseTest {

    protected WebDriver driver;

	@BeforeMethod
    public void setUp(java.lang.reflect.Method method) {
        String testName = method.getName();
        driver = DriverFactory.createDriver(testName);
    }

	@AfterMethod
    public void tearDown(ITestResult result) {
        if (ConfigReader.isSauceEnabled()) {
            boolean passed = result.getStatus() == ITestResult.SUCCESS;
            DriverFactory.updateSauceResult(driver, passed);
        }
        if (driver != null) {
            driver.quit();
        }
    }

    /**
     * Helper: Log in with valid credentials and return the driver.
     * Equivalent to the logged_in_driver fixture.
     */
    protected WebDriver getLoggedInDriver() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateTo(ConfigReader.getBaseUrl());
        loginPage.login(ConfigReader.getValidUsername(), ConfigReader.getValidPassword());
        return driver;
    }
}
