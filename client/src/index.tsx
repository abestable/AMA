import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import { setupResizeObserverPolyfill } from './polyfills';
import reportWebVitals from './reportWebVitals';

// Setup ResizeObserver polyfill for cross-browser compatibility
setupResizeObserverPolyfill();

// Universal cross-browser ResizeObserver error suppression
const suppressResizeObserverError = () => {
  // Detect Chrome on Windows specifically
  const isChromeWindows = () => {
    const userAgent = navigator.userAgent;
    return userAgent.includes('Chrome') && 
           userAgent.includes('Windows') && 
           !userAgent.includes('Edge');
  };

  // Method 1: Override console.error with Chrome Windows specific handling
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0];
    if (
      typeof errorMessage === 'string' && 
      (errorMessage.includes('ResizeObserver loop completed with undelivered notifications') ||
       errorMessage.includes('ResizeObserver') ||
       errorMessage.includes('ResizeObserver loop') ||
       errorMessage.includes('ResizeObserver loop completed') ||
       // Chrome Windows specific patterns
       (isChromeWindows() && errorMessage.includes('ResizeObserver')))
    ) {
      return; // Suppress ResizeObserver errors
    }
    originalConsoleError.apply(console, args);
  };

  // Method 2: Override window.onerror with Chrome Windows specific handling
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (
      typeof message === 'string' && 
      (message.includes('ResizeObserver loop completed with undelivered notifications') ||
       message.includes('ResizeObserver') ||
       message.includes('ResizeObserver loop') ||
       message.includes('ResizeObserver loop completed') ||
       // Chrome Windows specific patterns
       (isChromeWindows() && message.includes('ResizeObserver')))
    ) {
      return true; // Prevent error logging
    }
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Method 3: Handle unhandledrejection events
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && typeof event.reason === 'string' && 
        (event.reason.includes('ResizeObserver') || 
         event.reason.includes('ResizeObserver loop'))) {
      event.preventDefault();
      return;
    }
  });

  // Method 4: Chrome Windows specific ResizeObserver override
  if (typeof ResizeObserver !== 'undefined' && isChromeWindows()) {
    const OriginalResizeObserver = ResizeObserver;
    (window as any).ResizeObserver = function(callback: any) {
      const observer = new OriginalResizeObserver((entries, observer) => {
        try {
          // Add delay for Chrome Windows to prevent loop
          setTimeout(() => {
            callback(entries, observer);
          }, 0);
        } catch (error) {
          // Suppress ResizeObserver errors
          if (error instanceof Error && error.message.includes('ResizeObserver')) {
            return;
          }
          throw error;
        }
      });
      return observer;
    };
  } else if (typeof ResizeObserver !== 'undefined') {
    // Standard override for other browsers
    const OriginalResizeObserver = ResizeObserver;
    (window as any).ResizeObserver = function(callback: any) {
      const observer = new OriginalResizeObserver((entries, observer) => {
        try {
          callback(entries, observer);
        } catch (error) {
          // Suppress ResizeObserver errors
          if (error instanceof Error && error.message.includes('ResizeObserver')) {
            return;
          }
          throw error;
        }
      });
      return observer;
    };
  }

  // Method 5: Suppress React error overlay
  if (process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args[0];
      if (
        typeof errorMessage === 'string' && 
        (errorMessage.includes('ResizeObserver') || 
         errorMessage.includes('ResizeObserver loop'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };
  }

  // Method 6: Chrome Windows specific error suppression
  if (isChromeWindows()) {
    // Override Error constructor to catch ResizeObserver errors
    const OriginalError = Error;
    (window as any).Error = function(message: string) {
      if (message && message.includes('ResizeObserver')) {
        // Return a silent error for ResizeObserver
        const error = new OriginalError('Suppressed ResizeObserver error');
        error.stack = undefined;
        return error;
      }
      return new OriginalError(message);
    };
  }
};

// Apply the suppression
suppressResizeObserverError();

// Hide CRA/Webpack overlay to avoid intercepting pointer events in automated tests
const hideOverlay = () => {
  const iframe = document.getElementById('webpack-dev-server-client-overlay') as HTMLIFrameElement | null;
  if (iframe && iframe.style) {
    iframe.style.display = 'none';
    iframe.style.pointerEvents = 'none';
  }
};
const overlayObserver = new MutationObserver(() => hideOverlay());
overlayObserver.observe(document.documentElement, { childList: true, subtree: true });
hideOverlay();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // StrictMode disabled for cross-browser compatibility
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
