# Selenium Automation Framework for OrangeHRM

This is an enterprise-level test automation framework built to automate the OrangeHRM E2E flows using:
- Java
- Selenium 4
- TestNG
- Maven
- WebDriverManager
- Log4j2
- ExtentReports

## Project Structure

- `pom.xml`: Contains all Maven dependencies.
- `testng.xml`: Defines the TestNG test suite and parallel execution configuration.
- `src/main/java/com/automation/framework/base/BaseTest.java`: Setup & teardown test methods.
- `src/main/java/com/automation/framework/base/DriverManager.java`: ThreadLocal driver for thread safety during parallel execution.
- `src/main/java/com/automation/framework/factory/BrowserFactory.java`: Instantiates web browser utilizing WebDriverManager.
- `src/main/java/com/automation/framework/pages/`: Contains the Page Object implementations using `PageFactory`.
- `src/main/java/com/automation/framework/utils/`: Various helper classes for waits, reports, and data.
- `src/test/resources/config.properties`: Externalised properties.
- `src/test/resources/testdata.json`: Externalised JSON data provider.
- `src/test/java/com/automation/tests/`: Test classes encompassing valid and invalid login scenarios.

## Execution Flow

1. Browser is launched (configured via `config.properties`)
2. `WebDriverManager` downloads proper execution drivers automatically
3. Tests execute the `@BeforeMethod` in `BaseTest`, initializing ExtentReports.
4. Validation starts.
5. In case of failure, a screenshot is attached to the ExtentReports.
6. Execution report is flushed into `reports/AutomationReport_<timestamp>.html`

## How to run

1. Navigate to the project root directory
2. Execute the tests via maven:
   ```bash
   mvn clean test
   ```
3. Locate HTML reports under the `/reports` folder.
