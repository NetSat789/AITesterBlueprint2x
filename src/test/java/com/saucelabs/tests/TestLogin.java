package com.saucelabs.tests;

import com.saucelabs.config.ConfigReader;
import com.saucelabs.pages.LoginPage;
import com.saucelabs.pages.ProductsPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * TestLogin - Test cases for the Login page.
 * Covers: valid login, invalid credentials, locked user, empty fields, UI elements.
 */
public class TestLogin extends BaseTest {

    private static final String BASE_URL     = ConfigReader.getBaseUrl();
    private static final String VALID_USER   = ConfigReader.getValidUsername();
    private static final String VALID_PASS   = ConfigReader.getValidPassword();
    private static final String LOCKED_USER  = ConfigReader.getLockedUsername();

    @BeforeMethod(alwaysRun = true)
    @Override
    public void setUp(java.lang.reflect.Method method) {
        super.setUp(method); // creates the driver; no login needed for login tests
    }

    @Test(groups = {"login", "smoke"}, description = "TC_LOGIN_001: Verify successful login with valid credentials.")
    public void testValidLogin() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateTo(BASE_URL);
        loginPage.login(VALID_USER, VALID_PASS);

        ProductsPage productsPage = new ProductsPage(driver);
        Assert.assertTrue(productsPage.isProductsPageDisplayed(),
                "Products page not displayed after valid login");
        Assert.assertTrue(driver.getCurrentUrl().contains("inventory"),
                "URL should contain 'inventory'");
    }

    @Test(groups = {"login", "smoke"}, description = "TC_LOGIN_002: Verify error message with invalid username.")
    public void testInvalidUsername() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateTo(BASE_URL);
        loginPage.login("invalid_user", VALID_PASS);

        Assert.assertTrue(loginPage.isErrorDisplayed(), "Error message should be displayed");
        Assert.assertTrue(loginPage.getErrorMessage().contains("Username and password do not match"),
                "Unexpected error message");
    }

    @Test(groups = {"login", "smoke"}, description = "TC_LOGIN_003: Verify error message with invalid password.")
    public void testInvalidPassword() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateTo(BASE_URL);
        loginPage.login(VALID_USER, "wrong_password");

        Assert.assertTrue(loginPage.isErrorDisplayed(), "Error message should be displayed");
        Assert.assertTrue(loginPage.getErrorMessage().contains("Username and password do not match"),
                "Unexpected error message");
    }

    @Test(groups = {"login", "smoke"}, description = "TC_LOGIN_004: Verify locked-out user gets appropriate error.")
    public void testLockedOutUser() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateTo(BASE_URL);
        loginPage.login(LOCKED_USER, VALID_PASS);

        Assert.assertTrue(loginPage.isErrorDisplayed(), "Error message should be displayed");
        Assert.assertTrue(loginPage.getErrorMessage().toLowerCase().contains("locked out"),
                "Expected 'locked out' in error message: " + loginPage.getErrorMessage());
    }

    @Test(groups = {"login", "smoke"}, description = "TC_LOGIN_005: Verify error when submitting empty credentials.")
    public void testEmptyCredentials() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateTo(BASE_URL);
        loginPage.clickLogin();

        Assert.assertTrue(loginPage.isErrorDisplayed(), "Error message should be displayed");
        Assert.assertTrue(loginPage.getErrorMessage().contains("Username is required"),
                "Expected 'Username is required' error");
    }

    @Test(groups = {"login", "smoke"}, description = "TC_LOGIN_006: Verify all UI elements are present on login page.")
    public void testLoginPageUiElements() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateTo(BASE_URL);

        Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page not displayed");
        Assert.assertEquals(loginPage.getLogoText(), "Swag Labs", "Logo text mismatch");
        Assert.assertTrue(loginPage.areCredentialsDisplayed(), "Credentials section missing");
        Assert.assertTrue(loginPage.isPasswordHintDisplayed(), "Password hint section missing");
    }
}
