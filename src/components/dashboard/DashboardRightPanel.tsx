import { cn } from "@/lib/utils"
// AchievementsCard is imported directly in Dashboard currently, but we can wrap it here or move other stats
import { AchievementsCard } from "@/components/student/AchievementsCard"
import { useState } from "react";
import { ClassLeaderboard } from "@/components/dashboard/analytics/ClassLeaderboard";
import { StudentStats, GamifiedStudent } from "@/lib/mock-gamification";
import { Trophy, Flame, Award, Target } from "lucide-react"; // Using Target for Mastery

interface DashboardRightPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    isTeacher?: boolean;
    leaderboardData?: (StudentStats & { student: GamifiedStudent })[];
    isLoading?: boolean;
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            )}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};

export function DashboardRightPanel({ className, isTeacher, leaderboardData = [], isLoading = false, ...props }: DashboardRightPanelProps) {
    const [category, setCategory] = useState<'overall' | 'streak' | 'mastery' | 'interaction'>('overall');

    return (
        <div className={cn("pb-12 min-h-screen border-l bg-white p-6 space-y-8 overflow-y-auto", className)} {...props}>
            <div className="animate-fade-in">
                {/* We can reuse the AchievementsCard here */}
                {!isTeacher && <AchievementsCard variant="sidebar" />}
                {isTeacher && <p className="text-gray-500 text-sm">Teacher stats coming soon.</p>}
            </div>

            {/* Student Leaderboard - Top 5 */}
            {!isTeacher && (
                <div className="animate-fade-in space-y-4" style={{ animationDelay: '100ms' }}>

                    {/* Category Tabs */}
                    <div className="flex p-1 bg-gray-100/50 rounded-lg justify-start gap-1 overflow-x-auto">
                        <TabButton
                            active={category === 'overall'}
                            onClick={() => setCategory('overall')}
                            icon={<Trophy className="w-3 h-3" />}
                            label="XP"
                        />
                        <TabButton
                            active={category === 'streak'}
                            onClick={() => setCategory('streak')}
                            icon={<Flame className="w-3 h-3" />}
                            label="Streak"
                        />
                        <TabButton
                            active={category === 'mastery'}
                            onClick={() => setCategory('mastery')}
                            icon={<Target className="w-3 h-3" />}
                            label="Mastery"
                        />
                        <TabButton
                            active={category === 'interaction'}
                            onClick={() => setCategory('interaction')}
                            icon={<Award className="w-3 h-3" />}
                            label="Engage"
                        />
                    </div>

                    <ClassLeaderboard
                        leaderboardData={leaderboardData}
                        isLoading={isLoading}
                        maxRows={5}
                        variant="compact"
                        category={category}
                    />
                </div>
            )}

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
