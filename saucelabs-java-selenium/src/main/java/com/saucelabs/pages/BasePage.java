package com.saucelabs.pages;

import com.saucelabs.config.ConfigReader;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

/**
 * BasePage - Abstract base class for all Page Objects.
 * Contains common methods shared across pages.
 */
public class BasePage {

    protected WebDriver driver;
    protected WebDriverWait wait;

    // Common locators
    protected static final By BURGER_MENU_BTN    = By.id("react-burger-menu-btn");
    protected static final By BURGER_CLOSE_BTN   = By.id("react-burger-cross-btn");
    protected static final By LOGOUT_LINK        = By.id("logout_sidebar_link");
    protected static final By ALL_ITEMS_LINK     = By.id("inventory_sidebar_link");
    protected static final By SHOPPING_CART_LINK = By.className("shopping_cart_link");
    protected static final By SHOPPING_CART_BADGE = By.className("shopping_cart_badge");

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait   = new WebDriverWait(driver,
                Duration.ofSeconds(ConfigReader.getExplicitWait()));
    }

    public String getPageTitle() {
        return driver.getTitle();
    }

    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    public WebElement waitForVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public WebElement waitForClickable(By locator) {
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    public List<WebElement> waitForAllVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator));
    }

    public void click(By locator) {
        waitForClickable(locator).click();
    }

    public void typeText(By locator, String text) {
        WebElement element = waitForVisible(locator);
        element.clear();
        element.sendKeys(text);
    }

    public String getText(By locator) {
        return waitForVisible(locator).getText();
    }

    public boolean isDisplayed(By locator) {
        try {
            return driver.findElement(locator).isDisplayed();
        } catch (NoSuchElementException | StaleElementReferenceException e) {
            return false;
        }
    }

    public void openBurgerMenu() {
        click(BURGER_MENU_BTN);
    }

    public void logout() {
        openBurgerMenu();
        click(LOGOUT_LINK);
    }

    public void goToCart() {
        click(SHOPPING_CART_LINK);
    }

    public int getCartItemCount() {
        try {
            WebElement badge = driver.findElement(SHOPPING_CART_BADGE);
            return Integer.parseInt(badge.getText().trim());
        } catch (Exception e) {
            return 0;
        }
    }
}
