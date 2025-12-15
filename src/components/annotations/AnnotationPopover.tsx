import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAnnotationManager } from './AnnotationManager';
import { MessageSquare, StickyNote, X, Send } from 'lucide-react';
import { AnnotationType } from '@/types/annotations';

interface AnnotationPopoverProps {
    children: React.ReactNode;
    anchorText: string;
    startOffset: number;
    endOffset: number;
    sectionId: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AnnotationPopover({ children, anchorText, startOffset, endOffset, sectionId, open, onOpenChange }: AnnotationPopoverProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

    const [type, setType] = useState<AnnotationType>('note');
    const [body, setBody] = useState('');
    const { createAnnotation } = useAnnotationManager();

    const handleSubmit = async () => {
        if (!body.trim()) return;

        await createAnnotation({
            annotation_type: type,
            body,
            start_offset: startOffset,
            end_offset: endOffset,
            anchor_text: anchorText
        });

        setBody('');
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <span className="cursor-text selection:bg-eliza-purple/20">
                    {children}
                </span>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden" align="start" sideOffset={10}>
                <div className="bg-gray-50 border-b p-3 flex items-center justify-between">
                    <div className="flex gap-1 bg-gray-200/50 p-1 rounded-lg">
                        <button
                            onClick={() => setType('note')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${type === 'note' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <StickyNote className="w-3 h-3 inline mr-1" /> Note
                        </button>
                        <button
                            onClick={() => setType('question')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${type === 'question' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <MessageSquare className="w-3 h-3 inline mr-1" /> Question
                        </button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                        <X className="w-3 h-3" />
                    </Button>
                </div>

                <div className="p-4">
                    <div className="mb-3 pl-2 border-l-2 border-eliza-purple/30">
                        <p className="text-xs text-gray-500 italic line-clamp-2">"{anchorText}"</p>
                    </div>

                    <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={type === 'question' ? "Ask a question..." : "Add a note..."}
                        className="min-h-[100px] mb-3 resize-none text-sm"
                        autoFocus
                    />

                    <div className="flex justify-end">
                        <Button size="sm" onClick={handleSubmit} className="bg-eliza-purple hover:bg-eliza-purple/90 text-white">
                            <Send className="w-3 h-3 mr-2" /> Save
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
