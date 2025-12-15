import React from 'react';
import { useAnnotationManager } from './AnnotationManager';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, StickyNote, X, Sparkles, Bot, User, GraduationCap } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function AnnotationDrawer() {
    const { annotations, isDrawerOpen, setDrawerOpen, activeAnnotationId, deleteAnnotation, createAnswer, isLoading } = useAnnotationManager();

    const handleAskAI = async (annotationId: string) => {
        await createAnswer(annotationId, { responder_type: 'ai' });
    };

    const getResponderIcon = (type: 'ai' | 'teacher' | 'student') => {
        switch (type) {
            case 'ai': return <Bot className="w-3 h-3" />;
            case 'teacher': return <GraduationCap className="w-3 h-3" />;
            case 'student': return <User className="w-3 h-3" />;
        }
    };

    return (
        <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="font-brand text-2xl">Annotations</SheetTitle>
                    <SheetDescription>
                        Notes and questions for this section.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {annotations.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <p>No annotations yet.</p>
                                <p className="text-sm">Select text to add a note or question.</p>
                            </div>
                        ) : (
                            annotations.map(annotation => (
                                <div
                                    key={annotation.id}
                                    className={`p-4 rounded-xl border-2 transition-all ${activeAnnotationId === annotation.id
                                        ? 'border-eliza-purple bg-eliza-purple/5 shadow-md'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge variant="outline" className={`
                      ${annotation.annotation_type === 'question'
                                                ? 'bg-orange-50 text-orange-600 border-orange-200'
                                                : 'bg-blue-50 text-blue-600 border-blue-200'}
                    `}>
                                            {annotation.annotation_type === 'question' ? (
                                                <><MessageSquare className="w-3 h-3 mr-1" /> Question</>
                                            ) : (
                                                <><StickyNote className="w-3 h-3 mr-1" /> Note</>
                                            )}
                                        </Badge>
                                        <span className="text-xs text-gray-400">
                                            {formatDate(annotation.created_at)}
                                        </span>
                                    </div>

                                    {annotation.anchor_text && (
                                        <blockquote className="border-l-2 border-gray-200 pl-3 mb-3 text-xs text-gray-500 italic line-clamp-2">
                                            "{annotation.anchor_text}"
                                        </blockquote>
                                    )}

                                    <p className="text-sm text-gray-800 mb-4">{annotation.body}</p>

                                    {/* Answers Section */}
                                    {annotation.answers.length > 0 && (
                                        <div className="space-y-3 mb-4 pl-4 border-l-2 border-gray-100">
                                            {annotation.answers.map(answer => (
                                                <div key={answer.id} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {getResponderIcon(answer.responder_type)}
                                                            <span className="ml-1 capitalize">{answer.responder_type}</span>
                                                        </Badge>
                                                        {answer.is_accepted && (
                                                            <Badge variant="default" className="text-xs bg-green-500">
                                                                Accepted
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-gray-400 ml-auto">
                                                            {formatDate(answer.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{answer.body}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                        <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteAnnotation(annotation.id)}>
                                            Delete
                                        </Button>
                                        {annotation.annotation_type === 'question' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-eliza-purple hover:bg-eliza-purple/10"
                                                onClick={() => handleAskAI(annotation.id)}
                                                disabled={isLoading}
                                            >
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                Ask AI
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
