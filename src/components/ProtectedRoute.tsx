
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { PageLoader } from "@/components/ui/page-loader"

interface ProtectedRouteProps {
    allowedRoles?: string[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, loading } = useAuth()

    if (loading) {
        return <PageLoader text="Checking permissions..." />
    }

    if (!user) {
        return <Navigate to="/auth" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === "TEACHER") return <Navigate to="/app/teacher/dashboard" replace />
        if (user.role === "ADMIN") return <Navigate to="/app/admin/dashboard" replace />
        return <Navigate to="/app" replace />
    }

    return <Outlet />
}
