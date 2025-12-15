"use client"

import { useState } from "react"
import { Users, BookOpen, Settings, LogOut, Shield } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

interface AdminSidebarProps {
    className?: string
}

export const AdminSidebar = ({ className }: AdminSidebarProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout } = useAuth()

    const menuItems = [
        { icon: Shield, label: "Overview", path: "/app/admin/dashboard" },
        { icon: Users, label: "Users", path: "/app/admin/users" },
        { icon: BookOpen, label: "All Courses", path: "/app/admin/courses" },
        { icon: Settings, label: "Settings", path: "/app/admin/settings" },
    ]

    return (
        <div className={cn("flex flex-col h-full bg-white border-r border-gray-200", className)}>
            <div className="p-6">
                <h2 className="font-brand text-2xl font-bold text-eliza-purple flex items-center gap-2">
                    Aula Admin
                </h2>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium font-brand",
                                isActive
                                    ? "bg-eliza-purple/10 text-eliza-purple"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => {
                        logout()
                        navigate("/auth")
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium font-brand"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
