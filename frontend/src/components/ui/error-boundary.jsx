import { Component } from 'react'

/**
 * Route-level error boundary. Catches render crashes in any subtree and
 * shows a themed recovery screen instead of a blank page. "Try again"
 * resets the boundary; a full reload is offered as the escape hatch.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-display text-5xl font-black text-[var(--color-primary)]">!</p>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Something went wrong</h1>
        <p className="max-w-md text-sm text-[var(--color-text-muted)]">
          An unexpected error interrupted this page. Your cart and account are safe.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="h-10 rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)]"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-10 rounded-md border border-[var(--color-border-strong)] px-4 text-sm font-medium text-[var(--color-text)]"
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
}
