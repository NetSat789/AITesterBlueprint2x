# Restful Booker API - comprehensive test suite
# Based on the documentation at: https://restful-booker.herokuapp.com/apidoc/index.html

## Manual API Testing Scope
*   **Endpoints & Methods:** Covered `POST /auth`, `GET /booking`, `GET /booking/:id`, `POST /booking`, `PUT /booking/:id`, `PATCH /booking/:id`, `DELETE /booking/:id`
*   **Payload Validation:** Valid and invalid data structures and data types.
*   **Authentication:** The API utilizes a generated token passed as a Cookie (`Cookie: token=<token_value>`) or Basic Auth for PUT/PATCH/DELETE endpoints.
*   **Edge Cases:** Missing parameters, empty objects, excessively long strings, boundary dates.
*   **CRUD Validation:** Validated creation, reading, modifying, and destroying of resources.

## Automation Testing Scope & Recommendations
*   **Tools:** Java 17+, RestAssured, TestNG, Maven.
*   **Regression Scenarios:** All Positive CRUD operations should be automated primarily.
*   **Approach:**
    *   Create an `AuthUtil.java` to dynamically generate strings containing the authorization token before PUT/PATCH/DELETE requests.
    *   Use POJO (Plain Old Java Objects) classes for serialization/deserialization of Request and Response bodies.
    *   Validate Response Schemas using `JsonSchemaValidator`.
    *   Assert response times are under an acceptable threshold (e.g., `< 2000ms`).

## Risks and Assumptions
*   **Assumption:** Authentication tokens are valid for 10 minutes as per standard Restful Booker behavior.
*   **Assumption:** The database resets on a schedule; hence, hardcoded `bookingid`s should be avoided in automation (use dynamically created IDs from a POST command).
*   **Risk:** High traffic might cause 500 Internal Server errors or slow response times, potentially failing strict timeout validations.

---
## API Test Cases (Restful Booker Booking API)

| Test Case ID | API Endpoint | HTTP Method | Test Scenario | Request Payload / Parameters | Expected Status Code | Expected Response | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_API_001** | `/auth` | POST | Generate Auth Token with valid admin credentials | `{"username": "admin", "password": "password123"}` | `200 OK` | JSON containing `"token"` | High |
| **TC_API_002** | `/auth` | POST | Generate Auth Token with invalid credentials | `{"username": "admin", "password": "wrongpassword"}` | `200 OK` (Note: API returns 200 with reason) | JSON containing `{"reason": "Bad credentials"}` | High |
| **TC_API_003** | `/booking` | GET | Retrieve all booking IDs | *None* | `200 OK` | Array of objects `[{"bookingid": 1}, ...]` | High |
| **TC_API_004** | `/booking` | GET | Retrieve booking IDs filtered by Name | `?firstname=sally&lastname=brown` | `200 OK` | Array of objects `[{"bookingid": 1}]` | Medium |
| **TC_API_005** | `/booking` | GET | Retrieve booking IDs filtered by Checkin/Checkout dates | `?checkin=2014-03-13&checkout=2014-05-21` | `200 OK` | Array of objects matching dates | Medium |
| **TC_API_006** | `/booking/:id` | GET | Retrieve specific booking by valid ID | URL Param: `id=1` | `200 OK` | JSON with complete booking details | High |
| **TC_API_007** | `/booking/:id` | GET | Retrieve specific booking by invalid/non-existent ID | URL Param: `id=999999` | `404 Not Found` | Content: "Not Found" | High |
| **TC_API_008** | `/booking/:id` | GET | Retrieve specific booking by invalid data type ID | URL Param: `id=abc` | `404 Not Found` | Content: "Not Found" | Medium |
| **TC_API_009** | `/booking` | POST | Create new booking with valid payload | `{"firstname":"Jim", "lastname":"Brown", "totalprice":111, "depositpaid":true, "bookingdates":{"checkin":"2018-01-01", "checkout":"2019-01-01"}, "additionalneeds":"Breakfast"}` | `200 OK` | JSON with new `bookingid` and complete `booking` object | High |
| **TC_API_010** | `/booking` | POST | Create new booking missing required field (e.g., `firstname`) | Payload missing `firstname` | `500 Internal Server Error` (Per API Design) | "Internal Server Error" | High |
| **TC_API_011** | `/booking` | POST | Create new booking with invalid data type (e.g., String in `totalprice`) | `"totalprice": "one hundred"` | `500 Internal Server Error` | "Internal Server Error" | Medium |
| **TC_API_012** | `/booking/:id` | PUT | Completely update an existing booking | Headers: `Cookie: token=12345` / Payload: Valid updated booking JSON | `200 OK` | JSON with fully updated booking details | High |
| **TC_API_013** | `/booking/:id` | PUT | Attempt to update booking without Auth Token | Payload: Valid JSON (Missing Cookie/Auth header) | `403 Forbidden` | Content: "Forbidden" | High |
| **TC_API_014** | `/booking/:id` | PATCH | Partially update an existing booking (e.g., only `firstname` & `lastname`) | Headers: `Cookie: token=12345` / Payload: `{"firstname":"James", "lastname":"Brown"}` | `200 OK` | JSON with partially updated booking (rest unchanged) | High |
| **TC_API_015** | `/booking/:id` | DELETE | Delete an existing booking with valid ID and Token | Headers: `Cookie: token=12345` | `201 Created` (Per API Design) | Content: "Created" | High |
| **TC_API_016** | `/booking/:id` | DELETE | Attempt to delete without Auth Token | Headers: None | `403 Forbidden` | Content: "Forbidden" | High |
| **TC_API_017** | `/booking/:id` | DELETE | Attempt to delete a previously deleted/non-existent booking | Headers: Valid Token | `405 Method Not Allowed` | Content: "Method Not Allowed" | Medium |
| **TC_API_018** | `/booking` | POST | Boundary testing: Checkin date later than Checkout date | `{"checkin":"2023-01-01", "checkout":"2022-01-01"}` | `200 OK` or `400 Bad Request` (Verify API config) | Determine based on actual API behavior | Low |
| **TC_API_019** | `/booking` | POST | Boundary testing: Extremely large `totalprice` value | `"totalprice": 999999999999999` | `200 OK` or Error | Verify data type constraints | Low |
| **TC_API_020** | `/booking` | POST | Security testing: Malformed JSON syntax | `{"firstname": "Jim"` (missing closing brace) | `400 Bad Request` | Error details regarding valid JSON parsing | Medium |
