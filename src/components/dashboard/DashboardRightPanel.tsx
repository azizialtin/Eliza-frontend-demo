
import { cn } from "@/lib/utils"
// AchievementsCard is imported directly in Dashboard currently, but we can wrap it here or move other stats
import { AchievementsCard } from "@/components/student/AchievementsCard"

interface DashboardRightPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    isTeacher?: boolean;
}

export function DashboardRightPanel({ className, isTeacher, ...props }: DashboardRightPanelProps) {
    return (
        <div className={cn("pb-12 min-h-screen border-l bg-white p-6 space-y-8", className)} {...props}>
            <div className="animate-fade-in">
                {/* We can reuse the AchievementsCard here */}
                {!isTeacher && <AchievementsCard variant="sidebar" />}
                {isTeacher && <p className="text-gray-500 text-sm">Teacher stats coming soon.</p>}
            </div>

            {/* Placeholder for future specific stats or calendar */}
            <div>
                <h2 className="font-brand text-lg font-bold text-gray-900 mb-4">Daily Goal</h2>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-600 mb-2">Complete 1 lesson today</p>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-eliza-green w-1/2 rounded-full" />
                    </div>
                    <p className="text-xs text-right mt-1 text-gray-400">50%</p>
                </div>
            </div>
        </div>
    )
}
