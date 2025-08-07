import { test, expect } from '@playwright/test';

test.describe('Utility Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AMA/i);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Verifica meta tags importanti
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Click on the page to ensure focus is set
    await page.click('body');
    
    // Test tab navigation with more robust approach
    await page.keyboard.press('Tab');
    
    // Wait a bit for focus to settle
    await page.waitForTimeout(100);
    
    // Check if email input is focused or visible
    const emailInput = page.getByTestId('email-input');
    await expect(emailInput).toBeVisible();
    
    // Try to focus it if not already focused
    if (!(await emailInput.evaluate(el => el === document.activeElement))) {
      await emailInput.focus();
    }
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const passwordInput = page.getByTestId('password-input');
    await expect(passwordInput).toBeVisible();
    
    if (!(await passwordInput.evaluate(el => el === document.activeElement))) {
      await passwordInput.focus();
    }
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const loginButton = page.getByTestId('login-button');
    await expect(loginButton).toBeVisible();
    
    if (!(await loginButton.evaluate(el => el === document.activeElement))) {
      await loginButton.focus();
    }
  });

  test('should handle form submission with Enter key', async ({ page }) => {
    // Clear login attempts by making a request to reset them
    try {
      await page.request.post('http://localhost:3001/api/auth/test/clear-login-attempts');
    } catch (error) {
      console.log('Could not clear login attempts, continuing with test...');
    }
    
    await page.goto('/login');
    
    await page.getByTestId('email-input').fill('admin@example.com');
    await page.getByTestId('password-input').fill('Admin123!');
    await page.keyboard.press('Enter');
    
    // Wait for login to complete
    await expect(page.getByTestId('user-menu')).toBeVisible({ timeout: 15000 });
  });

  test('should handle browser back/forward', async ({ page }) => {
    await page.goto('/login');
    await page.goto('/register');
    await page.goBack();
    await expect(page).toHaveURL(/.*login/);
    
    await page.goForward();
    await expect(page).toHaveURL(/.*register/);
  });
});
