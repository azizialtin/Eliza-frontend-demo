
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown, Flame, Award } from "lucide-react";
import { GamifiedStudent, StudentStats } from "@/lib/mock-gamification";
import { cn } from "@/lib/utils";

interface ClassLeaderboardProps {
    leaderboardData: (StudentStats & { student: GamifiedStudent })[];
    isLoading: boolean;
    maxRows?: number; // Total rows to show (including top 3)
    variant?: 'default' | 'compact';
    category?: 'overall' | 'streak' | 'mastery' | 'interaction';
}

export function ClassLeaderboard({ leaderboardData, isLoading, maxRows, variant = 'default', category = 'overall' }: ClassLeaderboardProps) {
    // 1. Sort Data based on Category
    const sorted = [...leaderboardData].sort((a, b) => {
        switch (category) {
            case 'streak': return b.streak_days - a.streak_days;
            case 'mastery': return b.avg_mastery - a.avg_mastery;
            case 'interaction': return b.interactions_count - a.interactions_count;
            default: return b.total_xp - a.total_xp; // overall
        }
    });

    // 2. Re-assign Rank visually for this specific view (local rank)
    // We keep original rank for reference if needed, but usually leaderboards show 1,2,3 for the current sort
    const rankedData = sorted.map((item, index) => ({ ...item, displayRank: index + 1 }));

    const top3 = rankedData.slice(0, 3);
    const rest = rankedData.slice(3);

    const displayedRest = maxRows ? rest.slice(0, Math.max(0, maxRows - 3)) : rest;

    // Helper to render the primary metric for the current category
    const renderMetric = (entry: StudentStats, isPodium = false) => {
        switch (category) {
            case 'streak':
                return (
                    <div className="flex flex-col items-center">
                        <span className={cn("font-bold", isPodium ? "text-lg" : "text-sm text-eliza-purple")}>{entry.streak_days}</span>
                        <span className="text-[10px] uppercase text-gray-400">Days</span>
                    </div>
                );
            case 'mastery':
                return (
                    <div className="flex flex-col items-center">
                        <span className={cn("font-bold", isPodium ? "text-lg" : "text-sm text-eliza-purple")}>{entry.avg_mastery}%</span>
                        <span className="text-[10px] uppercase text-gray-400">Avg</span>
                    </div>
                );
            case 'interaction':
                return (
                    <div className="flex flex-col items-center">
                        <span className={cn("font-bold", isPodium ? "text-lg" : "text-sm text-eliza-purple")}>{entry.interactions_count}</span>
                        <span className="text-[10px] uppercase text-gray-400">Acts</span>
                    </div>
                );
            default: // overall
                return (
                    <div className="flex flex-col items-center">
                        <span className={cn("font-bold", isPodium ? "text-lg" : "text-sm text-eliza-purple")}>{entry.total_xp}</span>
                        <span className="text-[10px] uppercase text-gray-400">XP</span>
                    </div>
                );
        }
    };

    return (
        <Card className={cn(
            "border-0 shadow-lg bg-white/80 backdrop-blur-sm",
            variant === 'compact' && "shadow-none bg-transparent"
        )}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className={cn(
                        "font-bold bg-clip-text text-transparent bg-gradient-to-r from-eliza-purple to-eliza-blue",
                        variant === 'compact' ? "text-lg" : "text-xl"
                    )}>
                        {category === 'streak' ? 'Consistency' :
                            category === 'mastery' ? 'Top Mastery' :
                                category === 'interaction' ? 'Most Active' : 'Class Leaderboard'}
                    </CardTitle>
                    <Trophy className={cn(
                        "text-eliza-purple",
                        variant === 'compact' ? "h-4 w-4" : "h-5 w-5"
                    )} />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">Loading rankings...</div>
                ) : (
                    <>
                        {/* Podium Section - Always show top 3 if available */}
                        {top3.length > 0 && (
                            <div className={cn(
                                "flex items-end justify-center gap-2 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50",
                                variant === 'compact' ? "pt-4 pb-4 px-2" : "pt-6 pb-6 px-4"
                            )}>
                                {top3[1] && <PodiumStep entry={top3[1]} place={2} compact={variant === 'compact'} metric={renderMetric(top3[1], true)} />}
                                {top3[0] && <PodiumStep entry={top3[0]} place={1} compact={variant === 'compact'} metric={renderMetric(top3[0], true)} />}
                                {top3[2] && <PodiumStep entry={top3[2]} place={3} compact={variant === 'compact'} metric={renderMetric(top3[2], true)} />}
                            </div>
                        )}

                        {/* List Section */}
                        <div className="bg-white">
                            <table className="w-full">
                                {variant !== 'compact' && (
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="pl-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">Rank</th>
                                            <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                            <th className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Consistency</th>
                                            <th className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</th>
                                            <th className="pr-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Success</th>
                                        </tr>
                                    </thead>
                                )}
                                <tbody className="divide-y divide-gray-50">
                                    {displayedRest.map((entry) => (
                                        <tr key={entry.student_id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="pl-6 py-3 w-12 font-bold text-gray-400 text-sm">#{entry.displayRank}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-eliza-blue/10 flex items-center justify-center text-xs font-bold text-eliza-blue">
                                                        {getInitials(entry.student.first_name, entry.student.last_name)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">
                                                            {entry.student.first_name} {entry.student.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            {entry.badges[0] && <span>{entry.badges[0]}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Extra Metrics for Teacher View */}
                                            {variant !== 'compact' && (
                                                <>
                                                    <td className="py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-600" title="Active Streak">
                                                            <Flame className="w-4 h-4 text-orange-500" />
                                                            {entry.streak_days} <span className="text-xs text-gray-400">days</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-600" title="Total Interactions">
                                                            <Award className="w-4 h-4 text-blue-500" />
                                                            {entry.interactions_count}
                                                        </div>
                                                    </td>
                                                </>
                                            )}

                                            <td className="pr-6 py-3 text-right">
                                                {renderMetric(entry)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// Sub-components
function PodiumStep({ entry, place, compact, metric }: { entry: StudentStats & { student: GamifiedStudent }, place: number, compact?: boolean, metric: React.ReactNode }) {
    const isFirst = place === 1;
    const height = isFirst ? "h-32" : place === 2 ? "h-24" : "h-16";
    // Compact heights
    const finalHeight = compact ? (isFirst ? "h-24" : place === 2 ? "h-16" : "h-12") : height;

    return (
        <div className="flex flex-col items-center">
            <div className="relative mb-2">
                <div className={cn(
                    "rounded-full border-2 flex items-center justify-center font-bold bg-white z-10 relative",
                    isFirst ? "border-yellow-400 text-yellow-500" :
                        place === 2 ? "border-gray-300 text-gray-400" :
                            "border-amber-600 text-amber-700",
                    compact ? "w-10 h-10 text-xs" : "w-16 h-16 text-lg"
                )}>
                    {getInitials(entry.student.first_name, entry.student.last_name)}
                    <div className={cn(
                        "absolute -bottom-2 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-2 border-white",
                        compact ? "w-5 h-5 text-[9px]" : "w-6 h-6 text-xs"
                    )}>
                        {place}
                    </div>
                </div>
            </div>
            <div className={cn(
                "w-full rounded-t-lg flex flex-col items-center justify-end pb-2 opacity-90",
                finalHeight,
                isFirst ? "bg-yellow-100 w-24" :
                    place === 2 ? "bg-gray-100 w-20" :
                        "bg-amber-100 w-20",
                compact && "w-16" // override width for compact
            )}>
                {metric}
            </div>
            {!compact && (
                <div className="mt-2 text-center">
                    <p className="font-bold text-sm text-gray-800 line-clamp-1 max-w-[80px]">{entry.student.first_name}</p>
                </div>
            )}
        </div>
    )
}

function getInitials(first: string, last: string) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
