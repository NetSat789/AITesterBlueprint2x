# 🧪 Sauce Labs Selenium POM Project (Python)

Automated testing framework using **Python + Selenium + pytest + Page Object Model** with **Sauce Labs** integration, targeting the [SauceDemo](https://www.saucedemo.com/) web application.

---

## 📁 Project Structure

```
saucelabs-selenium-project/
├── config.ini                  # App, browser, timeout, Sauce Labs config
├── .env                        # Sauce Labs credentials (gitignored)
├── pytest.ini                  # Pytest settings & markers
├── conftest.py                 # Fixtures: driver setup, login, Sauce reporting
├── requirements.txt            # Python dependencies
│
├── utils/
│   ├── config_reader.py        # Reads config.ini + .env
│   └── driver_factory.py       # Local & Sauce Labs WebDriver factory
│
├── pages/                      # Page Object Model classes
│   ├── base_page.py            # Abstract base with shared methods
│   ├── login_page.py           # Login page actions & verifications
│   ├── products_page.py        # Products listing, sort, cart actions
│   ├── product_detail_page.py  # Individual product detail view
│   ├── cart_page.py            # Shopping cart management
│   └── checkout_page.py        # Checkout steps 1, 2, & completion
│
└── tests/                      # Test classes (28 total test cases)
    ├── test_login.py           # 6 test cases
    ├── test_products.py        # 7 test cases
    ├── test_product_detail.py  # 5 test cases
    ├── test_cart.py            # 5 test cases
    └── test_checkout.py        # 5 test cases
```

---

## 🚀 Setup & Installation

```bash
# 1. Clone and navigate
cd saucelabs-selenium-project

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt
```

---

## ⚙️ Configuration

### Local Execution (default)
Edit `config.ini` to change browser or timeouts. No additional setup needed.

### Sauce Labs Execution
1. Update `.env` with your Sauce Labs credentials:
   ```
   SAUCE_USERNAME=your_username
   SAUCE_ACCESS_KEY=your_access_key
   EXECUTION_MODE=sauce
   ```
2. Configure platform/browser in `config.ini` under `[saucelabs]`.

---

## ▶️ Running Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test class
pytest tests/test_login.py -v

# Run by marker
pytest -m smoke -v
pytest -m regression -v
pytest -m cart -v

# Run specific test
pytest tests/test_login.py::TestLogin::test_valid_login -v

# Parallel execution (requires pytest-xdist)
pytest -n 4 -v

# Generate HTML report
pytest --html=reports/report.html --self-contained-html
```

---

## 🏷️ Test Markers

| Marker | Description |
|--------|-------------|
| `smoke` | Critical smoke tests |
| `regression` | Full regression suite |
| `login` | Login module tests |
| `products` | Products module tests |
| `product_detail` | Product detail tests |
| `cart` | Cart module tests |
| `checkout` | Checkout module tests |

---

## 📊 Test Cases Summary

| Test Class | # Tests | Key Scenarios |
|---|---|---|
| `TestLogin` | 6 | Valid/invalid login, locked user, empty fields, UI elements |
| `TestProducts` | 7 | Product count, images, sorting (A-Z, price), add/remove cart |
| `TestProductDetail` | 5 | Detail display, image, description, cart, back navigation |
| `TestCart` | 5 | Empty cart, add/remove items, continue shopping, multi-item |
| `TestCheckout` | 5 | Info page, validation, end-to-end flow, cancel |
| **Total** | **28** | |
