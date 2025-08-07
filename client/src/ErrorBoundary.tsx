import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check for ResizeObserver errors across different browsers
    const errorMessage = error.message || '';
    if (
      errorMessage.includes('ResizeObserver') ||
      errorMessage.includes('ResizeObserver loop') ||
      errorMessage.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      console.log('Suppressed ResizeObserver error in ErrorBoundary:', errorMessage);
      return { hasError: false }; // Don't show error UI for ResizeObserver
    }
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress ResizeObserver errors across all browsers
    const errorMessage = error.message || '';
    if (
      errorMessage.includes('ResizeObserver') ||
      errorMessage.includes('ResizeObserver loop') ||
      errorMessage.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      console.log('Suppressed ResizeObserver error in ErrorBoundary:', errorMessage);
      return;
    }
    
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
