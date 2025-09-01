// src/components/ErrorBoundary.tsx
import React from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error('Error boundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-sm text-muted-foreground p-4">Something went wrong.</div>;
    }
    return this.props.children;
  }
}
