import React, { useState, useRef, useMemo, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from 'rehype-raw'
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { AnnotationProvider, useAnnotationManager } from "@/components/annotations/AnnotationManager"
import { AnnotationDrawer } from "@/components/annotations/AnnotationDrawer"
import { AnnotationPopover } from "@/components/annotations/AnnotationPopover"
import { injectHighlights, findSelectionOffset } from "@/lib/annotation-utils"
import type { ContentSection } from "@/types/content-sections"
import { TextToSpeech } from "@/components/TextToSpeech"
import { getContentTypeLabel } from "@/lib/accessibility"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Pencil, Wand2, Save, X, Sparkles, Lightbulb, CheckCircle2, FileText } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface TextSectionProps {
  section: ContentSection
  className?: string
  // Optional callback if parent needs to refresh (though mock api updates local state usually)
  onUpdate?: () => void
}

// Internal component for rendering highlights
const AnnotationHighlight = ({ children, ...props }: any) => {
  const { setActiveAnnotationId, setDrawerOpen } = useAnnotationManager();
  const annotationId = props['data-annotation-id'];

  return (
    <mark
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        if (annotationId) {
          setActiveAnnotationId(annotationId);
          setDrawerOpen(true);
        }
      }}
    >
      {children}
    </mark>
  );
};

