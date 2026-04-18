package com.automation.framework.utils;

import com.automation.framework.base.DriverManager;
import com.automation.framework.constants.FrameworkConstants;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ScreenshotUtils {
    public static String captureScreenshot(String testName) {
        WebDriver driver = DriverManager.getDriver();
        if (driver == null) {
            return "";
        }
        
        File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String destPath = FrameworkConstants.SCREENSHOTS_FOLDER_PATH + File.separator + testName + "_" + timestamp + ".png";
        
        try {
            File destFile = new File(destPath);
            Files.createDirectories(destFile.getParentFile().toPath());
            Files.copy(srcFile.toPath(), destFile.toPath());
            return destPath;
        } catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }
    
    public static String getBase64Image() {
        WebDriver driver = DriverManager.getDriver();
        if (driver == null) {
            return "";
        }
        return ((TakesScreenshot) driver).getScreenshotAs(OutputType.BASE64);
    }
}
