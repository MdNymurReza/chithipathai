import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(error?.message || "");
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-paper p-4 text-center">
          <div className="paper-card p-8 max-w-md">
            <h2 className="text-2xl font-serif text-accent mb-4">ওহ না! (Oh no!)</h2>
            <p className="text-ink/70 mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              পুনরায় চেষ্টা করুন (Try Again)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
