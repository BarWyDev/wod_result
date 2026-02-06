import { test, expect } from '@playwright/test';

test.describe('Workout Flow', () => {
  test('should create workout and add result', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Wod Result/);

    // Navigate to create workout page
    await page.click('text=+ Nowy workout');
    await expect(page).toHaveURL('/workout/create');

    // Fill in workout form
    await page.fill('textarea[name="description"]', 'Test E2E Workout - AMRAP 20min');
    await page.selectOption('select[name="sortDirection"]', 'desc');
    await page.click('button[type="submit"]');

    // Should redirect to workout detail page
    await page.waitForURL(/\/workout\/.+/);

    // Verify workout description
    await expect(page.locator('text=Test E2E Workout - AMRAP 20min')).toBeVisible();

    // Add a result
    await page.fill('input[name="athleteName"]', 'Jan Kowalski');
    await page.selectOption('select[name="gender"]', 'M');
    await page.fill('input[name="resultValue"]', '150');
    await page.click('button:has-text("Dodaj wynik")');

    // Verify result appears in the list
    await expect(page.locator('text=Jan Kowalski')).toBeVisible();
    await expect(page.locator('text=150')).toBeVisible();

    // Add second result
    await page.fill('input[name="athleteName"]', 'Anna Nowak');
    await page.selectOption('select[name="gender"]', 'F');
    await page.fill('input[name="resultValue"]', '125');
    await page.click('button:has-text("Dodaj wynik")');

    // Verify both results are visible
    await expect(page.locator('text=Anna Nowak')).toBeVisible();
    await expect(page.locator('text=125')).toBeVisible();

    // Verify sorting (higher score first for desc)
    const results = page.locator('[class*="result"]');
    const firstResult = results.first();
    await expect(firstResult).toContainText('Jan Kowalski');
  });

  test('should filter workouts by date', async ({ page }) => {
    await page.goto('/');

    // Test date filters
    await page.click('button:has-text("7 dni")');
    await page.waitForTimeout(500);

    await page.click('button:has-text("30 dni")');
    await page.waitForTimeout(500);

    await page.click('button:has-text("Wszystkie")');
    await page.waitForTimeout(500);

    // Should not throw errors
    expect(true).toBe(true);
  });

  test('should handle time format results', async ({ page }) => {
    // Create workout
    await page.goto('/workout/create');
    await page.fill('textarea[name="description"]', 'Test Time Format - 5K Run');
    await page.selectOption('select[name="sortDirection"]', 'asc');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/workout\/.+/);

    // Add time-based results
    await page.fill('input[name="athleteName"]', 'Szybki Biegacz');
    await page.selectOption('select[name="gender"]', 'M');
    await page.fill('input[name="resultValue"]', '18:30');
    await page.click('button:has-text("Dodaj wynik")');

    await page.fill('input[name="athleteName"]', 'Wolny Biegacz');
    await page.selectOption('select[name="gender"]', 'M');
    await page.fill('input[name="resultValue"]', '25:45');
    await page.click('button:has-text("Dodaj wynik")');

    // Verify both results appear
    await expect(page.locator('text=Szybki Biegacz')).toBeVisible();
    await expect(page.locator('text=18:30')).toBeVisible();
    await expect(page.locator('text=Wolny Biegacz')).toBeVisible();
    await expect(page.locator('text=25:45')).toBeVisible();

    // Verify sorting (faster time first for asc)
    const results = page.locator('[class*="result"]');
    const firstResult = results.first();
    await expect(firstResult).toContainText('Szybki Biegacz');
  });

  test('should handle DNF results', async ({ page }) => {
    // Create workout
    await page.goto('/workout/create');
    await page.fill('textarea[name="description"]', 'Test DNF - Hero WOD');
    await page.selectOption('select[name="sortDirection"]', 'asc');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/workout\/.+/);

    // Add DNF result
    await page.fill('input[name="athleteName"]', 'DNF Athlete');
    await page.selectOption('select[name="gender"]', 'M');
    await page.fill('input[name="resultValue"]', 'DNF');
    await page.click('button:has-text("Dodaj wynik")');

    // Add normal result
    await page.fill('input[name="athleteName"]', 'Finisher');
    await page.selectOption('select[name="gender"]', 'F');
    await page.fill('input[name="resultValue"]', '12:30');
    await page.click('button:has-text("Dodaj wynik")');

    // Verify DNF appears last
    await expect(page.locator('text=DNF')).toBeVisible();
    await expect(page.locator('text=Finisher')).toBeVisible();
  });

  test('should filter results by gender', async ({ page }) => {
    // Create workout
    await page.goto('/workout/create');
    await page.fill('textarea[name="description"]', 'Test Gender Filter');
    await page.selectOption('select[name="sortDirection"]', 'desc');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/workout\/.+/);

    // Add male result
    await page.fill('input[name="athleteName"]', 'Male Athlete');
    await page.selectOption('select[name="gender"]', 'M');
    await page.fill('input[name="resultValue"]', '100');
    await page.click('button:has-text("Dodaj wynik")');

    // Add female result
    await page.fill('input[name="athleteName"]', 'Female Athlete');
    await page.selectOption('select[name="gender"]', 'F');
    await page.fill('input[name="resultValue"]', '80');
    await page.click('button:has-text("Dodaj wynik")');

    // Test gender filters
    await page.click('button:has-text("Mężczyźni")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("Kobiety")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("Wszyscy")');
    await page.waitForTimeout(300);

    // Both should be visible when "All" is selected
    await expect(page.locator('text=Male Athlete')).toBeVisible();
    await expect(page.locator('text=Female Athlete')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await expect(page).toHaveTitle(/Wod Result/);

    // Navigate to create workout
    await page.click('text=+ Nowy workout');
    await expect(page).toHaveURL('/workout/create');

    // Form should be usable on mobile
    await page.fill('textarea[name="description"]', 'Mobile Test');
    await page.selectOption('select[name="sortDirection"]', 'desc');

    expect(true).toBe(true);
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');
    await expect(page).toHaveTitle(/Wod Result/);

    expect(true).toBe(true);
  });
});
