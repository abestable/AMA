// ResizeObserver polyfill for cross-browser compatibility
export const setupResizeObserverPolyfill = () => {
  if (typeof window === 'undefined') return;

  // Only apply polyfill if ResizeObserver is not available or has issues
  if (typeof ResizeObserver === 'undefined') {
    console.warn('ResizeObserver not available, using polyfill');
    (window as any).ResizeObserver = class ResizeObserverPolyfill {
      private callback: ResizeObserverCallback;
      private elements: Set<Element> = new Set();

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe(element: Element) {
        this.elements.add(element);
        // Simple implementation - in production you'd want a more robust polyfill
      }

      unobserve(element: Element) {
        this.elements.delete(element);
      }

      disconnect() {
        this.elements.clear();
      }
    };
  } else {
    // Wrap existing ResizeObserver to handle errors gracefully
    const OriginalResizeObserver = ResizeObserver;
    (window as any).ResizeObserver = class SafeResizeObserver extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super((entries, observer) => {
          try {
            callback(entries, observer);
          } catch (error) {
            // Suppress ResizeObserver errors
            if (error instanceof Error && 
                (error.message.includes('ResizeObserver') || 
                 error.message.includes('ResizeObserver loop'))) {
              return;
            }
            // Re-throw other errors
            throw error;
          }
        });
      }
    };
  }
};

