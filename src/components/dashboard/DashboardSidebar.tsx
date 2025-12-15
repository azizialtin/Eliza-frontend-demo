
import { Home, BookOpen, Settings, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import elizaText from "@/assets/eliza-text.png"

interface DashboardSidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DashboardSidebar({ className, ...props }: DashboardSidebarProps) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const items = [
        { icon: Home, label: "Dashboard", href: "/app" },
        { icon: BookOpen, label: "My Courses", href: "/app/courses" }, // Placeholder route
        { icon: User, label: "Profile", href: "/app/profile" }, // Placeholder route
        { icon: Settings, label: "Settings", href: "/app/settings" }, // Placeholder route
    ]

    const handleLogout = () => {
        logout()
        navigate("/auth")
    }

    return (
        <div className={cn("pb-12 min-h-screen border-r bg-white", className)} {...props}>
            <div className="space-y-4 py-4">
                <div className="px-6 py-2">
                    <img src={elizaText} alt="Logo" className="h-8 w-auto" />
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-gray-500">
                        Menu
                    </h2>
                    <div className="space-y-1">
                        {items.map((item) => (
                            <Button
                                key={item.href}
                                variant={location.pathname === item.href ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start font-brand",
                                    location.pathname === item.href && "bg-eliza-purple/10 text-eliza-purple hover:bg-eliza-purple/20"
                                )}
                                onClick={() => navigate(item.href)}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="px-3 py-2 mt-auto">
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
