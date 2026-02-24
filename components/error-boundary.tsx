'use client'

import React from 'react'

interface Props {
    children: React.ReactNode
    fallback?: React.ReactNode
    componentName?: string
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Log to console in dev; in production you could log to an error service
        if (process.env.NODE_ENV === 'development') {
            console.error(`[ErrorBoundary] ${this.props.componentName || 'Component'} crashed:`, error, info)
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            return (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
                    <span className="text-4xl opacity-10 font-serif">⚠</span>
                    <p className="text-xs text-muted-foreground/40 font-premium-sans tracking-[0.3em] uppercase">
                        Something went wrong loading this section
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="text-[10px] text-primary/50 hover:text-primary transition-colors tracking-widest uppercase underline underline-offset-4"
                    >
                        Try again
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
