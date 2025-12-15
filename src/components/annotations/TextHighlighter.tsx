import React, { useRef, useEffect, useState } from 'react';
import { useAnnotationManager } from './AnnotationManager';
import { AnnotationPopover } from './AnnotationPopover';

interface TextHighlighterProps {
    children: React.ReactNode;
    sectionId: string;
    className?: string;
}

export function TextHighlighter({ children, sectionId, className }: TextHighlighterProps) {
    const { annotations, setActiveAnnotationId, setDrawerOpen } = useAnnotationManager();
    const containerRef = useRef<HTMLDivElement>(null);
    const [selection, setSelection] = useState<{
        text: string;
        startOffset: number;
        endOffset: number;
        rect: DOMRect | null;
    } | null>(null);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // Handle text selection
    useEffect(() => {
        const handleSelection = () => {
            if (isPopoverOpen) return; // Don't clear selection if popover is open

            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
                setSelection(null);
                return;
            }

            const range = sel.getRangeAt(0);
            const container = containerRef.current;

            if (!container || !container.contains(range.commonAncestorContainer)) {
                return;
            }

            const text = sel.toString();
            // Simple offset calculation (MVP: assumes plain text content structure)
            // In a real app, this needs robust DOM traversal to map back to source text
            const preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(container);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            const startOffset = preSelectionRange.toString().length;
            const endOffset = startOffset + text.length;

            // Use the last client rect to position near the end of the selection
            const rects = range.getClientRects();
            const rect = rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect();

            setSelection({
                text,
                startOffset,
                endOffset,
                rect
            });
        };

        document.addEventListener('selectionchange', handleSelection);
        return () => document.removeEventListener('selectionchange', handleSelection);
    }, [isPopoverOpen]);

    // Render highlights
    // This is a simplified approach. For production, use a library like 'mark.js' or complex range manipulation.
    // Here we just render the children as is, but in a real implementation we would
    // need to split the text nodes based on annotation offsets.
    // For this MVP, we will overlay highlights using absolute positioning if possible,
    // or just rely on the Popover for creation for now.

    // Actually, to make highlights visible, we need to wrap the text.
    // Since `children` is likely a string from ReactMarkdown, we can try to highlight it.

    const renderHighlightedText = () => {
        if (typeof children !== 'string') return children;

        if (annotations.length === 0) return children;

        // Sort annotations by start offset
        const sortedAnnotations = [...annotations].sort((a, b) => a.anchor.start_offset - b.anchor.start_offset);

        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        sortedAnnotations.forEach(annotation => {
            if (annotation.anchor.start_offset < lastIndex) return; // Skip overlapping for MVP

            // Text before annotation
            if (annotation.anchor.start_offset > lastIndex) {
                elements.push(children.slice(lastIndex, annotation.anchor.start_offset));
            }

            // Annotated text
            elements.push(
                <span
                    key={annotation.id}
                    className={`cursor-pointer transition-colors px-1 rounded ${annotation.type === 'question' ? 'bg-orange-100 hover:bg-orange-200' : 'bg-blue-100 hover:bg-blue-200'
                        }`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveAnnotationId(annotation.id);
                        setDrawerOpen(true);
                    }}
                >
                    {children.slice(annotation.anchor.start_offset, annotation.anchor.end_offset)}
                </span>
            );

            lastIndex = annotation.anchor.end_offset;
        });

        // Remaining text
        if (lastIndex < children.length) {
            elements.push(children.slice(lastIndex));
        }

        return elements;
    };

    return (
        <div ref={containerRef} className={`relative transition-colors hover:bg-gray-50/50 rounded-lg -mx-2 px-2 ${className}`}>
            {renderHighlightedText()}

            {selection && (
                <div
                    style={{
                        position: 'fixed',
                        top: selection.rect ? selection.rect.bottom + 5 : 0, // Position below the text
                        left: selection.rect ? selection.rect.right - 80 : 0, // Align near end
                        zIndex: 50
                    }}
                    className="animate-in fade-in zoom-in duration-200"
                >
                    <AnnotationPopover
                        anchorText={selection.text}
                        startOffset={selection.startOffset}
                        endOffset={selection.endOffset}
                        sectionId={sectionId}
                        open={isPopoverOpen}
                        onOpenChange={(open) => {
                            setIsPopoverOpen(open);
                            if (!open) {
                                window.getSelection()?.removeAllRanges();
                                setSelection(null);
                            }
                        }}
                    >
                        <button
                            className="bg-eliza-purple text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg hover:bg-eliza-purple/90 transition-colors flex items-center gap-1"
                            onClick={() => setIsPopoverOpen(true)}
                        >
                            <span>Annotate</span>
                        </button>
                    </AnnotationPopover>
                </div>
            )}
        </div>
    );
}
