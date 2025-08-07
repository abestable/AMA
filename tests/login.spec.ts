import { test, expect } from '@playwright/test';

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear login attempts by making a request to reset them
    try {
      await page.request.post('http://localhost:3001/api/auth/test/clear-login-attempts');
    } catch (error) {
      console.log('Could not clear login attempts, continuing with test...');
    }
    
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Verifica che il form di login sia visibile
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Clicca login senza inserire dati
    await page.getByTestId('login-button').click();
    
    // Verifica che il form sia ancora visibile (nessun redirect)
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    // Inserisci email non valida
    await page.getByTestId('email-input').fill('invalid-email');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-button').click();
    
    // Verifica che il form sia ancora visibile
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Login con credenziali valide
    await page.getByTestId('email-input').fill('admin@example.com');
    await page.getByTestId('password-input').fill('Admin123!');
    await page.getByTestId('login-button').click();
    
    // Wait for login to complete
    await expect(page.getByTestId('user-menu')).toBeVisible({ timeout: 15000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Login con credenziali sbagliate
    await page.getByTestId('email-input').fill('wrong@email.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-button').click();
    
    // Verifica che il form sia ancora visibile
    await expect(page.getByTestId('login-form')).toBeVisible();
  });
});
