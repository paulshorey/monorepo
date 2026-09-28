'use client'

import { Component, ReactNode } from 'react'
import { ErrorTemplate } from '../mains/ErrorTemplate'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error
}

// ErrorBoundary must be an old-fashioned class component. Hooks are not supported.
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: {
      name: '',
      message: '',
      stack: '',
    },
  }
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  public render() {
    if (this.state.hasError) {
      return <ErrorTemplate error={this.state.error} />
    }
    return this.props.children
  }
}
