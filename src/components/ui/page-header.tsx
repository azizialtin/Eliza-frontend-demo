import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string
    description?: string
    backUrl?: string
    actions?: React.ReactNode
    icon?: React.ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    backUrl,
    actions,
    icon,
    className,
}: PageHeaderProps) {
    const navigate = useNavigate()

    return (
        <div className={cn("bg-white border-b-2 border-gray-200 shadow-sm", className)}>
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div className="flex items-center gap-4">
                    {backUrl && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(backUrl)}
                            className="rounded-full h-10 w-10 p-0 hover:bg-gray-100"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Button>
                    )}
                    <div className="flex-1">
                        <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-gray-900">{title}</h1>
                        {description && <p className="text-gray-600 mt-1">{description}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                    {icon && <div className="hidden md:block">{icon}</div>}
                </div>
            </div>
        </div>
    )
}
