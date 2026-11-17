import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[React render crash]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main>
          <h1>Page failed to render</h1>
          <pre>{this.state.error.message}</pre>
        </main>
      );
    }

    return this.props.children;
  }
}
