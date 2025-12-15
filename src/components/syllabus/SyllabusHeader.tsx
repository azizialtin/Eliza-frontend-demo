import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { Subchapter, Syllabus } from "@/lib/api"

import { useAuth } from "@/contexts/AuthContext"

interface SyllabusHeaderProps {
    courseTitle: string
    lessonTitle: string
    backUrl?: string
    subchapter: Subchapter
    onComplete: (checked: boolean) => void
}

export const SyllabusHeader: React.FC<SyllabusHeaderProps> = ({
    courseTitle,
    lessonTitle,
    backUrl,
    subchapter,
    onComplete
}) => {
    const navigate = useNavigate()
    const { user } = useAuth()

    // Determine back link and behavior
    const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN' // Simple role check if user object is available
    // Fallback if user context is missing (though should be present)

    const handleBack = () => {
        if (backUrl) {
            navigate(backUrl)
        } else if (isTeacher) {
            // If teacher, go back to syllabus management
            // The original comment suggests using chapter_id, but then notes syllabus ID is needed.
            // Relying on history back or dashboard for now.
            navigate(-1) // Go back one step in history
        } else {
            // Default to going back in history
            navigate(-1)
        }
    }

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        {/* Optional breadcrumb or title context can go here */}
                        <h1 className="text-sm text-gray-500 font-brand">{courseTitle}</h1>
                    </div>
                </div>
                <h1 className="font-brand text-xl md:text-2xl font-bold text-gray-900">{lessonTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
                <Checkbox
                    id="completed"
                    checked={subchapter.is_completed}
                    onCheckedChange={onComplete}
                    className="h-5 w-5 border-2 data-[state=checked]:bg-[hsl(91.4,100%,74.1%)] data-[state=checked]:border-[hsl(91.4,100%,74.1%)]"
                />
                <label
                    htmlFor="completed"
                    className="font-brand text-sm font-semibold cursor-pointer hidden md:block hover:text-[hsl(91.4,100%,74.1%)] transition-colors"
                >
                    Mark complete
                </label>
                {subchapter.is_completed && (
                    <Badge className="bg-gradient-to-r from-eliza-blue to-eliza-purple text-white border-0 hidden md:flex shadow-sm">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Done
                    </Badge>
                )}
            </div>
        </div>
    )
}
