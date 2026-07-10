package com.saucelabs.driver;

import com.saucelabs.config.ConfigReader;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * DriverFactory - Creates and manages WebDriver instances.
 * Supports local execution and Sauce Labs remote execution.
 */
public class DriverFactory {

    /**
     * Create and return a WebDriver instance based on configuration.
     */
    public static WebDriver createDriver(String testName) {
        if (ConfigReader.isSauceEnabled()) {
            return createSauceDriver(testName);
        }
        return createLocalDriver();
    }

    /**
     * Create a local WebDriver instance.
     * For Edge/Chrome, uses the locally cached Selenium-manager driver to avoid
     * network downloads in restricted environments.
     */
    private static WebDriver createLocalDriver() {
        String browser = ConfigReader.getBrowser().toLowerCase();
        boolean headless = ConfigReader.isHeadless();
        WebDriver driver;

        switch (browser) {
            case "firefox": {
                setLocalDriverPath("geckodriver", "webdriver.gecko.driver",
                        System.getProperty("user.home") + "/.cache/selenium/geckodriver/win64");
                FirefoxOptions options = new FirefoxOptions();
                if (headless) options.addArguments("--headless");
                driver = new FirefoxDriver(options);
                break;
            }
            case "edge": {
                String edgeDriverPath = findCachedDriver(
                        System.getProperty("user.home") + "\\.cache\\selenium\\msedgedriver\\win64",
                        "msedgedriver.exe");
                if (edgeDriverPath != null) {
                    System.setProperty("webdriver.edge.driver", edgeDriverPath);
                } else {
                    WebDriverManager.edgedriver().setup();
                }
                EdgeOptions options = new EdgeOptions();
                if (headless) options.addArguments("--headless");
                driver = new EdgeDriver(options);
                break;
            }
            default: { // chrome
                String chromeDriverPath = findCachedDriver(
                        System.getProperty("user.home") + "\\.cache\\selenium\\chromedriver\\win64",
                        "chromedriver.exe");
                if (chromeDriverPath != null) {
                    System.setProperty("webdriver.chrome.driver", chromeDriverPath);
                } else {
                    WebDriverManager.chromedriver().setup();
                }
                ChromeOptions options = new ChromeOptions();
                if (headless) options.addArguments("--headless=new");
                options.addArguments("--disable-notifications");
                options.addArguments("--start-maximized");
                driver = new ChromeDriver(options);
                break;
            }
        }

        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(ConfigReader.getImplicitWait()));
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(ConfigReader.getPageLoadTimeout()));
        driver.manage().window().maximize();
        return driver;
    }

    /**
     * Create a Sauce Labs RemoteWebDriver instance.
     */
    private static WebDriver createSauceDriver(String testName) {
        String username   = ConfigReader.getSauceUsername();
        String accessKey  = ConfigReader.getSauceAccessKey();
        String browserName = ConfigReader.getSauceBrowserName().toLowerCase();

        Map<String, Object> sauceOptions = new HashMap<>();
        sauceOptions.put("username", username);
        sauceOptions.put("accessKey", accessKey);
        sauceOptions.put("name", testName);
        sauceOptions.put("build", ConfigReader.getSauceBuildName());
        sauceOptions.put("screenResolution", ConfigReader.getSauceScreenResolution());
        sauceOptions.put("maxDuration", 3600);
        sauceOptions.put("idleTimeout", 300);

        MutableCapabilities options;
        switch (browserName) {
            case "firefox":
                options = new FirefoxOptions();
                break;
            case "edge":
                options = new EdgeOptions();
                break;
            default:
                options = new ChromeOptions();
                break;
        }

        options.setCapability("browserVersion", ConfigReader.getSauceBrowserVersion());
        options.setCapability("platformName",   ConfigReader.getSaucePlatformName());
        options.setCapability("sauce:options",  sauceOptions);

        String sauceUrl = String.format(
                "https://%s:%s@ondemand.us-west-1.saucelabs.com:443/wd/hub",
                username, accessKey);

        try {
            WebDriver driver = new RemoteWebDriver(new URL(sauceUrl), options);
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(ConfigReader.getImplicitWait()));
            driver.manage().window().maximize();
            return driver;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid Sauce Labs URL: " + e.getMessage());
        }
    }

    /**
     * Update the Sauce Labs job result (pass/fail).
     */
    public static void updateSauceResult(WebDriver driver, boolean passed) {
        if (ConfigReader.isSauceEnabled()) {
            String script = "sauce:job-result=" + (passed ? "passed" : "failed");
            ((RemoteWebDriver) driver).executeScript(script);
        }
    }

    /**
     * Finds the highest-version cached driver binary under the given base directory.
     * e.g. ~/.cache/selenium/msedgedriver/win64/<version>/msedgedriver.exe
     * Returns the full path to the .exe, or null if not found.
     */
    private static String findCachedDriver(String baseDirPath, String driverFileName) {
        java.io.File baseDir = new java.io.File(baseDirPath);
        if (!baseDir.exists() || !baseDir.isDirectory()) return null;

        java.io.File[] versionDirs = baseDir.listFiles(java.io.File::isDirectory);
        if (versionDirs == null || versionDirs.length == 0) return null;

        // Sort descending to pick highest version first
        java.util.Arrays.sort(versionDirs, (a, b) -> b.getName().compareTo(a.getName()));

        for (java.io.File versionDir : versionDirs) {
            java.io.File driver = new java.io.File(versionDir, driverFileName);
            if (driver.exists() && driver.canExecute()) {
                return driver.getAbsolutePath();
            }
        }
        return null;
    }

    /** Unused for edge/chrome but kept for firefox compatibility. */
    @SuppressWarnings("unused")
    private static void setLocalDriverPath(String driverName, String property, String basePath) {
        java.io.File base = new java.io.File(basePath);
        if (!base.exists()) return;
        java.io.File[] versions = base.listFiles(java.io.File::isDirectory);
        if (versions == null || versions.length == 0) return;
        java.util.Arrays.sort(versions, (a, b) -> b.getName().compareTo(a.getName()));
        for (java.io.File v : versions) {
            java.io.File exe = new java.io.File(v, driverName + ".exe");
            if (exe.exists()) { System.setProperty(property, exe.getAbsolutePath()); return; }
        }
    }
}
