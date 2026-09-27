import { test, expect } from "@playwright/test";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Wait until the loading spinner is gone and at least one segment button appears. */
async function waitForDataLoad(page: import("@playwright/test").Page) {
  // The loading screen shows "Loading…"; wait for it to disappear.
  await page.waitForFunction(
    () => !document.body.innerText.includes("Loading…"),
    { timeout: 60000 }
  );
  // Then wait for at least one segment button to be present.
  await page.waitForSelector(
    "section button[class*='rounded-md']",
    { timeout: 60000 }
  );
}

// ─── tests ──────────────────────────────────────────────────────────────────

test.describe("Predictive Insights Studio – E2E", () => {

  // 1. Page loads
  test("1. Page loads and shows title", async ({ page }) => {
    await page.goto("/");
    // The heading is a div, not an h1
    await expect(
      page.getByText("Predictive Insights Studio", { exact: true }).first()
    ).toBeVisible({ timeout: 60000 });
  });

  // 2. Segment list renders
  test("2. Segment list renders at least one segment", async ({ page }) => {
    await page.goto("/");
    await waitForDataLoad(page);

    // The SegmentList component renders buttons for each segment inside a
    // <section> with class "rounded-md border …".  At least one must be visible.
    const segmentButtons = page.locator(
      "section.rounded-md button[class*='rounded-md']"
    );
    await expect(segmentButtons.first()).toBeVisible();
    expect(await segmentButtons.count()).toBeGreaterThan(0);
  });

  // 3. Segment selection shows summary card
  test("3. Clicking a segment shows its summary card", async ({ page }) => {
    await page.goto("/");
    await waitForDataLoad(page);

    // Click the first segment
    const firstSegment = page
      .locator("section.rounded-md button[class*='rounded-md']")
      .first();
    await firstSegment.click();

    // The SegmentSummary component renders stat pills with uppercase labels
    await expect(
      page.getByText("Segment Size", { exact: true }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // 4. Use cases table renders with correct headers
  test("4. Use cases table renders with all column headers", async ({ page }) => {
    await page.goto("/");
    await waitForDataLoad(page);

    const headers = ["Name", "Type", "Channel", "Trigger", "ROI", "Confidence"];
    for (const header of headers) {
      // Use exact:true so the "Type: All" filter dropdown doesn't also match "Type"
      await expect(page.getByRole("button", { name: header, exact: true }).first()).toBeVisible();
    }
  });

  // 5. Confidence badges
  test("5. At least one confidence badge is visible", async ({ page }) => {
    await page.goto("/");
    await waitForDataLoad(page);

    // Badges render text "High", "Medium" or "Low" inside the table
    const badge = page.locator("table").getByText(/^(High|Medium|Low)$/).first();
    await expect(badge).toBeVisible({ timeout: 10000 });
  });

  // 6. Modal opens on use-case name click
  test("6. Clicking a use-case name opens the details modal", async ({ page }) => {
    await page.goto("/");
    await waitForDataLoad(page);

    // The use-case name links are blue buttons inside table rows
    const firstNameLink = page
      .locator("table tbody button.text-\\[\\#0265dc\\]")
      .first();
    await firstNameLink.click();

    // React Spectrum Dialog renders with role="dialog"
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // "Use Case Details" is in the React Spectrum <Header> element
    await expect(dialog.getByText("Use Case Details")).toBeVisible();

    // All three action buttons must be present
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "View Full Details" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Activate" })).toBeVisible();
  });

  // 7. Modal closes on Cancel
  test("7. Cancel button closes the modal", async ({ page }) => {
    await page.goto("/");
    await waitForDataLoad(page);

    const firstNameLink = page
      .locator("table tbody button.text-\\[\\#0265dc\\]")
      .first();
    await firstNameLink.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    await dialog.getByRole("button", { name: "Cancel" }).click();

    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });

  // 8. Sidebar section collapse / expand
  test("8. Sidebar section collapses and re-expands on header click", async ({ page }) => {
    await page.goto("/");
    await waitForDataLoad(page);

    // "Journey Management" is a collapsible button in the sidebar
    const sectionHeader = page.getByRole("button", { name: /Journey Management/i });
    await expect(sectionHeader).toBeVisible();

    // The first child item is "Campaigns" – visible by default
    const campaignsItem = page.getByTitle("Campaigns").first();
    await expect(campaignsItem).toBeVisible();

    // Collapse the section
    await sectionHeader.click();
    await expect(campaignsItem).not.toBeVisible({ timeout: 5000 });

    // Expand again
    await sectionHeader.click();
    await expect(campaignsItem).toBeVisible({ timeout: 5000 });
  });

  // 9. Sort by ROI
  test("9. Clicking ROI column header sorts without crashing", async ({ page }) => {
    await page.goto("/");
    await waitForDataLoad(page);

    const roiHeader = page.getByRole("button", { name: "ROI" });
    await roiHeader.click();

    // Table rows should still be present after sorting
    const rows = page.locator("table tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  // 10. Channel filter
  test("10. Channel filter updates the table", async ({ page }) => {
    await page.goto("/");
    await waitForDataLoad(page);

    // Count rows before filtering
    const rowsBefore = await page.locator("table tbody tr").count();

    // The Channel dropdown button has aria-haspopup="listbox"
    const channelDropdown = page.locator(
      'button[aria-haspopup="listbox"]',
      { hasText: /Channel/i }
    ).first();

    // Only interact if there are enough rows to make filtering meaningful
    if (rowsBefore > 0) {
      await channelDropdown.click();

      // Wait for the listbox to appear
      const listbox = page.getByRole("listbox", { name: /Channel/i });
      await expect(listbox).toBeVisible({ timeout: 5000 });

      // Get all options and pick the second one (index 1) if it exists
      const options = listbox.getByRole("option");
      const optionCount = await options.count();

      if (optionCount > 1) {
        // Pick a non-"All" option
        await options.nth(1).click();

        // After filtering, either rows changed or "No use cases match" appears
        const noMatch = page.getByText("No use cases match these filters.");
        const rowsAfter = await page.locator("table tbody tr").count();

        const filtered =
          (await noMatch.isVisible()) || rowsAfter !== rowsBefore;
        expect(filtered).toBeTruthy();
      } else {
        // Only "All" available – close the dropdown and pass
        await page.keyboard.press("Escape");
        expect(optionCount).toBeGreaterThanOrEqual(1);
      }
    } else {
      // No rows at all – skip gracefully
      console.log("Skipping channel filter test: no rows in table.");
    }
  });
});
