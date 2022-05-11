import React, { Component, ErrorInfo, ReactNode } from 'react'

import ErrorScreen from './ErrorScreen'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        cpLogger.push({ error, errorInfo })
    }

    public render() {
        if (this.state.hasError) {
            return <ErrorScreen />
        }

        return this.props.children
    }
}

export default ErrorBoundary
