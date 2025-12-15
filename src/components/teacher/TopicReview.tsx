import React, { useState } from "react";
import { Chapter } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, Trash2, Check, X, BookOpen, Settings, Save, Sparkles, Loader2 } from "lucide-react";

interface TopicReviewProps {
    topics: Chapter[];
    onUpdateTopic: (id: string, newTitle: string, newDescription?: string, is_published?: boolean) => Promise<void>;
    onDeleteTopic: (id: string) => Promise<void>;
    onUpdateSubchapter?: (id: string) => Promise<void>; // Handler from parent that likely manages state
    onDeleteSubchapter?: (id: string) => Promise<void>;
    // IMPORTANT: The parent `TeacherSyllabus` handles `editingTitle` state for subchapters globally.
    // However, `TopicReview` might need its own local state OR we need to pass down setEditingSubchapterId etc.
    // To simplify, let's treat TopicReview as a "dumb" list or allow it to manage "edit mode" locally if possible,
    // BUT `TeacherSyllabus` has complex logic for saveSubchapterTitle (it uses `editingTitle` state).
    // A better approach for `TopicReview` is to allow local editing state and call `onUpdateSubchapter(id, newTitle)`.
    // Let's adjust the interface to be self-contained for editing if possible, OR just trigger the parent's modal/edit flow.
}

// Adjusted interface to match what we actually need for self-contained editing or cleaner prop passing
interface BetterTopicReviewProps {
    topics: Chapter[];
    onUpdateTopic: (id: string, newTitle: string, newDescription?: string, is_published?: boolean) => Promise<void>;
    onDeleteTopic: (id: string) => Promise<void>;
    // We will assume parent passes a generic update function: (id, title) => Promise
    onUpdateSubchapter: (id: string, title: string) => Promise<void>;
    onDeleteSubchapter: (id: string) => Promise<void>;
    mode?: "review" | "generate";
    onGenerateBlog?: (subchapterId: string) => Promise<void>;
    onGenerateQuiz?: (subchapterId: string) => Promise<void>;
    onOpenBlog?: (subchapterId: string) => void;
    onOpenQuiz?: (subchapterId: string) => void;
    generatingSubchapterIds?: Set<string>;
}

