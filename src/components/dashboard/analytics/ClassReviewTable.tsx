import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { StudentStats, GamifiedStudent } from "@/lib/mock-gamification";
import { cn } from "@/lib/utils";

interface ClassReviewTableProps {
    leaderboardData: (StudentStats & { student: GamifiedStudent })[];
    isLoading: boolean;
    classId?: string;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'On Track':
            return 'bg-green-100 text-green-800 hover:bg-green-100';
        case 'Consistent':
            return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
        case 'High Help Needed':
            return 'bg-red-100 text-red-800 hover:bg-red-100';
        case 'Struggling':
            return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
        default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'On Track':
        case 'Consistent':
            return <CheckCircle className="w-4 h-4" />;
        case 'High Help Needed':
        case 'Struggling':
            return <AlertCircle className="w-4 h-4" />;
        default:
            return <TrendingUp className="w-4 h-4" />;
    }
};

const getDifficultyLabel = (avgDiff: number) => {
    if (avgDiff >= 3.5) return { label: 'Expert', color: 'text-purple-600' };
    if (avgDiff >= 2.5) return { label: 'Hard', color: 'text-red-600' };
    if (avgDiff >= 1.5) return { label: 'Medium', color: 'text-orange-600' };
    return { label: 'Easy', color: 'text-green-600' };
};

export function ClassReviewTable({ leaderboardData, isLoading, classId }: ClassReviewTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    if (isLoading) {
        return (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-eliza-purple" />
                        Class Review
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-8 text-center text-gray-400">Loading class data...</div>
                </CardContent>
            </Card>
        );
    }

    // Pagination calculations
    const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedData = leaderboardData.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-eliza-purple" />
                        Class Review
                        <span className="text-sm font-normal text-gray-500 ml-2">
                            ({leaderboardData.length} students)
                        </span>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="font-semibold">Student Name</TableHead>
                                <TableHead className="text-right font-semibold">Total Points</TableHead>
                                <TableHead className="text-center font-semibold">Streak</TableHead>
                                <TableHead className="text-center font-semibold">Avg Difficulty</TableHead>
                                <TableHead className="text-center font-semibold">Interactions</TableHead>
                                <TableHead className="text-center font-semibold">Exercises</TableHead>
                                <TableHead className="text-center font-semibold">Correct</TableHead>
                                <TableHead className="text-center font-semibold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayedData.map((entry, idx) => {
                                const difficultyInfo = getDifficultyLabel(entry.avg_difficulty);
                                const correctRate = entry.exercise_attempts > 0
                                    ? Math.round((entry.correct_answers / entry.exercise_attempts) * 100)
                                    : 0;

                                return (
                                    <TableRow key={entry.student_id} className="hover:bg-gray-50/80 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {entry.student.first_name} {entry.student.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {entry.badges[0] && <span>{entry.badges[0]}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-eliza-purple">
                                            {entry.total_xp.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-semibold">{entry.streak_days}</span>
                                                <span className="text-xs text-gray-500">days</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={cn("font-semibold", difficultyInfo.color)}>
                                                    {entry.avg_difficulty.toFixed(1)}
                                                </span>
                                                <span className={cn("text-xs", difficultyInfo.color)}>
                                                    {difficultyInfo.label}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {entry.interactions_count}
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {entry.exercise_attempts}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-semibold">{entry.correct_answers}</span>
                                                <span className="text-xs text-gray-500">({correctRate}%)</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={cn("gap-1", getStatusColor(entry.status_flag))}>
                                                {getStatusIcon(entry.status_flag)}
                                                {entry.status_flag}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between p-4 border-t bg-gray-50/50">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(endIndex, leaderboardData.length)} of {leaderboardData.length} students
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "w-8 h-8 p-0",
                                        currentPage === page && "bg-eliza-purple hover:bg-eliza-purple/90"
                                    )}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="gap-1"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
