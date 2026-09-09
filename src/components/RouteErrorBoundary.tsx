import { Component, type ReactNode } from "react";

export class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" role="alert">
        <h1 className="text-2xl font-semibold">This page couldn’t load</h1>
        <p>Please reload to try again. Your account is still saved.</p>
        <button className="underline" onClick={() => window.location.reload()}>Reload page</button>
        <a className="underline" href="/">Return to home</a>
      </main>;
    }
    return this.props.children;
  }
}
