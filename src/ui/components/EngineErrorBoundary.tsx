import { Component, type ReactNode } from 'react';
import EngineFallback from './EngineFallback';

interface EngineErrorBoundaryProps {
  title: string;
  onBack?: () => void;
  children: ReactNode;
}

interface EngineErrorBoundaryState {
  message: string | null;
}

export default class EngineErrorBoundary extends Component<EngineErrorBoundaryProps, EngineErrorBoundaryState> {
  state: EngineErrorBoundaryState = { message: null };

  static getDerivedStateFromError(error: Error): EngineErrorBoundaryState {
    return { message: error.message || 'The document engine failed.' };
  }

  componentDidCatch(error: Error): void {
    this.setState({ message: error.message || 'The document engine failed.' });
  }

  render() {
    if (this.state.message) {
      return (
        <EngineFallback
          title={this.props.title}
          message={`This file could not be displayed (${this.state.message}). It is still stored safely on your device.`}
          onBack={this.props.onBack}
        />
      );
    }
    return this.props.children;
  }
}
