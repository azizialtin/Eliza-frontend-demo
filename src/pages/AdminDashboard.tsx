"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, UserPlus, TrendingUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserTable } from "@/components/admin/UserTable"
import { CreateUserModal } from "@/components/admin/CreateUserModal"
import { CreateClassModal } from "@/components/admin/CreateClassModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminDashboard() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [users, setUsers] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [creatingClass, setCreatingClass] = useState(false)

    // Determine active tab based on URL path
    const getActiveTab = () => {
        const path = location.pathname
        if (path.includes("/users")) return "users"
        if (path.includes("/courses")) return "classes" // Sidebar link was "courses", tab value is "classes"
        return "overview"
    }

    const currentTab = getActiveTab()

    const handleTabChange = (value: string) => {
        // Sync URL with Tab
        switch (value) {
            case "users":
                navigate("/app/admin/users")
                break
            case "classes":
                navigate("/app/admin/courses") // Sidebar uses "courses"
                break
            case "overview":
            default:
                navigate("/app/admin/dashboard")
                break
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const [statsData, usersData, classesData] = await Promise.all([
                apiClient.getPlatformStats(),
                apiClient.getUsers(),
                apiClient.getClasses()
            ])
            setStats(statsData)
            setUsers(usersData)
            setClasses(classesData)
        } catch (error) {
            console.error("Failed to fetch admin data", error)
            toast({
                title: "Error",
                description: "Failed to load dashboard data",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar className="w-64 flex-shrink-0" />

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold font-brand text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-500 mt-1">Manage users, classes, and platform monitoring.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={async () => {
                                    if (creatingClass) return
                                    setCreatingClass(true)
                                    try {
                                        const newSyllabus = await apiClient.createSyllabus("New Class")
                                        navigate(`/app/teacher/syllabus/${newSyllabus.id}?asAdmin=true`)
                                    } catch (error) {
                                        console.error("Failed to create class:", error)
                                        toast({
                                            title: "Failed to create class",
                                            description: error instanceof Error ? error.message : "Unknown error",
                                            variant: "destructive"
                                        })
                                    } finally {
                                        setCreatingClass(false)
                                    }
                                }}
                                variant="outline"
                                disabled={creatingClass}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {creatingClass ? "Creating..." : "Create Class"}
                            </Button>
                            <Button onClick={() => setIsCreateUserOpen(true)} className="bg-eliza-purple hover:bg-eliza-purple/90">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        </div>
                    </div>

                    <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="users">Users</TabsTrigger>
                            <TabsTrigger value="classes">Classes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats?.total_users || 0}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-eliza-blue/10 rounded-full flex items-center justify-center text-eliza-blue">
                                            <Users className="w-6 h-6" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Classes</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats?.total_classes || 0}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-eliza-purple/10 rounded-full flex items-center justify-center text-eliza-purple">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">PDFs Processed</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats?.total_pdfs || 0}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-eliza-green/10 rounded-full flex items-center justify-center text-eliza-green">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Quizzes</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats?.total_quizzes || 0}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-eliza-red/10 rounded-full flex items-center justify-center text-eliza-red">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="users">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle>All Users</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <UserTable initialUsers={users} loading={loading} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="classes">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle>All Classes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Teacher ID</TableHead>
                                                    <TableHead>Created At</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {classes.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                                            No classes found
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    classes.map((cls) => (
                                                        <TableRow key={cls.id}>
                                                            <TableCell
                                                                className="font-medium cursor-pointer hover:text-eliza-blue hover:underline"
                                                                onClick={() => navigate(`/app/teacher/syllabus/${cls.id}?asAdmin=true`)}
                                                            >
                                                                {cls.title}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">{cls.teacher_id}</TableCell>
                                                            <TableCell className="text-gray-500">
                                                                {new Date(cls.created_at).toLocaleDateString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                </div>
            </main>

            <CreateUserModal
                isOpen={isCreateUserOpen}
                onClose={() => setIsCreateUserOpen(false)}
                onSuccess={fetchData}
            />

            <CreateClassModal
                isOpen={isCreateClassOpen}
                onClose={() => setIsCreateClassOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    )
}
