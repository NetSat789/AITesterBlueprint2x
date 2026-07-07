"""
driver_factory.py - Creates and manages WebDriver instances.
Supports local and Sauce Labs remote execution.
Uses Selenium's built-in driver manager (no SSL issues) with
webdriver-manager as fallback.
"""
import os
import ssl
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService
from utils.config_reader import ConfigReader

# Disable SSL verification globally for environments with proxy/firewall issues
os.environ["WDM_SSL_VERIFY"] = "0"


class DriverFactory:
    """Factory class to create WebDriver instances for local or Sauce Labs."""

    @staticmethod
    def create_driver(test_name="Unnamed Test"):
        """Create and return a WebDriver instance based on configuration."""
        if ConfigReader.is_sauce_enabled():
            return DriverFactory._create_sauce_driver(test_name)
        return DriverFactory._create_local_driver()

    @staticmethod
    def _create_local_driver():
        """Create a local WebDriver instance using Selenium's built-in driver manager."""
        browser = ConfigReader.get_browser().lower()
        headless = ConfigReader.is_headless()

        if browser == "firefox":
            options = webdriver.FirefoxOptions()
            if headless:
                options.add_argument("--headless")
            driver = webdriver.Firefox(options=options)

        elif browser == "edge":
            options = webdriver.EdgeOptions()
            if headless:
                options.add_argument("--headless")
            driver = webdriver.Edge(options=options)

        else:  # default: chrome
            options = webdriver.ChromeOptions()
            if headless:
                options.add_argument("--headless=new")
            options.add_argument("--disable-notifications")
            options.add_argument("--start-maximized")
            driver = webdriver.Chrome(options=options)

        driver.implicitly_wait(ConfigReader.get_implicit_wait())
        driver.set_page_load_timeout(ConfigReader.get_page_load_timeout())
        driver.maximize_window()
        return driver

    @staticmethod
    def _create_sauce_driver(test_name):
        """Create a Sauce Labs RemoteWebDriver instance."""
        username = ConfigReader.get_sauce_username()
        access_key = ConfigReader.get_sauce_access_key()

        sauce_options = {
            "username": username,
            "accessKey": access_key,
            "name": test_name,
            "build": ConfigReader.get("saucelabs", "build_name", fallback="Local Build"),
            "screenResolution": ConfigReader.get("saucelabs", "screen_resolution", fallback="1920x1080"),
            "maxDuration": 3600,
            "idleTimeout": 300,
        }

        browser_name = ConfigReader.get("saucelabs", "browser_name", fallback="chrome")

        if browser_name == "firefox":
            options = webdriver.FirefoxOptions()
        elif browser_name == "edge":
            options = webdriver.EdgeOptions()
        else:
            options = webdriver.ChromeOptions()

        options.browser_version = ConfigReader.get("saucelabs", "browser_version", fallback="latest")
        options.platform_name = ConfigReader.get("saucelabs", "platform_name", fallback="Windows 11")
        options.set_capability("sauce:options", sauce_options)

        sauce_url = f"https://{username}:{access_key}@ondemand.us-west-1.saucelabs.com:443/wd/hub"
        driver = webdriver.Remote(command_executor=sauce_url, options=options)

        driver.implicitly_wait(ConfigReader.get_implicit_wait())
        driver.maximize_window()
        return driver

    @staticmethod
    def update_sauce_result(driver, passed):
        """Update the Sauce Labs job result."""
        if ConfigReader.is_sauce_enabled():
            script = "sauce:job-result={}".format("passed" if passed else "failed")
            driver.execute_script(script)
