package com.saucelabs.config;

import io.github.cdimascio.dotenv.Dotenv;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * ConfigReader - Reads configuration from config.properties and .env files.
 * Singleton pattern ensures config is loaded only once.
 */
public class ConfigReader {

    private static Properties properties;
    private static Dotenv dotenv;

    static {
        loadConfig();
        loadDotenv();
    }

    private static void loadConfig() {
        properties = new Properties();
        try (InputStream input = ConfigReader.class.getClassLoader()
                .getResourceAsStream("config.properties")) {
            if (input != null) {
                properties.load(input);
            } else {
                throw new RuntimeException("config.properties not found in resources");
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to load config.properties: " + e.getMessage());
        }
    }

    private static void loadDotenv() {
        try {
            dotenv = Dotenv.configure().ignoreIfMissing().load();
        } catch (Exception e) {
            dotenv = null;
        }
    }

    private static String getEnv(String key) {
        String val = System.getProperty(key);
        if (val != null && !val.isEmpty()) return val;
        if (dotenv != null) {
            val = dotenv.get(key);
            if (val != null && !val.isEmpty()) return val;
        }
        return System.getenv(key);
    }

    public static String get(String key) {
        return properties.getProperty(key);
    }

    public static String get(String key, String fallback) {
        return properties.getProperty(key, fallback);
    }

    // ---- Application ----

    public static String getBaseUrl() {
        return get("application.base_url");
    }

    // ---- Browser ----

    public static String getBrowser() {
        return get("browser.name", "chrome");
    }

    public static boolean isHeadless() {
        return Boolean.parseBoolean(get("browser.headless", "false"));
    }

    // ---- Timeouts ----

    public static int getImplicitWait() {
        return Integer.parseInt(get("timeouts.implicit_wait", "10"));
    }

    public static int getExplicitWait() {
        return Integer.parseInt(get("timeouts.explicit_wait", "15"));
    }

    public static int getPageLoadTimeout() {
        return Integer.parseInt(get("timeouts.page_load_timeout", "30"));
    }

    // ---- Test Data ----

    public static String getValidUsername() {
        return get("test_data.valid_username");
    }

    public static String getValidPassword() {
        return get("test_data.valid_password");
    }

    public static String getLockedUsername() {
        return get("test_data.locked_username");
    }

    public static String getProblemUsername() {
        return get("test_data.problem_username");
    }

    // ---- Execution Mode ----

    public static String getExecutionMode() {
        String env = getEnv("EXECUTION_MODE");
        return (env != null && !env.isEmpty()) ? env.toLowerCase() : "local";
    }

    public static boolean isSauceEnabled() {
        return "sauce".equals(getExecutionMode());
    }

    // ---- Sauce Labs ----

    public static String getSauceUsername() {
        String val = getEnv("SAUCE_USERNAME");
        return (val != null) ? val : "";
    }

    public static String getSauceAccessKey() {
        String val = getEnv("SAUCE_ACCESS_KEY");
        return (val != null) ? val : "";
    }

    public static String getSauceBrowserName() {
        return get("saucelabs.browser_name", "chrome");
    }

    public static String getSauceBrowserVersion() {
        return get("saucelabs.browser_version", "latest");
    }

    public static String getSaucePlatformName() {
        return get("saucelabs.platform_name", "Windows 11");
    }

    public static String getSauceBuildName() {
        return get("saucelabs.build_name", "Local Build");
    }

    public static String getSauceScreenResolution() {
        return get("saucelabs.screen_resolution", "1920x1080");
    }

    public static String getSauceUrl() {
        return get("saucelabs.url",
                "https://ondemand.us-west-1.saucelabs.com:443/wd/hub");
    }
}
