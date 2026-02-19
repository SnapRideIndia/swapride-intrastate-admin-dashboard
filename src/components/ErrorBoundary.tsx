import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="bg-red-100 rounded-full p-4">
                <AlertTriangle className="h-16 w-16 text-red-600" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Oops! Something went wrong</h1>
              <p className="text-gray-600">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
            </div>

            {/* Error Details (Dev Only) */}
            {isDev && this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-900">Error Details:</h3>
                <pre className="text-sm text-red-600 overflow-auto max-h-40">{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer font-medium">Stack Trace</summary>
                    <pre className="mt-2 overflow-auto max-h-60">{this.state.errorInfo.componentStack}</pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={this.handleReload} size="lg" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" size="lg" className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            {/* Support Message */}
            <p className="text-center text-sm text-gray-500">If this problem persists, please contact support.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
