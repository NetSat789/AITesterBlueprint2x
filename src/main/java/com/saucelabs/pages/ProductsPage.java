package com.saucelabs.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ProductsPage - Page Object for the SauceDemo inventory/products page.
 * URL: https://www.saucedemo.com/inventory.html
 * Locators are defined as By constants; no @FindBy / PageFactory used.
 */
public class ProductsPage extends BasePage {

    // Locators
    private static final By PAGE_TITLE      = By.className("title");
    private static final By PRODUCT_ITEMS   = By.className("inventory_item");
    private static final By PRODUCT_NAMES   = By.className("inventory_item_name");
    private static final By PRODUCT_PRICES  = By.className("inventory_item_price");
    private static final By PRODUCT_IMAGES  = By.cssSelector(".inventory_item_img img");
    private static final By SORT_DROPDOWN   = By.className("product_sort_container");

    public ProductsPage(WebDriver driver) {
        super(driver);
    }

    public String getPageHeader() {
        return getText(PAGE_TITLE);
    }

    public List<String> getAllProductNames() {
        return driver.findElements(PRODUCT_NAMES).stream()
                .map(WebElement::getText)
                .collect(Collectors.toList());
    }

    public List<String> getAllProductPrices() {
        return driver.findElements(PRODUCT_PRICES).stream()
                .map(WebElement::getText)
                .collect(Collectors.toList());
    }

    public int getProductCount() {
        return driver.findElements(PRODUCT_ITEMS).size();
    }

    public ProductsPage sortByNameAZ() {
        new Select(driver.findElement(SORT_DROPDOWN)).selectByValue("az");
        return this;
    }

    public ProductsPage sortByNameZA() {
        new Select(driver.findElement(SORT_DROPDOWN)).selectByValue("za");
        return this;
    }

    public ProductsPage sortByPriceLowHigh() {
        new Select(driver.findElement(SORT_DROPDOWN)).selectByValue("lohi");
        return this;
    }

    public ProductsPage sortByPriceHighLow() {
        new Select(driver.findElement(SORT_DROPDOWN)).selectByValue("hilo");
        return this;
    }

    /**
     * Add a product to cart by its URL-safe name (e.g. "sauce-labs-backpack").
     */
    public ProductsPage addProductByName(String productName) {
        String buttonId = "add-to-cart-" + productName.toLowerCase().replace(" ", "-");
        click(By.id(buttonId));
        return this;
    }

    public ProductsPage removeProductByName(String productName) {
        String buttonId = "remove-" + productName.toLowerCase().replace(" ", "-");
        click(By.id(buttonId));
        return this;
    }

    /**
     * Click a product name to navigate to its detail page.
     */
    public void clickProductByName(String productName) {
        By locator = By.xpath("//div[text()='" + productName + "']");
        click(locator);
    }

    public boolean isProductsPageDisplayed() {
        return isDisplayed(PAGE_TITLE) && "Products".equals(getPageHeader());
    }

    public boolean areProductsListed() {
        return getProductCount() > 0;
    }

    public boolean areAllImagesDisplayed() {
        List<WebElement> images = driver.findElements(PRODUCT_IMAGES);
        if (images.isEmpty()) {
            return false;
        }
        waitForVisible(images.get(0));
        return images.stream().allMatch(WebElement::isDisplayed);
    }

    public boolean isSortDropdownDisplayed() {
        return isDisplayed(SORT_DROPDOWN);
    }
}
