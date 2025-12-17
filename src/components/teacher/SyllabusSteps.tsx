import React from "react";
import { Check, Upload, List, BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SyllabusStepsProps {
    currentStep: number;
    onStepClick?: (step: number) => void;
    maxCompletedStep?: number;
}

const steps = [
    {
        id: 1,
        label: "Upload Materials",
        icon: Upload,
        description: "Upload PDFs",
    },
    {
        id: 2,
        label: "Review Topics",
        icon: List,
        description: "Customize structure",
    },
    {
        id: 3,
        label: "Generate Content",
        icon: BookOpen,
        description: "Create lessons",
    },
    {
        id: 4,
        label: "Add Students",
        icon: Users,
        description: "Invite students",
    },
    {
        id: 5,
        label: "Publish",
        icon: Check,
        description: "Review & Publish",
    },
];

export const SyllabusSteps: React.FC<SyllabusStepsProps> = ({
    currentStep,
    onStepClick,
    maxCompletedStep = 0
}) => {
    return (
        <div className="w-full bg-white rounded-2xl border border-gray-100 px-10 py-8 pb-14 mb-8 shadow-sm">
            <div className="relative flex items-center justify-between">
                {/* Connection Lines */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-eliza-purple -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    // Only allow clicking if we've reached this step previously or it's the next logical step
                    const isClickable = onStepClick && step.id <= maxCompletedStep + 1;

                    const isFirst = index === 0;
                    const isLast = index === steps.length - 1;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "relative z-10 flex flex-col items-center gap-2 group",
                                isClickable ? "cursor-pointer" : "cursor-default opacity-80"
                            )}
                            onClick={() => isClickable && onStepClick?.(step.id)}
                        >
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm bg-white",
                                    isCompleted
                                        ? "bg-eliza-purple border-eliza-purple text-white scale-100"
                                        : isCurrent
                                            ? "bg-white border-eliza-purple text-eliza-purple scale-110 shadow-md shadow-eliza-purple/20"
                                            : "bg-white border-gray-200 text-gray-300"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    <step.icon className="w-5 h-5" />
                                )}
                            </div>
                            <div className={cn(
                                "absolute top-16 min-w-[120px]",
                                isFirst ? "left-0 text-left" :
                                    isLast ? "right-0 text-right" :
                                        "left-1/2 -translate-x-1/2 text-center"
                            )}>
                                <p
                                    className={cn(
                                        "text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
                                        isCurrent ? "text-eliza-purple" : isCompleted ? "text-gray-900" : "text-gray-400"
                                    )}
                                >
                                    {step.label}
                                </p>
                                {isCurrent && (
                                    <p className="text-[10px] text-gray-500 font-medium animate-fade-in mt-0.5">
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
