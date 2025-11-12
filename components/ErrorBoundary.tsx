import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary component - Catches JavaScript errors in child component tree
 * Displays a fallback UI instead of crashing the entire application
 *
 * @example
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * Note: Error boundaries do NOT catch errors for:
 * - Event handlers (use try-catch)
 * - Asynchronous code (setTimeout, promises)
 * - Server side rendering
 * - Errors thrown in the error boundary itself
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Store error info in state for display
    this.setState({ errorInfo });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // You could also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: '32px',
            margin: '32px',
            border: '2px solid #f44336',
            borderRadius: '8px',
            backgroundColor: '#ffebee',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ color: '#c62828', margin: '0 0 8px 0', fontSize: '24px' }}>
              ⚠️ Er is iets misgegaan
            </h2>
            <p style={{ color: '#666', margin: '0', fontSize: '16px' }}>
              We hebben een onverwachte fout gedetecteerd. Probeer de pagina te vernieuwen of
              klik op de knop hieronder om opnieuw te proberen.
            </p>
          </div>

          {/* Error details (development mode) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginBottom: '16px' }}>
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#c62828',
                  marginBottom: '8px',
                  fontSize: '14px',
                }}
              >
                📋 Technische details (alleen in ontwikkelingsmodus)
              </summary>
              <div
                style={{
                  backgroundColor: '#fff',
                  padding: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  marginTop: '8px',
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '12px', color: '#c62828' }}>Error:</strong>
                  <pre
                    style={{
                      margin: '4px 0',
                      padding: '8px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {this.state.error.toString()}
                  </pre>
                </div>

                {this.state.errorInfo && (
                  <div>
                    <strong style={{ fontSize: '12px', color: '#c62828' }}>
                      Component Stack:
                    </strong>
                    <pre
                      style={{
                        margin: '4px 0',
                        padding: '8px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '11px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: '200px',
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2196f3';
              }}
            >
              🔄 Probeer opnieuw
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#fff',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#999';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#ddd';
              }}
            >
              ↻ Vernieuw pagina
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple fallback component for error boundaries
 */
export const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>⚠️ Er is iets misgegaan</h2>
    <p>We konden deze pagina niet laden. Probeer het later opnieuw.</p>
    {error && process.env.NODE_ENV === 'development' && (
      <details style={{ marginTop: '20px', textAlign: 'left' }}>
        <summary>Error details</summary>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {error.toString()}
        </pre>
      </details>
    )}
  </div>
);
