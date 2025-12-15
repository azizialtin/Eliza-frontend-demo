"use client"

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardRightPanel } from "@/components/dashboard/DashboardRightPanel"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { User, Mail, Globe, Calendar } from "lucide-react"

export default function Profile() {
    const { user } = useAuth()
    const isTeacher = user?.role === "TEACHER"

    return (
        <div className="flex min-h-screen bg-gray-50 relative overflow-hidden font-brand">
            <div className="hidden lg:block w-64 flex-shrink-0">
                <DashboardSidebar className="fixed inset-y-0 w-64 z-20" />
            </div>

            <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative">
                <div className="w-full max-w-4xl mx-auto relative z-10 pb-20">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-eliza-purple" />
                                User Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Globe className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Language</p>
                                    <p className="font-medium text-gray-900">{localStorage.getItem("aula_user_language") || "Not set"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Age</p>
                                    <p className="font-medium text-gray-900">{localStorage.getItem("aula_user_age") || "Not set"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <div className="hidden xl:block w-80 flex-shrink-0">
                <DashboardRightPanel className="fixed inset-y-0 right-0 w-80 z-20" isTeacher={isTeacher} />
            </div>
        </div>
    )
}
