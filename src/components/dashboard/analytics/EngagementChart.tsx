import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Activity } from "lucide-react";
import { getClassEngagementStats } from "@/lib/mock-gamification";

interface EngagementChartProps {
    classId?: string;
}

export function EngagementChart({ classId }: EngagementChartProps) {
    const data = getClassEngagementStats(classId);

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-800">Time by Activity</CardTitle>
                    <Activity className="h-5 w-5 text-eliza-purple" />
                </div>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}m`}
                            label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: '12px' } }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" fontSize={12} wrapperStyle={{ paddingTop: '10px' }} />

                        <Bar dataKey="reading" name="Reading" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="chatting" name="Chatting" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="testing" name="Testing" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
