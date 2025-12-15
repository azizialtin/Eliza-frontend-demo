import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
    title: string
    subtitle: string
    characterImage: string
    onLogout: () => void
    titleColor?: string // Optional override, defaults to gray-900
}

export function DashboardHeader({
    title,
    subtitle,
    characterImage,
    onLogout,
    titleColor = "text-gray-900"
}: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 animate-fade-in">
            <div className="flex items-center gap-4">
                <div className="hidden sm:block bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <img src={characterImage || "/placeholder.svg"} alt="" className="w-16 h-16 object-contain" />
                </div>
                <div>
                    <h1 className={`font-brand text-3xl md:text-4xl font-bold ${titleColor} mb-1`}>{title}</h1>
                    <p className="font-brand text-gray-500 text-sm md:text-base">{subtitle}</p>
                </div>
            </div>
            <Button
                variant="outline"
                onClick={onLogout}
                className="border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-brand font-semibold rounded-2xl transition-all shadow-sm bg-white"
            >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
            </Button>
        </div>
    )
}
