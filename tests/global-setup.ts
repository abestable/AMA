import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🧹 Setting up test environment...');
  
  // Start a browser to make API calls
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Wait for the server to be ready
    console.log('⏳ Waiting for server to be ready...');
    await page.goto('http://localhost:3000', { timeout: 30000 });
    
    // Reset database for clean test state
    console.log('🗄️ Resetting database for testing...');
    try {
      await page.request.post('http://localhost:3001/api/auth/test/reset-database');
      console.log('✅ Database reset complete');
    } catch (error) {
      console.log('⚠️ Could not reset database:', error);
    }
    
    // Clear login attempts
    console.log('🧹 Clearing login attempts...');
    try {
      await page.request.post('http://localhost:3001/api/auth/test/clear-login-attempts');
      console.log('✅ Login attempts cleared');
    } catch (error) {
      console.log('⚠️ Could not clear login attempts:', error);
    }
    
    console.log('✅ Test environment ready');
    
  } catch (error) {
    console.error('❌ Error during global setup:', error);
  } finally {
    await browser.close();
  }
  
  console.log('✅ Test environment setup complete');
}

export default globalSetup;
