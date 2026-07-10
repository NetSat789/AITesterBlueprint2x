package com.saucelabs.pages;

import com.saucelabs.config.ConfigReader;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
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

    // Common elements (initialized via PageFactory)
    @FindBy(id = "react-burger-menu-btn")
    protected WebElement burgerMenuBtn;

    @FindBy(id = "react-burger-cross-btn")
    protected WebElement burgerCloseBtn;

    @FindBy(id = "logout_sidebar_link")
    protected WebElement logoutLink;

    @FindBy(id = "inventory_sidebar_link")
    protected WebElement allItemsLink;

    @FindBy(className = "shopping_cart_link")
    protected WebElement shoppingCartLink;

    @FindBy(className = "shopping_cart_badge")
    protected WebElement shoppingCartBadge;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait   = new WebDriverWait(driver,
                Duration.ofSeconds(ConfigReader.getExplicitWait()));
        PageFactory.initElements(driver, this);
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

    public WebElement waitForVisible(WebElement element) {
        return wait.until(ExpectedConditions.visibilityOf(element));
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

    // Overloads to support PageFactory WebElement fields
    public void click(WebElement element) {
        wait.until(ExpectedConditions.elementToBeClickable(element)).click();
    }

    public void typeText(WebElement element, String text) {
        wait.until(ExpectedConditions.visibilityOf(element));
        element.clear();
        element.sendKeys(text);
    }

    public String getText(WebElement element) {
        return wait.until(ExpectedConditions.visibilityOf(element)).getText();
    }

    public boolean isDisplayed(WebElement element) {
        try {
            return element.isDisplayed();
        } catch (NoSuchElementException | StaleElementReferenceException e) {
            return false;
        }
    }

    public void openBurgerMenu() {
        click(burgerMenuBtn);
    }

    public void logout() {
        openBurgerMenu();
        click(logoutLink);
    }

    public void goToCart() {
        click(shoppingCartLink);
    }

    public int getCartItemCount() {
        try {
            if (shoppingCartBadge == null) return 0;
            return Integer.parseInt(shoppingCartBadge.getText().trim());
        } catch (Exception e) {
            return 0;
        }
    }
}
