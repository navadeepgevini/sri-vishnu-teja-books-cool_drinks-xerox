import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback: ReactNode
  onError?: (error: Error) => void
}

type State = { error: Error | null }

/**
 * Catches render, effect and lazy-load errors below it, so one failure (a bad document, a chunk that
 * no longer exists after a redeploy, WebGL being unavailable) can't blank the whole site.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Caught by ErrorBoundary:', error, info.componentStack)
    this.props.onError?.(error)
  }

  render() {
    return this.state.error ? this.props.fallback : this.props.children
  }
}
