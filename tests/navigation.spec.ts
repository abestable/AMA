import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear login attempts by making a request to reset them
    try {
      await page.request.post('http://localhost:3001/api/auth/test/clear-login-attempts');
    } catch (error) {
      console.log('Could not clear login attempts, continuing with test...');
    }
    
    // Login prima di ogni test
    await page.goto('/login');
    await page.getByTestId('email-input').fill('admin@example.com');
    await page.getByTestId('password-input').fill('Admin123!');
    await page.getByTestId('login-button').click();
    
    // Wait for login to complete
    await expect(page.getByTestId('user-menu')).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to dashboard after login', async ({ page }) => {
    await expect(page.getByTestId('dashboard-title')).toBeVisible();
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.getByTestId('logout-button').click();
    
    // Verifica che il form di login sia visibile
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('should display user information', async ({ page }) => {
    // Verifica che le informazioni dell'utente siano visibili
    await expect(page.getByTestId('user-menu')).toBeVisible();
    await expect(page.getByTestId('dashboard-title')).toBeVisible();
  });
});
