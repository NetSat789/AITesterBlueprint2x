package com.saucelabs.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ProductsPage - Page Object for the SauceDemo inventory/products page.
 * URL: https://www.saucedemo.com/inventory.html
 */
public class ProductsPage extends BasePage {

    // Elements
    @FindBy(className = "title")
    private WebElement pageTitle;

    @FindBy(className = "inventory_item")
    private List<WebElement> productItems;

    @FindBy(className = "inventory_item_name")
    private List<WebElement> productNames;

    @FindBy(className = "inventory_item_price")
    private List<WebElement> productPrices;

    @FindBy(css = ".inventory_item_img img")
    private List<WebElement> productImages;

    @FindBy(className = "product_sort_container")
    private WebElement sortDropdown;

    public ProductsPage(WebDriver driver) {
        super(driver);
    }

    public String getPageHeader() {
        return getText(pageTitle);
    }

    public List<String> getAllProductNames() {
        return productNames.stream()
                .map(WebElement::getText)
                .collect(Collectors.toList());
    }

    public List<String> getAllProductPrices() {
        return productPrices.stream()
                .map(WebElement::getText)
                .collect(Collectors.toList());
    }

    public int getProductCount() {
        return productItems.size();
    }

    public ProductsPage sortByNameAZ() {
        new Select(sortDropdown).selectByValue("az");
        return this;
    }

    public ProductsPage sortByNameZA() {
        new Select(sortDropdown).selectByValue("za");
        return this;
    }

    public ProductsPage sortByPriceLowHigh() {
        new Select(sortDropdown).selectByValue("lohi");
        return this;
    }

    public ProductsPage sortByPriceHighLow() {
        new Select(sortDropdown).selectByValue("hilo");
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
        return isDisplayed(pageTitle) && "Products".equals(getPageHeader());
    }

    public boolean areProductsListed() {
        return getProductCount() > 0;
    }

    public boolean areAllImagesDisplayed() {
        // Wait for first image to be visible, then check all
        if (productImages.isEmpty()) {
            return false;
        }
        waitForVisible(productImages.get(0));
        return productImages.stream().allMatch(WebElement::isDisplayed);
    }

    public boolean isSortDropdownDisplayed() {
        return isDisplayed(sortDropdown);
    }
}
