import { Loader2 } from "lucide-react"

export function PageLoader({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
                <p className="text-muted-foreground font-brand">{text}</p>
            </div>
        </div>
    )
}
