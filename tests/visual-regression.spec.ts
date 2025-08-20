import { expect, test } from '@playwright/test';

test.describe('Sankey Link Path Visual Tests', () => {
  test('simple sankey diagram renders correctly', async ({ page }) => {
    await page.goto('/simple-sankey.html');

    // Wait for the SVG to be rendered
    await page.waitForSelector('.sankey-link');
    await page.waitForTimeout(1000); // Additional wait for animations

    // Take screenshot of the entire container
    const container = page.locator('.container');
    await expect(container).toHaveScreenshot('simple-sankey.png');
  });

  test('complex sankey diagram renders correctly', async ({ page }) => {
    await page.goto('/complex-sankey.html');

    // Wait for the SVG to be rendered
    await page.waitForSelector('.sankey-link');
    await page.waitForTimeout(1000); // Additional wait for animations

    // Take screenshot of the entire container
    const container = page.locator('.container');
    await expect(container).toHaveScreenshot('complex-sankey.png');
  });

  test('different interpolations render correctly', async ({ page }) => {
    await page.goto('/different-interpolations.html');

    // Wait for all SVGs to be rendered
    await page.waitForSelector('#interp-2 .sankey-link');
    await page.waitForSelector('#interp-3 .sankey-link');
    await page.waitForSelector('#interp-10 .sankey-link');
    await page.waitForSelector('#interp-50 .sankey-link');
    await page.waitForTimeout(1000); // Additional wait for animations

    // Take screenshots of each interpolation level
    await expect(page.locator('#interp-2').locator('..')).toHaveScreenshot('interpolation-2.png');
    await expect(page.locator('#interp-3').locator('..')).toHaveScreenshot('interpolation-3.png');
    await expect(page.locator('#interp-10').locator('..')).toHaveScreenshot('interpolation-10.png');
    await expect(page.locator('#interp-50').locator('..')).toHaveScreenshot('interpolation-50.png');
  });

  test('d3 vs custom implementation comparison renders correctly', async ({ page }) => {
    await page.goto('/d3-comparison.html');

    // Wait for all comparison diagrams to be rendered
    await page.waitForSelector('#d3-sankey .sankey-node');
    await page.waitForSelector('#custom-sankey .sankey-node');
    await page.waitForTimeout(1500); // Additional wait for complex rendering

    // Take screenshots of each comparison
    await expect(page.locator('.comparison-container').first()).toHaveScreenshot(
      'd3-vs-custom.png'
    );
  });
});