export const TopicReview: React.FC<BetterTopicReviewProps> = ({
    topics,
    onUpdateTopic,
    onDeleteTopic,
    onUpdateSubchapter,
    onDeleteSubchapter,
    mode = "review",
    onGenerateBlog,
    onGenerateQuiz,
    onOpenBlog,
    onOpenQuiz,
    generatingSubchapterIds
}) => {
    // Helper functions for loading state
    const isGeneratingBlog = (id: string) => generatingSubchapterIds?.has(`blog-${id}`);
    const isGeneratingQuiz = (id: string) => generatingSubchapterIds?.has(`quiz-${id}`);

    // Topic Editing State
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
    const [topicTitle, setTopicTitle] = useState("");
    const [topicDesc, setTopicDesc] = useState("");

    // Subchapter Editing State
    const [editingSubId, setEditingSubId] = useState<string | null>(null);
    const [subTitle, setSubTitle] = useState("");


    const startEditingTopic = (topic: Chapter) => {
        setEditingTopicId(topic.id);
        setTopicTitle(topic.title);
        setTopicDesc(topic.description || "");
        setEditingSubId(null); // Close other edits
    };

    const saveTopic = async () => {
        if (editingTopicId && topicTitle.trim()) {
            await onUpdateTopic(editingTopicId, topicTitle, topicDesc);
            setEditingTopicId(null);
        }
    };

    const startEditingSub = (sub: any) => {
        setEditingSubId(sub.id);
        setSubTitle(sub.title);
        setEditingTopicId(null); // Close other edits
    };

    const saveSub = async () => {
        if (editingSubId && subTitle.trim()) {
            // We need a way to pass the new title.
            // The parent `saveSubchapterTitle` in `TeacherSyllabus` uses `editingTitle` state. 
            // BUT here we are passing a direct handler. 
            // We need to make sure `TeacherSyllabus`'s `saveSubchapterTitle` is COMPATIBLE or we wrap it.
            // Actually, `TeacherSyllabus` doesn't expose a (id, title) updater easily without setting state.
            // So we might need to change `TeacherSyllabus` to accept the handler usage OR update `TopicReview` to use the passed prop correctly.
            // Let's assume passed prop is `(id, title) => Promise<void>`.
            await onUpdateSubchapter(editingSubId, subTitle);
            setEditingSubId(null);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {topics.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-brand">
                        No topics found. Upload a PDF to automatically extract topics.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {topics.map((topic, index) => {
                        return (
                            <Card key={topic.id} className="border-l-4 border-l-eliza-purple border-y border-r border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-full bg-eliza-purple/10 text-eliza-purple flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1">
                                        {editingTopicId === topic.id ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={topicTitle}
                                                        onChange={(e) => setTopicTitle(e.target.value)}
                                                        className="h-9 font-brand font-bold"
                                                        placeholder="Topic Title"
                                                        autoFocus
                                                    />
                                                    <Button size="sm" variant="ghost" onClick={saveTopic} className="text-green-600 h-8 w-8 p-0 shrink-0">
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingTopicId(null)} className="text-gray-400 h-8 w-8 p-0 shrink-0">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    value={topicDesc}
                                                    onChange={(e) => setTopicDesc(e.target.value)}
                                                    className="text-sm font-sans"
                                                    placeholder="Topic Description"
                                                    rows={3}
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="font-bold text-gray-900 font-brand flex items-center gap-2 group">
                                                    {topic.title}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => startEditingTopic(topic)}
                                                            className="h-6 w-6 p-0 text-gray-400 hover:text-eliza-blue"
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </h3>
                                                {topic.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                                                )}

                                                {/* Display Generated Subchapters/Lessons */}
                                                {topic.subchapters && topic.subchapters.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Lessons Generated:</h4>
                                                        <div className="grid gap-2">
                                                            {topic.subchapters.map((sub, i) => (
                                                                <div key={sub.id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded border border-gray-100 hover:bg-white hover:border-eliza-blue/50 transition-colors group/lesson">
                                                                    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] text-gray-500 shrink-0">
                                                                        {i + 1}
                                                                    </span>

                                                                    {editingSubId === sub.id ? (
                                                                        <div className="flex-1 flex items-center gap-2">
                                                                            <Input
                                                                                value={subTitle}
                                                                                onChange={(e) => setSubTitle(e.target.value)}
                                                                                className="h-7 text-sm py-0 px-2"
                                                                                autoFocus
                                                                                onKeyDown={(e) => e.key === 'Enter' && saveSub()}
                                                                            />
                                                                            <Button size="sm" variant="ghost" onClick={saveSub} className="text-green-600 h-6 w-6 p-0 shrink-0"><Check className="h-3 w-3" /></Button>
                                                                            <Button size="sm" variant="ghost" onClick={() => setEditingSubId(null)} className="text-gray-400 h-6 w-6 p-0 shrink-0"><X className="h-3 w-3" /></Button>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-gray-700 flex-1">{sub.title}</span>

                                                                            {mode === "generate" ? (
                                                                                <div className="flex items-center gap-2 animate-fade-in">
                                                                                    {sub.has_blog ? (
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            onClick={() => onOpenBlog?.(sub.id)}
                                                                                            className="h-6 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                                                        >
                                                                                            <Check className="w-3 h-3 mr-1" /> Blog Ready
                                                                                        </Button>
                                                                                    ) : (
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            onClick={() => onGenerateBlog?.(sub.id)}
                                                                                            disabled={isGeneratingBlog(sub.id)}
                                                                                            className="h-6 text-xs border-eliza-blue/30 text-eliza-blue hover:bg-eliza-blue/10"
                                                                                        >
                                                                                            {isGeneratingBlog(sub.id) ? (
                                                                                                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
                                                                                            ) : (
                                                                                                <><BookOpen className="w-3 h-3 mr-1" /> Generate Blog</>
                                                                                            )}
                                                                                        </Button>
                                                                                    )}

                                                                                    {sub.has_quiz ? (
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            onClick={() => onOpenQuiz?.(sub.id)}
                                                                                            className="h-6 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                                                        >
                                                                                            <Check className="w-3 h-3 mr-1" /> Quiz Ready
                                                                                        </Button>
                                                                                    ) : (
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            onClick={() => onGenerateQuiz?.(sub.id)}
                                                                                            disabled={isGeneratingQuiz(sub.id)}
                                                                                            className="h-6 text-xs border-orange-200 text-orange-600 hover:bg-orange-50"
                                                                                        >
                                                                                            {isGeneratingQuiz(sub.id) ? (
                                                                                                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
                                                                                            ) : (
                                                                                                <><Sparkles className="w-3 h-3 mr-1" /> Generate Quiz</>
                                                                                            )}
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                                                                    <Button variant="ghost" size="sm" onClick={() => startEditingSub(sub)} className="h-6 w-6 p-0 text-gray-400 hover:text-eliza-blue">
                                                                                        <Edit2 className="h-3 w-3" />
                                                                                    </Button>
                                                                                    <Button variant="ghost" size="sm" onClick={() => onDeleteSubchapter(sub.id)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                                                                                        <Trash2 className="h-3 w-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {editingTopicId !== topic.id && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                                                onClick={() => onDeleteTopic(topic.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

