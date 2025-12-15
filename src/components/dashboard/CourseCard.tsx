import { BookOpen, Users, Clock, MoreVertical, Trash2, Edit, BarChart3, Copy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ELIZA_COLORS } from "@/lib/constants"
import { formatDate } from "@/lib/utils"

interface CourseCardProps {
    syllabus: any
    index: number
    isTeacher: boolean
    onClick: (id: string) => void
    onDelete: (id: string, name: string, e: React.MouseEvent) => void
    onEdit?: (id: string, e: React.MouseEvent) => void
    onDuplicate?: (id: string, e: React.MouseEvent) => void
    onAnalytics?: (id: string, e: React.MouseEvent) => void
    onRename?: (id: string, name: string, e: React.MouseEvent) => void
}

export function CourseCard({
    syllabus,
    index,
    isTeacher,
    onClick,
    onDelete,
    onEdit,
    onDuplicate,
    onAnalytics,
    onRename
}: CourseCardProps) {
    const colors = ["eliza-red", "eliza-yellow", "eliza-blue", "eliza-green", "eliza-orange", "eliza-purple"]
    const color = colors[index % colors.length]

    // Map color names to HSL values
    const colorMap: Record<string, string> = {
        "eliza-red": ELIZA_COLORS.RED,
        "eliza-yellow": ELIZA_COLORS.YELLOW,
        "eliza-blue": ELIZA_COLORS.BLUE,
        "eliza-green": ELIZA_COLORS.GREEN,
        "eliza-orange": ELIZA_COLORS.ORANGE,
        "eliza-purple": ELIZA_COLORS.PURPLE,
    }

    const progressPercentage = syllabus.progress_percentage || 0
    const studentCount = syllabus.student_count || 0
    const isPublished = syllabus.is_published ?? syllabus.is_public ?? false

    return (
        <Card
            className="cursor-pointer hover:shadow-xl bg-white border-2 transition-all duration-300 hover:-translate-y-1 rounded-3xl overflow-hidden animate-fade-in group relative flex flex-col"
            style={{
                animationDelay: `${index * 100}ms`,
                borderColor: `hsl(${colorMap[color]} / 0.2)`,
            }}
            onClick={() => onClick(syllabus.id)}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `hsl(${colorMap[color]})`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `hsl(${colorMap[color]} / 0.2)`
            }}
        >
            <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full transition-colors"
                                style={{ backgroundColor: `hsl(${colorMap[color]} / 0.1)`, color: `hsl(${colorMap[color]})` }}
                            >
                                <BookOpen className="h-4 w-4" />
                                <span className="font-brand text-xs font-bold uppercase tracking-wide">
                                    {isTeacher ? "Course" : `${syllabus.total_subchapters || 0} Lessons`}
                                </span>
                            </div>
                            {isTeacher && (
                                <Badge variant={isPublished ? "default" : "secondary"} className="font-brand">
                                    {isPublished ? "Published" : "Draft"}
                                </Badge>
                            )}
                        </div>

                        <h3 className="font-brand text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-1" title={syllabus.name}>
                            {syllabus.name}
                        </h3>
                        <p className="font-brand text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                            {syllabus.description || "Ready to learn!"}
                        </p>

                        {/* Teacher View */}
                        {isTeacher && (
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span className="font-brand">{studentCount} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-brand">{formatDate(syllabus.updated_at)}</span>
                                </div>
                            </div>
                        )}

                        {/* Student View - Progress Text */}
                        {!isTeacher && (
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-gray-400 mt-4">
                                <span>Progress</span>
                                <span style={{ color: `hsl(${colorMap[color]})` }}>
                                    {progressPercentage}%
                                </span>
                            </div>
                        )}

                        {/* Teacher Actions */}
                        {isTeacher && (
                            <div className="flex items-center gap-2 mt-4">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => onEdit && onEdit(syllabus.id, e)}
                                    className="font-brand rounded-lg border-2"
                                    style={{ borderColor: `hsl(${colorMap[color]})`, color: `hsl(${colorMap[color]})` }}
                                >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => onAnalytics && onAnalytics(syllabus.id, e)}
                                    className="font-brand rounded-lg border-2 border-gray-300"
                                >
                                    <BarChart3 className="h-3 w-3 mr-1" />
                                    Analytics
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button size="sm" variant="ghost" className="font-brand">
                                            •••
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="font-brand">
                                        <DropdownMenuItem onClick={(e) => onDuplicate && onDuplicate(syllabus.id, e)}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => onDelete(syllabus.id, syllabus.name, e)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>

                    {/* Student Actions (Simple Dropdown) */}
                    {!isTeacher && (
                        <div className="flex items-start gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="font-brand rounded-xl border-gray-100 shadow-lg">
                                    <DropdownMenuItem
                                        onClick={(e) => onRename && onRename(syllabus.id, syllabus.name, e)}
                                        className="cursor-pointer"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => onDelete(syllabus.id, syllabus.name, e)}
                                        className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Full Width Progress Bar for Students */}
            {!isTeacher && (
                <div className="h-3 w-full bg-gray-50 mt-auto">
                    <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                            width: `${progressPercentage}%`,
                            backgroundColor: `hsl(${colorMap[color]})`
                        }}
                    />
                </div>
            )}
        </Card>
    )
}
