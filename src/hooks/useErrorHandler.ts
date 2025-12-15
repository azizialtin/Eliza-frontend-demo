import { useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface ErrorHandlerOptions {
    title?: string
    description?: string
    showToast?: boolean
    context?: Record<string, any>
}

export function useErrorHandler() {
    const { toast } = useToast()

    const handleError = useCallback(
        (error: unknown, options: ErrorHandlerOptions = {}) => {
            const {
                title = "An error occurred",
                description,
                showToast = true,
                context,
            } = options

            // Log to console with context
            console.error(title, error, context ? { context } : "")

            // Extract error message
            const errorMessage =
                description ||
                (error instanceof Error ? error.message : "Something went wrong. Please try again.")

            // Show toast
            if (showToast) {
                toast({
                    title,
                    description: errorMessage,
                    variant: "destructive",
                })
            }
        },
        [toast]
    )

    return { handleError }
}
