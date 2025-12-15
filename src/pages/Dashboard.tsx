"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { PageLoader } from "@/components/ui/page-loader"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!user) {
      navigate("/auth")
      return
    }

    const role = user.role?.toUpperCase()

    console.log("Dashboard Dispatcher: Redirecting user based on role:", role)

    switch (role) {
      case "TEACHER":
        navigate("/app/teacher/dashboard", { replace: true })
        break
      case "ADMIN":
        navigate("/app/admin/dashboard", { replace: true })
        break
      case "PARENT":
        navigate("/app/parent/dashboard", { replace: true })
        break
      case "STUDENT":
      default:
        // Default to student dashboard if role is STUDENT or unknown
        navigate("/app/student/dashboard", { replace: true })
        break
    }
  }, [user, loading, navigate])

  return <PageLoader text="Redirecting to your dashboard..." />
}
