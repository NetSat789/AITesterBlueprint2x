# SauceLabs Java Selenium Automation Framework

A Java + Selenium + TestNG automation framework for [SauceDemo](https://www.saucedemo.com/), structured using the **Page Object Model (POM)**.

This is the Java equivalent of the Python/pytest project — same test cases, same structure, different language and test runner.

---

## 🏗️ Project Structure

```
saucelabs-java-selenium/
├── pom.xml                          # Maven build file (dependencies & plugins)
├── .env.example                     # Environment variable template
├── src/
│   ├── main/
│   │   ├── java/com/saucelabs/
│   │   │   ├── config/
│   │   │   │   └── ConfigReader.java        # Reads config.properties & .env
│   │   │   ├── driver/
│   │   │   │   └── DriverFactory.java       # Creates local / Sauce Labs drivers
│   │   │   └── pages/
│   │   │       ├── BasePage.java            # Common helper methods
│   │   │       ├── LoginPage.java
│   │   │       ├── ProductsPage.java
│   │   │       ├── CartPage.java
│   │   │       ├── CheckoutPage.java
│   │   │       └── ProductDetailPage.java
│   │   └── resources/
│   │       └── config.properties            # App configuration (browser, timeouts, etc.)
│   └── test/
│       ├── java/com/saucelabs/tests/
│       │   ├── BaseTest.java                # TestNG lifecycle + Sauce Labs reporting
│       │   ├── TestLogin.java               # 6 test cases
│       │   ├── TestProducts.java            # 7 test cases
│       │   ├── TestProductDetail.java       # 5 test cases
│       │   ├── TestCart.java                # 5 test cases
│       │   └── TestCheckout.java            # 5 test cases
│       └── resources/
│           └── testng.xml                   # TestNG suite definition
```

---

## 🧪 Test Coverage (28 Test Cases)

| Module             | Tests | Groups                   |
|--------------------|-------|--------------------------|
| Login              | 6     | `login`, `smoke`         |
| Products           | 7     | `products`, `regression` |
| Product Detail     | 5     | `product_detail`, `regression` |
| Cart               | 5     | `cart`, `regression`     |
| Checkout           | 5     | `checkout`, `regression` |

---

## ⚙️ Prerequisites

- Java 11+
- Maven 3.8+
- Chrome / Edge / Firefox browser installed

---

## 🚀 Running Tests

### Run All Tests (Full Suite)
```bash
mvn test
```

### Run by Group
```bash
mvn test -Dgroups=smoke
mvn test -Dgroups=login
mvn test -Dgroups=regression
mvn test -Dgroups=cart
mvn test -Dgroups=checkout
```

### Run a Single Test Class
```bash
mvn test -Dtest=TestLogin
mvn test -Dtest=TestCart
```

---

## 🌐 Sauce Labs Execution

1. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   EXECUTION_MODE=sauce
   SAUCE_USERNAME=your_username
   SAUCE_ACCESS_KEY=your_access_key
   ```

2. Run:
   ```bash
   mvn test
   ```

---

## 🔧 Configuration

Edit `src/main/resources/config.properties`:

| Key                       | Default       | Description                     |
|---------------------------|---------------|---------------------------------|
| `browser.name`            | `edge`        | `chrome`, `firefox`, or `edge`  |
| `browser.headless`        | `false`       | Run browser headlessly          |
| `timeouts.implicit_wait`  | `10`          | Seconds for implicit wait       |
| `timeouts.explicit_wait`  | `15`          | Seconds for explicit wait       |

---

## 📊 Reports

TestNG generates HTML reports automatically after each run in:
```
target/surefire-reports/
```
