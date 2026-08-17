import { test, expect, type Page } from "@playwright/test";

const FARMER_CODE = "F001";
const FARMER_NAME = "Ram Singh";

/** Mirrors src/lib/shift.ts's resolveCurrentShift() so the test knows what
 * the UI *should* auto-select right now, without hardcoding a shift name. */
function expectedShiftName(now: Date): "Morning" | "Evening" {
  const hour = now.getHours();
  return hour >= 4 && hour < 12 ? "Morning" : "Evening";
}

function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

async function selectFarmerInCombobox(page: Page, code: string) {
  const combobox = page.locator('input[placeholder="Search by farmer code or name"]');
  await combobox.fill(code);
  await page.getByRole("button", { name: new RegExp(code) }).click();
}

let farmerLedgerPath = "";

test.describe.serial("Tiwari Dairy golden path", () => {
  test("dashboard loads for the authenticated test user", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("settings pages show the seeded master data (validates DB grants)", async ({ page }) => {
    await page.goto("/settings/milk-types");
    await expect(page.getByText("Cow Milk")).toBeVisible();
    await expect(page.getByText("Buffalo Milk")).toBeVisible();
    await expect(page.getByText("Mixed Milk")).toBeVisible();
    await expect(page.getByText(/permission denied/i)).toHaveCount(0);

    await page.goto("/settings/shifts");
    await expect(page.getByText("Morning")).toBeVisible();
    await expect(page.getByText("Evening")).toBeVisible();
    await expect(page.getByText("No shifts configured yet.")).toHaveCount(0);

    await page.goto("/settings/expense-categories");
    await expect(page.getByText("Transport")).toBeVisible();
  });

  test("create a farmer", async ({ page }) => {
    await page.goto("/farmers");
    await page.locator('input[name="farmerCode"]').fill(FARMER_CODE);
    await page.locator('input[name="name"]').fill(FARMER_NAME);
    await page.getByRole("button", { name: "Add Farmer" }).click();
    await expect(page.getByRole("link", { name: FARMER_NAME })).toBeVisible();

    const href = await page.getByRole("link", { name: FARMER_NAME }).getAttribute("href");
    expect(href).toBeTruthy();
    farmerLedgerPath = href!;
  });

  test("rule #4 + #3: purchase form defaults to today's date and the current shift", async ({ page }) => {
    await page.goto("/purchases");

    const dateValue = await page.locator('input[name="purchaseDate"]').inputValue();
    expect(dateValue).toBe(todayIso());

    const shiftSelect = page.locator('select[name="shiftId"]');
    const selectedShiftText = await shiftSelect.locator("option:checked").textContent();
    expect(selectedShiftText).toBe(expectedShiftName(new Date()));
  });

  test("rule #5: total amount auto-calculates as quantity x rate", async ({ page }) => {
    await page.goto("/purchases");
    await page.locator('input[name="quantity"]').fill("10");
    await page.locator('input[name="rate"]').fill("50");
    // useCalculatedAmount recomputes via a useEffect a tick after the fill —
    // toHaveValue auto-retries until it settles, unlike a one-shot inputValue() read.
    await expect(page.locator('input[name="totalAmount"]')).toHaveValue("500");
  });

  test("rule #1/#2: create Cow Milk purchase, then Buffalo Milk on the same date+shift succeeds", async ({
    page,
  }) => {
    await page.goto("/purchases");
    await selectFarmerInCombobox(page, FARMER_CODE);
    await page.locator('select[name="milkTypeId"]').selectOption({ label: "Cow Milk" });
    await page.locator('input[name="quantity"]').fill("10");
    await page.locator('input[name="rate"]').fill("50");
    await page.getByRole("button", { name: "Save Purchase" }).click();
    await expect(page.locator("table").getByText("Cow Milk")).toBeVisible();

    await selectFarmerInCombobox(page, FARMER_CODE);
    await page.locator('select[name="milkTypeId"]').selectOption({ label: "Buffalo Milk" });
    await page.locator('input[name="quantity"]').fill("5");
    await page.locator('input[name="rate"]').fill("60");
    await page.getByRole("button", { name: "Save Purchase" }).click();
    await expect(page.locator("table").getByText("Buffalo Milk")).toBeVisible();
  });

  test("rule #20: the same farmer+date+shift+milk type again is blocked with a friendly message", async ({
    page,
  }) => {
    await page.goto("/purchases");
    await selectFarmerInCombobox(page, FARMER_CODE);
    await page.locator('select[name="milkTypeId"]').selectOption({ label: "Cow Milk" });
    await page.locator('input[name="quantity"]').fill("10");
    await page.locator('input[name="rate"]').fill("50");
    await page.getByRole("button", { name: "Save Purchase" }).click();

    await expect(page.getByText(/already exists/i)).toBeVisible();
    await expect(page.getByText(/duplicate key value violates/i)).toHaveCount(0);
  });

  test("rule #6: payment method defaults to Cash", async ({ page }) => {
    await page.goto("/payments");
    const method = await page.locator('select[name="paymentMethod"]').inputValue();
    expect(method).toBe("CASH");
  });

  test("rule #8: a partial payment produces PARTIALLY_PAID with the correct remaining amount", async ({
    page,
  }) => {
    await page.goto("/payments");
    await selectFarmerInCombobox(page, FARMER_CODE);
    await page.locator('input[name="amount"]').fill("300");
    await page.getByRole("button", { name: "Save Payment" }).click();
    await expect(page.getByText("₹300").first()).toBeVisible();

    await page.goto(farmerLedgerPath);
    const summary = page.getByTestId("overall-summary");
    await expect(summary.getByText("Partially Paid")).toBeVisible();
    // Milk value 500 + 300 = 800; paid 300; remaining 500.
    await expect(summary.getByText("₹800.00")).toBeVisible();
    await expect(summary.getByText("₹500.00")).toBeVisible();
  });

  test("rule #8: paying the remaining balance flips status to PAID with zero remaining", async ({ page }) => {
    await page.goto("/payments");
    await selectFarmerInCombobox(page, FARMER_CODE);
    await page.locator('input[name="amount"]').fill("500");
    await page.getByRole("button", { name: "Save Payment" }).click();

    await page.goto(farmerLedgerPath);
    const summary = page.getByTestId("overall-summary");
    await expect(summary.getByText("Paid", { exact: true })).toBeVisible();
    await expect(summary.getByText("₹0.00")).toBeVisible();
  });

  test("rule #11: the ledger visually distinguishes purchases from payments", async ({ page }) => {
    await page.goto(farmerLedgerPath);
    await expect(page.getByText("Milk Purchase").first()).toBeVisible();
    await expect(page.getByText("Payment").first()).toBeVisible();
  });

  test("create a milk supply entry with auto date/shift and calculated amount", async ({ page }) => {
    await page.goto("/supplies");

    const dateValue = await page.locator('input[name="supplyDate"]').inputValue();
    expect(dateValue).toBe(todayIso());

    await page.locator('select[name="milkTypeId"]').selectOption({ label: "Cow Milk" });
    await page.locator('input[name="quantity"]').fill("100");
    await page.locator('input[name="rate"]').fill("52");
    await expect(page.locator('input[name="totalAmount"]')).toHaveValue("5200");

    await page.getByRole("button", { name: "Save Supply" }).click();
    await expect(page.getByText("₹5200").first()).toBeVisible();
  });

  test("create an expense entry defaulting to today's date", async ({ page }) => {
    await page.goto("/expenses");

    const dateValue = await page.locator('input[name="expenseDate"]').inputValue();
    expect(dateValue).toBe(todayIso());

    await page.locator('select[name="categoryId"]').selectOption({ label: "Transport" });
    await page.locator('input[name="amount"]').fill("200");
    await page.getByRole("button", { name: "Save Expense" }).click();
    await expect(page.getByText("₹200").first()).toBeVisible();
  });

  test("dashboard reflects purchase cost, supply revenue, expenses and gross profit", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("₹800.00")).toBeVisible(); // milk purchase cost
    await expect(page.getByText("₹5200.00")).toBeVisible(); // milk supply revenue
    await expect(page.getByText("₹200.00")).toBeVisible(); // total expenses
    // Gross profit = 5200 - 800 - 200 = 4200
    await expect(page.getByText("₹4200.00")).toBeVisible();
  });
});
