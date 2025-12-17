import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { getClassMasteryStats } from "@/lib/mock-gamification";

interface MasteryHeatmapProps {
    classId?: string;
}

export function MasteryHeatmap({ classId }: MasteryHeatmapProps) {
    const data = getClassMasteryStats(classId);

    const getColor = (score: number) => {
        if (score >= 90) return "bg-green-500";
        if (score >= 75) return "bg-green-400";
        if (score >= 60) return "bg-yellow-400";
        if (score >= 40) return "bg-orange-400";
        return "bg-red-500";
    };

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-800">
                        Topic Mastery
                    </CardTitle>
                    <BrainCircuit className="h-5 w-5 text-eliza-purple" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden relative p-0">
                <div className="absolute inset-0 overflow-y-auto p-6 space-y-4">
                    {data.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-gray-700">{item.topic}</span>
                                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">{item.difficulty}</span>
                            </div>
                            <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor(item.avgScore)}`}
                                    style={{ width: `${item.avgScore}%` }}
                                />
                            </div>
                            <div className="flex justify-end">
                                <span className="text-xs text-gray-500 font-medium">{item.avgScore}% Avg. Score</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