// Internal component that consumes the annotation context
const TextSectionContent: React.FC<TextSectionProps> = ({ section, className, onUpdate }) => {
  const { annotations } = useAnnotationManager();
  const { toast } = useToast();

  // Selection/Annotation state
  const [selection, setSelection] = useState<{
    text: string;
    startOffset: number;
    endOffset: number;
    rect: DOMRect;
  } | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(section.body);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Sync edit body when section changes
  useEffect(() => {
    setEditBody(section.body);
  }, [section.body]);

  // Inject highlights into markdown source
  const processedBody = useMemo(() => {
    return injectHighlights(section.body, annotations);
  }, [section.body, annotations]);

  // Close selection UI on scroll or click outside
  useEffect(() => {
    const handleScroll = () => {
      if (selection && !isPopoverOpen) {
        setSelection(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (selection && !isPopoverOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-annotation-trigger]') && !containerRef.current?.contains(target)) {
          setSelection(null);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selection, isPopoverOpen]);

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isEditing) return; // Disable highlighting while editing
    if (isPopoverOpen) return;

    // Ignore clicks inside the popover trigger/content
    if ((e.target as HTMLElement).closest('[data-annotation-trigger]')) {
      return;
    }

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

    // Calculate offset relative to the full section body
    const rangeBefore = range.cloneRange();
    rangeBefore.setStart(container, 0);
    rangeBefore.setEnd(range.startContainer, range.startOffset);
    const textBefore = rangeBefore.toString();

    const startOffset = findSelectionOffset(section.body, text, textBefore, "");

    if (startOffset === -1) {
      // console.warn("Could not find selection in source text");
      return;
    }

    const endOffset = startOffset + text.length;

    // Position
    const rects = range.getClientRects();
    const rect = rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect();

    // Save the range for restoration
    savedRangeRef.current = range.cloneRange();

    setSelection({
      text,
      startOffset,
      endOffset,
      rect
    });
  };

  const handleAnnotateClick = () => {
    // Restore selection before opening popover
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    setIsPopoverOpen(true);
  };

  // --- Editing Handlers ---

  const handleSave = async () => {
    try {
      const updated = await apiClient.updateSectionContent(section.id, editBody);
      section.body = updated.body; // Optimistic update since section prop might not refresh immediately depending on parent
      setIsEditing(false);
      toast({
        title: "Changes saved",
        description: "The section content has been updated.",
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: "Error saving",
        description: "Failed to update content.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditBody(section.body);
    setIsEditing(false);
  };

  const handleAiEdit = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      // Mock AI call
      console.log("🚀 Sending AI Edit request...");
      const newText = await apiClient.aiEditSection(section.id, aiPrompt, editBody);
      console.log("✅ Received AI Edit response:", newText);
      setEditBody(newText);
      setIsAiDialogOpen(false);
      setAiPrompt("");
      toast({
        title: "AI Update Applied",
        description: `Content updated. Start: "${newText.substring(0, 50)}..."`,
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to generate changes.",
        variant: "destructive"
      });
    } finally {
      setIsAiGenerating(false);
    }
  };


  // Get styling based on content type with modern, playful design
  const getSectionConfig = () => {
    switch (section.content_type) {
      case "INTRO":
        return {
          gradient: "from-blue-50 to-indigo-50",
          borderColor: "border-eliza-blue",
          iconBg: "bg-eliza-blue/10",
          icon: <Sparkles className="w-6 h-6 text-eliza-blue" />,
          badge: "Introduction",
          badgeColor: "bg-eliza-blue text-white",
        }
      case "CONCEPT":
        return {
          gradient: "from-purple-50 to-pink-50",
          borderColor: "border-eliza-purple",
          iconBg: "bg-eliza-purple/10",
          icon: <Lightbulb className="w-6 h-6 text-eliza-purple" />,
          badge: "Key Concept",
          badgeColor: "bg-eliza-purple text-white",
        }
      case "SUMMARY":
        return {
          gradient: "from-green-50 to-emerald-50",
          borderColor: "border-eliza-green",
          iconBg: "bg-eliza-green/10",
          icon: <CheckCircle2 className="w-6 h-6 text-eliza-green" />,
          badge: "Summary",
          badgeColor: "bg-eliza-green text-white",
        }
      default:
        return {
          gradient: "from-gray-50 to-slate-50",
          borderColor: "border-gray-200",
          iconBg: "bg-gray-100",
          icon: <FileText className="w-6 h-6 text-gray-600" />,
          badge: "Content",
          badgeColor: "bg-gray-600 text-white",
        }
    }
  }

  const config = getSectionConfig()

  // Memoize components to prevent re-renders
  const markdownComponents = useMemo(() => ({
    h1: ({ children }: any) => <h4 className="text-2xl font-brand font-bold mt-8 mb-4 text-gray-900">{children}</h4>,
    h2: ({ children }: any) => <h5 className="text-xl font-brand font-bold mt-6 mb-3 text-gray-900">{children}</h5>,
    h3: ({ children }: any) => (
      <h6 className="text-lg font-brand font-semibold mt-4 mb-2 text-gray-900">{children}</h6>
    ),
    mark: AnnotationHighlight,
    p: ({ children }: any) => (
      <p className="text-lg text-gray-700 mb-4 leading-relaxed font-sans transition-colors hover:bg-gray-50/50 rounded-lg -mx-2 px-2">
        {children}
      </p>
    ),
    ul: ({ children }: any) => <ul className="space-y-3 mb-6 ml-6">{children}</ul>,
    ol: ({ children }: any) => <ol className="space-y-3 mb-6 ml-6">{children}</ol>,
    li: ({ children }: any) => (
      <li className="text-lg text-gray-700 leading-relaxed flex items-start gap-3">
        <span className="inline-block w-2 h-2 rounded-full bg-current mt-2.5 flex-shrink-0" />
        <span className="flex-1">{children}</span>
      </li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-current pl-6 py-2 my-6 italic text-gray-600 bg-white/50 rounded-r-xl">
        {children}
      </blockquote>
    ),
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "")
      const isInline = !match && !String(children).includes("\n")
      return isInline ? (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>
          {children}
        </code>
      ) : (
        <code className="block bg-gray-900 text-gray-100 p-4 rounded-xl text-sm font-mono overflow-x-auto my-4" {...props}>
          {children}
        </code>
      )
    },
    a: ({ href, children }: any) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 font-semibold transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }: any) => (
      <strong className="font-bold text-gray-900 bg-yellow-100 px-1 rounded">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic text-gray-700">{children}</em>,
  }), []);

  // Memoize the markdown content to prevent re-renders when popover opens
  const markdownContent = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={markdownComponents}
    >
      {processedBody}
    </ReactMarkdown>
  ), [processedBody, markdownComponents]);

  return (
    <section
      className={cn(
        "text-section group relative",
        "mb-12",
        "animate-fade-in",
        className,
      )}
      role="region"
      aria-label={`${getContentTypeLabel(section.content_type)}: ${section.title}`}
      aria-labelledby={`section-title-${section.id}`}
    >
      {/* Badge & Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase",
              config.badgeColor.replace("text-white", "").replace("bg-", "text-").replace("shadow-lg", ""),
              "bg-opacity-10 bg-gray-100" // Fallback or override
            )}
            style={{
              backgroundColor: config.badgeColor.includes("eliza-blue") ? "rgba(var(--eliza-blue), 0.1)" : undefined
            }}
          >
            {config.icon}
            {config.badge}
          </span>

          {/* Edit Controls */}
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-7 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="w-3 h-3 mr-1.5" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-7 text-xs text-gray-500 hover:text-gray-900"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-7 text-xs bg-gray-900 text-white hover:bg-gray-800"
              >
                <Save className="w-3 h-3 mr-1.5" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAiDialogOpen(true)}
                className="h-7 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Wand2 className="w-3 h-3 mr-1.5" />
                AI Edit
              </Button>
            </div>
          )}
        </div>
        <TextToSpeech text={`${section.title}. ${section.body}`} title={section.title} />
      </div>

      {/* Editor or Content */}
      {isEditing ? (
        <div className="mb-6 animate-in slide-in-from-top-2">
          {section.title && (
            <h3 className="text-3xl md:text-4xl font-brand font-bold mb-6 text-gray-900 leading-tight opacity-50">
              {section.title}
            </h3>
          )}
          <Textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="min-h-[300px] font-mono text-base p-6 leading-relaxed resize-y bg-white border-gray-200 focus:border-eliza-blue focus:ring-eliza-blue"
            placeholder="Write your content in markdown..."
          />
          <p className="text-xs text-gray-400 mt-2 text-right">Markdown supported</p>
        </div>
      ) : (
        <>
          {/* Section title */}
          {section.title && (
            <h3
              id={`section-title-${section.id}`}
              className="text-3xl md:text-4xl font-brand font-bold mb-6 text-gray-900 leading-tight"
            >
              {section.title}
            </h3>
          )}

          <div
            ref={containerRef}
            onMouseUp={handleMouseUp}
            className="prose prose-lg max-w-none prose-headings:font-brand prose-headings:font-bold prose-p:text-gray-600 prose-li:text-gray-600 prose-img:rounded-xl relative"
          >
            {markdownContent}

            {/* Internal Annotation Components */}
            {selection && (
              <AnnotationDrawer
                selection={selection}
                onClose={() => setSelection(null)}
                onAnnotate={handleAnnotateClick}
              />
            )}

            <AnnotationPopover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
              selection={selection}
              onAnnotationCreate={() => {
                setSelection(null);
                setIsPopoverOpen(false);
              }}
            />
          </div>
        </>
      )}

      {/* AI Edit Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              AI Content Assistant
            </DialogTitle>
            <DialogDescription>
              Describe how you want to change the text.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g. 'Make it more concise', 'Add an example about apples'..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiEdit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAiEdit}
              disabled={isAiGenerating || !aiPrompt.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isAiGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generatiing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export const TextSection: React.FC<TextSectionProps> = (props) => {
  return (
    <AnnotationProvider sectionId={props.section.id}>
      <TextSectionContent {...props} />
    </AnnotationProvider>
  );
};
