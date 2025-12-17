import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MessageSquare, TrendingDown } from "lucide-react";
import { getCommonErrors, getCommonPrompts, CommonError, CommonPrompt } from "@/lib/mock-gamification";
import { Progress } from "@/components/ui/progress";

interface ActionableInsightsProps {
    classId?: string;
}

export function ActionableInsights({ classId }: ActionableInsightsProps) {
    const commonErrors = getCommonErrors(classId);
    const commonPrompts = getCommonPrompts(classId);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Common Errors */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Most Common Errors
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Exercises where students struggle the most
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {commonErrors.length > 0 ? (
                        commonErrors.map((error, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Chapter {error.chapter} - {error.exercise}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">
                                            {error.errorCount}/{error.totalAttempts} errors
                                        </span>
                                        <span className="text-sm font-bold text-red-600">
                                            {Math.round(error.errorRate * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={error.errorRate * 100}
                                    className="h-2 bg-gray-100"
                                    indicatorClassName="bg-red-500"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No significant error patterns detected</p>
                            <p className="text-xs mt-1">Students are performing well!</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Common Prompts */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        Most Common Questions
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Concepts students ask about frequently
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {commonPrompts.length > 0 ? (
                        commonPrompts.map((prompt, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-700">
                                            {prompt.concept}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            Related: {prompt.relatedChapters.map(ch => `Chapter ${ch}`).join(', ')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-blue-600">
                                            {prompt.count} asks
                                        </span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(100, (prompt.count / Math.max(...commonPrompts.map(p => p.count))) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No interaction data yet</p>
                            <p className="text-xs mt-1">Students haven't asked questions yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
