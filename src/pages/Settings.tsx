"use client"

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardRightPanel } from "@/components/dashboard/DashboardRightPanel"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Settings() {
    const { user } = useAuth()
    const isTeacher = user?.role === "TEACHER"

    return (
        <div className="flex min-h-screen bg-gray-50 relative overflow-hidden font-brand">
            <div className="hidden lg:block w-64 flex-shrink-0">
                <DashboardSidebar className="fixed inset-y-0 w-64 z-20" />
            </div>

            <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative">
                <div className="w-full max-w-4xl mx-auto relative z-10 pb-20">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

                    <Card>
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="notifications">Email Notifications</Label>
                                    <p className="text-sm text-gray-500">Receive emails about your progress</p>
                                </div>
                                <Switch id="notifications" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="dark-mode">Dark Mode</Label>
                                    <p className="text-sm text-gray-500">Enable dark theme (Coming soon)</p>
                                </div>
                                <Switch id="dark-mode" disabled />
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
