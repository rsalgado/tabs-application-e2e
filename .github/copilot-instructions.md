# Tabs Calculator E2E - AI Instructions

## Project Overview
This is a Playwright E2E testing project for a static "Tabs Calculator" web application. The application is a local HTML/JS/CSS site (`static/`) tested using the Page Object Model (POM) pattern.

## Architecture & Patterns

### Page Object Model (POM)
- **Strict POM Usage**: All test interactions must go through Page Objects located in `tests/pages/`.
- **Entry Point**: `TabsPage.ts` is the main page object.
- **Fragments**: Reusable UI components are modeled as fragments (e.g., `CardFragment.ts`, `ItemsSectionFragment.ts`).
  - `TabsPage` methods often return these fragments (e.g., `findCardByName` returns `CardFragment`).
- **Helpers**: Complex setup logic (like creating data) resides in `tests/helpers/helpers.ts`.

### Test Structure
- **Navigation**: Tests load the app via `file://` protocol using `APP_FILE_PATH` from `tests/constants.ts`.
- **Grouping**: Use `test.describe` to group related tests (e.g., "Cards functionality", "Guest functionality").
- **Assertions**: Use Playwright's `expect` for assertions.

## Key Workflows

### Running Tests
- **Run All**: `npx playwright test`
- **Specific Browser**: `npx playwright test --project=chromium`
- **Debug**: Traces are enabled on first retry (`trace: 'on-first-retry'`). Use `npx playwright show-report` to view.

### Coding Conventions
- **Locators**:
  - Prefer `data-testid` attributes (e.g., `getByTestId`).
  - Use robust CSS selectors (e.g., `.person-card`, `#people-section`) when test IDs are missing.
  - Avoid text-based locators for dynamic content unless necessary.
- **Async/Await**: Ensure all Playwright interactions are awaited.
- **Type Safety**: Explicitly type return values in POM methods (e.g., `: Promise<CardFragment>`).

## Example Patterns

**Interacting with a Card:**
```typescript
const tabsPage = new TabsPage(page);
// Returns a CardFragment
const card = await tabsPage.findCardByName("Alice"); 
await card.setGuest(true);
```

**Verifying Calculations:**
```typescript
const itemsSection = tabsPage.itemsSectionFragment;
await expect(itemsSection.subTotal).toHaveText("42000");
```

**Creating Data (Helper):**
```typescript
import * as helpers from "./helpers/helpers";
await helpers.createCardWithItems(tabsPage, "Bob", [
  { name: "Pizza", value: 32000 }
]);
```
