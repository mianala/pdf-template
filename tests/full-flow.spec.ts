import { test, expect } from "@playwright/test";

const PDF_TIMEOUT = 45_000; // Babel + React-PDF is heavy in headless

/** Helper: wait for PDF preview iframe to have a blob URL */
async function waitForPdf(page: import("@playwright/test").Page) {
  const iframe = page.locator(".preview-iframe");
  await expect(iframe).toHaveAttribute("src", /^blob:/, {
    timeout: PDF_TIMEOUT,
  });
  return iframe;
}

/** Helper: generate a share URL and return it */
async function getShareUrl(page: import("@playwright/test").Page) {
  await page.locator("button", { hasText: "Share URL" }).click();
  const shareInput = page.locator(".share-input");
  await expect(shareInput).toBeVisible();
  return shareInput.inputValue();
}

test.describe("PDF Template — Full Flow", () => {
  test("1. App loads with default template", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".logo")).toHaveText("PDF Template");

    const nameInput = page.locator(".name-input");
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue("Business Permit");

    await expect(page.locator("button", { hasText: "Share URL" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Download PDF" })).toBeVisible();

    await expect(page.locator(".tab-active")).toHaveText("Code");
  });

  test("2. Code editor loads and displays template code", async ({ page }) => {
    await page.goto("/");

    const editor = page.locator(".cm-editor, .code-fallback");
    await expect(editor).toBeVisible({ timeout: 10_000 });
  });

  test("3. Variables tab shows extracted variables", async ({ page }) => {
    await page.goto("/");

    const variablesTab = page.locator(".tab", { hasText: "Fields" });
    await expect(variablesTab).toBeVisible();
    await variablesTab.click();

    const fields = page.locator(".variable-field");
    await expect(fields.first()).toBeVisible({ timeout: 5_000 });

    await expect(page.locator("label", { hasText: "Municipality" })).toBeVisible();
    await expect(page.locator("label", { hasText: "Business Name" })).toBeVisible();
    await expect(page.locator("label", { hasText: "Owner Name" })).toBeVisible();
    await expect(page.locator("label", { hasText: "Date Issued" })).toBeVisible();

    const municipalityField = page.locator("#var-Municipality");
    await expect(municipalityField).toHaveValue("City of Antananarivo");
  });

  test("4. PDF preview generates successfully", async ({ page }) => {
    await page.goto("/");

    // Wait for the preview — either iframe (success) or error div
    const iframe = page.locator(".preview-iframe");
    const error = page.locator(".preview-error");

    await expect(iframe.or(error)).toBeVisible({ timeout: PDF_TIMEOUT });

    // If error is shown, log it for debugging
    if (await error.isVisible()) {
      const errorText = await error.textContent();
      console.log("PDF generation error:", errorText);
    }

    // Assert PDF generated (iframe with blob URL)
    await expect(iframe).toHaveAttribute("src", /^blob:/, {
      timeout: PDF_TIMEOUT,
    });

    await expect(error).not.toBeVisible();
  });

  test("5. Editing a variable updates the preview", async ({ page }) => {
    await page.goto("/");

    const iframe = await waitForPdf(page);
    const initialSrc = await iframe.getAttribute("src");

    await page.locator(".tab", { hasText: "Fields" }).click();

    const businessNameField = page.locator("#var-Business\\ Name");
    await businessNameField.clear();
    await businessNameField.fill("New Business LLC");

    // Wait for PDF to regenerate
    await page.waitForFunction(
      (oldSrc) => {
        const el = document.querySelector(
          ".preview-iframe"
        ) as HTMLIFrameElement;
        return el && el.src !== oldSrc && el.src.startsWith("blob:");
      },
      initialSrc,
      { timeout: PDF_TIMEOUT }
    );

    const newSrc = await iframe.getAttribute("src");
    expect(newSrc).not.toBe(initialSrc);
  });

  test("6. Share URL generates a valid template URL", async ({ page }) => {
    await page.goto("/");

    const shareUrl = await getShareUrl(page);
    expect(shareUrl).toContain("#/t/");
    expect(shareUrl.length).toBeGreaterThan(50);
  });

  test("7. Shared URL loads template in fill mode", async ({ page }) => {
    await page.goto("/");
    const shareUrl = await getShareUrl(page);

    // Navigate to the shared URL
    const hash = new URL(shareUrl).hash;
    await page.goto("/" + hash);

    // Fill mode indicators
    await expect(page.locator(".template-name")).toHaveText("Business Permit");
    await expect(
      page.locator("button", { hasText: "New Template" })
    ).toBeVisible();

    // Variables tab visible, code tab hidden
    const fieldsTab = page.locator(".tab", { hasText: "Fields" });
    await expect(fieldsTab).toBeVisible();
    await expect(page.locator(".tab", { hasText: "Code" })).not.toBeVisible();

    // Pre-filled variable values
    await fieldsTab.click();
    await expect(page.locator("#var-Municipality")).toHaveValue(
      "City of Antananarivo"
    );
  });

  test("8. Fill mode: user can edit variables and get PDF", async ({
    page,
  }) => {
    await page.goto("/");
    const shareUrl = await getShareUrl(page);
    const hash = new URL(shareUrl).hash;
    await page.goto("/" + hash);

    const iframe = await waitForPdf(page);

    const fieldsTab = page.locator(".tab", { hasText: "Fields" });
    await fieldsTab.click();
    const ownerField = page.locator("#var-Owner\\ Name");
    await ownerField.clear();
    await ownerField.fill("Marie Razafy");

    const prevSrc = await iframe.getAttribute("src");
    await page.waitForFunction(
      (oldSrc) => {
        const el = document.querySelector(
          ".preview-iframe"
        ) as HTMLIFrameElement;
        return el && el.src !== oldSrc && el.src.startsWith("blob:");
      },
      prevSrc,
      { timeout: PDF_TIMEOUT }
    );

    const newSrc = await iframe.getAttribute("src");
    expect(newSrc).not.toBe(prevSrc);
  });

  test("9. Download PDF triggers file download", async ({ page }) => {
    await page.goto("/");
    await waitForPdf(page);

    const downloadPromise = page.waitForEvent("download", {
      timeout: PDF_TIMEOUT,
    });
    await page.locator("button", { hasText: "Download PDF" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("Business Permit.pdf");
  });

  test("10. New Template resets to create mode", async ({ page }) => {
    await page.goto("/");
    const shareUrl = await getShareUrl(page);
    const hash = new URL(shareUrl).hash;
    await page.goto("/" + hash);

    await expect(
      page.locator("button", { hasText: "New Template" })
    ).toBeVisible();

    await page.locator("button", { hasText: "New Template" }).click();

    await expect(page.locator(".name-input")).toBeVisible();
    await expect(page.locator(".name-input")).toHaveValue("Business Permit");
    await expect(page.locator(".tab", { hasText: "Code" })).toBeVisible();

    const currentUrl = page.url();
    expect(currentUrl).not.toContain("#/t/");
  });

  test("11. Template name changes reflected in share URL", async ({
    page,
  }) => {
    await page.goto("/");

    const nameInput = page.locator(".name-input");
    await nameInput.clear();
    await nameInput.fill("Custom Invoice");

    const shareUrl = await getShareUrl(page);
    const hash = new URL(shareUrl).hash;
    await page.goto("/" + hash);

    await expect(page.locator(".template-name")).toHaveText("Custom Invoice");
  });
});
