# Tabs Calculator E2E Tests

This repository contains end-to-end tests for the Tabs Calculator application using Playwright. The tests cover various functionalities of the application, including adding, removing and editing user's cards and items, as well as verifying the correct calculation of totals.

The main motivation for this project is to practice and demonstrate the use of Playwright for E2E testing, using the Page Object Model (POM) design pattern to enhance test maintainability and readability. I also aim to explore different approaches and best practices in writing E2E tests.

The small application under test was originally developed at [this CodePen](https://codepen.io/rsalgado/pen/YgrxVb) by me, using Vue.js, as a personal project to practice front-end development skills with Vue and CSS, and solve the common problem of splitting bills among friends.


## Structure

The tests are organized in the `tests` directory, with the main test file being `tabs-calculator.spec.ts`. The tests utilize page object models to interact with different parts of the application, ensuring maintainability and readability.

The directory structure is as follows:

```
tabs-application-e2e/
├── static/                             # This directory contains the main application files.
│   ├── index.html                      # This is the main HTML file for the Tabs Calculator application.
|   ├── script.js                       # This is the main JavaScript file for the Tabs Calculator application.
│   └── style.css
├── tests/
│   ├── tabs-calculator.spec.ts         # This file contains the main E2E tests for the Tabs Calculator application.
│   ├── pages/                          # This directory contains the page object models.
│   │   ├── TabsPage.ts                 # This file contains the page object model for the main Tabs page.
│   │   ├── CardFragment.ts             # This file contains the page object model (fragment) for a user's card.
│   │   └── ItemsSectionFragment.ts     # This file contains the page object model (fragment) for the items section for a user.
│   ├── helpers/
│   │   └── helpers.ts
│   └── constants.ts
└── playwright.config.ts                # This file contains the Playwright configuration
```

## Setting Up
To set up the project, follow these steps:
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the NPM dependencies and the Playwright browsers by running:
   ```bash
    npm ci
    npx playwright install --with-deps
   ```

## Running the Tests
To run the full test suite across all configured browsers, use the following command:
```bash
npx playwright test
```

To run tests in a specific browser (e.g., Chromium or Firefox), use the `--project` flag:
```bash
npx playwright test --project=chromium
```

### Test Reports
After running the tests, a detailed HTML report is generated. To view the report, use the following command:
```bash
npx playwright show-report
```
