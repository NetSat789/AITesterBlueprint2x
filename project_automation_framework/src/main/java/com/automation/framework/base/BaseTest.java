package com.automation.framework.base;

import com.automation.framework.factory.BrowserFactory;
import com.automation.framework.utils.ConfigReader;
import com.automation.framework.utils.ReportManager;
import com.automation.framework.utils.ScreenshotUtils;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import org.openqa.selenium.WebDriver;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Parameters;
import org.testng.annotations.Optional;

import java.io.File;
import java.lang.reflect.Method;
import java.time.Duration;

public class BaseTest {

    @BeforeSuite
    public void beforeSuite() {
        ReportManager.initReports();
        createFolders();
    }

    @BeforeMethod
    @Parameters("browser")
    public void setUp(@Optional("") String browser, Method method) {
        ReportManager.createTest(method.getName());

        if (browser.isEmpty()) {
            browser = ConfigReader.getProperty("browser");
        }

        WebDriver driver = BrowserFactory.createDriver(browser);
        DriverManager.setDriver(driver);

        int implicitWait = Integer.parseInt(ConfigReader.getProperty("implicitWait"));
        DriverManager.getDriver().manage().timeouts().implicitlyWait(Duration.ofSeconds(implicitWait));

        String url = ConfigReader.getProperty("url");
        DriverManager.getDriver().get(url);
    }

    @AfterMethod
    public void tearDown(ITestResult result) {
        if (result.getStatus() == ITestResult.FAILURE) {
            ReportManager.getTest().log(Status.FAIL, "Test Failed: " + result.getThrowable());
            String base64Image = ScreenshotUtils.getBase64Image();
            if (!base64Image.isEmpty()) {
                ReportManager.getTest().fail("Failed Screenshot", 
                        MediaEntityBuilder.createScreenCaptureFromBase64String(base64Image).build());
            }
        } else if (result.getStatus() == ITestResult.SUCCESS) {
            ReportManager.getTest().log(Status.PASS, "Test Passed");
        } else if (result.getStatus() == ITestResult.SKIP) {
            ReportManager.getTest().log(Status.SKIP, "Test Skipped");
        }

        WebDriver driver = DriverManager.getDriver();
        if (driver != null) {
            driver.quit();
            DriverManager.unload();
        }
    }

    @AfterSuite
    public void afterSuite() {
        ReportManager.flushReports();
    }

    private void createFolders() {
        new File(com.automation.framework.constants.FrameworkConstants.REPORTS_FOLDER_PATH).mkdirs();
        new File(com.automation.framework.constants.FrameworkConstants.SCREENSHOTS_FOLDER_PATH).mkdirs();
    }
}
