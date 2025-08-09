import { test, expect } from '@playwright/test';

test.describe('Registration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear login attempts by making a request to reset them
    try {
      await page.request.post('http://localhost:3001/api/auth/test/clear-login-attempts');
    } catch (error) {
      console.log('Could not clear login attempts, continuing with test...');
    }
    
    // Go to the app
    await page.goto('/');
  });

  test('should display registration form', async ({ page }) => {
    // Click on register link
    await page.getByTestId('switch-to-register-button').click();
    
    // Check if registration form is visible
    await expect(page.getByTestId('register-title')).toBeVisible();
    await expect(page.getByTestId('register-form')).toBeVisible();
    await expect(page.getByTestId('register-email-input')).toBeVisible();
    await expect(page.getByTestId('register-username-input')).toBeVisible();
    await expect(page.getByTestId('register-password-input')).toBeVisible();
    await expect(page.getByTestId('register-confirm-password-input')).toBeVisible();
    await expect(page.getByTestId('register-firstname-input')).toBeVisible();
    await expect(page.getByTestId('register-lastname-input')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Go to registration form
    await page.getByTestId('switch-to-register-button').click();
    
    // Try to submit empty form
    await page.getByTestId('register-button').click();
    
    // Check for validation errors
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Username is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page.getByText('Please confirm your password')).toBeVisible();
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Last name is required')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    // Go to registration form
    await page.getByTestId('switch-to-register-button').click();
    
    // Fill in invalid email
    await page.getByTestId('register-email-input').fill('invalid-email');
    await page.getByTestId('register-button').click();
    
    // Check for email validation error
    await expect(page.getByText('Email is invalid')).toBeVisible();
  });

  test('should show validation error for short username', async ({ page }) => {
    // Go to registration form
    await page.getByTestId('switch-to-register-button').click();
    
    // Fill in short username
    await page.getByTestId('register-username-input').fill('ab');
    await page.getByTestId('register-button').click();
    
    // Check for username validation error
    await expect(page.getByText('Username must be at least 3 characters')).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    // Go to registration form
    await page.getByTestId('switch-to-register-button').click();
    
    // Fill in short password
    await page.getByTestId('register-password-input').fill('123');
    await page.getByTestId('register-button').click();
    
    // Check for password validation error
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('should show validation error for mismatched passwords', async ({ page }) => {
    // Go to registration form
    await page.getByTestId('switch-to-register-button').click();
    
    // Fill in different passwords
    await page.getByTestId('register-password-input').fill('password123');
    await page.getByTestId('register-confirm-password-input').fill('password456');
    await page.getByTestId('register-button').click();
    
    // Check for password mismatch error
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should register successfully with valid data', async ({ page }) => {
    // Go to registration form
    await page.getByTestId('switch-to-register-button').click();
    
    // Fill in valid registration data
    await page.getByTestId('register-email-input').fill('newuser@example.com');
    await page.getByTestId('register-username-input').fill('newuser');
    await page.getByTestId('register-firstname-input').fill('New');
    await page.getByTestId('register-lastname-input').fill('User');
    await page.getByTestId('register-password-input').fill('NewUser123!');
    await page.getByTestId('register-confirm-password-input').fill('NewUser123!');
    
    // Submit form
    await page.getByTestId('register-button').click();
    
    // Check for success message
    await expect(page.getByText('Registration successful!')).toBeVisible();
  });

  test('should switch back to login form', async ({ page }) => {
    // Go to registration form
    await page.getByTestId('switch-to-register-button').click();
    
    // Switch back to login
    await page.getByTestId('switch-to-login-button').click();
    
    // Check if login form is visible
    await expect(page.getByTestId('login-title')).toBeVisible();
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('should login with newly registered user', async ({ page }) => {
    // First register a new user
    await page.getByTestId('switch-to-register-button').click();
    await page.getByTestId('register-email-input').fill('testlogin@example.com');
    await page.getByTestId('register-username-input').fill('testlogin');
    await page.getByTestId('register-firstname-input').fill('Test');
    await page.getByTestId('register-lastname-input').fill('Login');
    await page.getByTestId('register-password-input').fill('TestLogin123!');
    await page.getByTestId('register-confirm-password-input').fill('TestLogin123!');
    await page.getByTestId('register-button').click();
    
    // Wait for registration success
    await expect(page.getByText('Registration successful!')).toBeVisible();
    
    // Now login with the new user
    await page.getByTestId('switch-to-login-button').click();
    await page.getByTestId('email-input').fill('testlogin@example.com');
    await page.getByTestId('password-input').fill('TestLogin123!');
    await page.getByTestId('login-button').click();
    
    // Check if login was successful
    await expect(page.getByTestId('user-menu')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('testlogin')).toBeVisible();
  });
});
