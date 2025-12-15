import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                        <h1 className="font-brand text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-8">
                            We're sorry, but an unexpected error occurred. Please try reloading the page.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reload Page
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => this.setState({ hasError: false })}
                                className="w-full rounded-xl text-gray-500 hover:text-gray-700"
                            >
                                Try to recover
                            </Button>
                        </div>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-48 text-xs font-mono text-gray-700">
                                {this.state.error.toString()}
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
