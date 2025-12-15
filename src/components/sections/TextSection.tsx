import type React from "react"
import { useState, useRef, useMemo, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from 'rehype-raw'
import { AnnotationProvider, useAnnotationManager } from "@/components/annotations/AnnotationManager"
import { AnnotationDrawer } from "@/components/annotations/AnnotationDrawer"
import { AnnotationPopover } from "@/components/annotations/AnnotationPopover"
import { injectHighlights, findSelectionOffset } from "@/lib/annotation-utils"
import type { ContentSection } from "@/types/content-sections"
import { TextToSpeech } from "@/components/TextToSpeech"
import { getContentTypeLabel } from "@/lib/accessibility"
import { cn } from "@/lib/utils"
import { Sparkles, Lightbulb, CheckCircle2, FileText } from "lucide-react"

interface TextSectionProps {
  section: ContentSection
  className?: string
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
const TextSectionContent: React.FC<TextSectionProps> = ({ section, className }) => {
  const { annotations } = useAnnotationManager();
  const [selection, setSelection] = useState<{
    text: string;
    startOffset: number;
    endOffset: number;
    rect: DOMRect;
  } | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

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
      console.warn("Could not find selection in source text");
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
      rehypePlugins={[rehypeRaw]}
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
      {/* Badge */}
      <div className="flex items-center justify-between mb-6">
        {/* ... badge content ... */}
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
        <TextToSpeech text={`${section.title}. ${section.body}`} title={section.title} />
      </div>

      {/* Section title */}
      {section.title && (
        <h3
          id={`section-title-${section.id}`}
          className="text-3xl md:text-4xl font-brand font-bold mb-6 text-gray-900 leading-tight"
        >
          {section.title}
        </h3>
      )}

      {/* Section body with enhanced markdown styling */}
      <div
        ref={containerRef}
        className="prose prose-lg max-w-none relative"
        onMouseUp={handleMouseUp}
      >
        {markdownContent}

        {selection && (
          <div
            style={{
              position: 'fixed',
              top: selection.rect.bottom + 5,
              left: selection.rect.right - 80,
              zIndex: 50
            }}
            className="animate-in fade-in zoom-in duration-200"
            data-annotation-trigger
          >
            <AnnotationPopover
              anchorText={selection.text}
              startOffset={selection.startOffset}
              endOffset={selection.endOffset}
              sectionId={section.id}
              open={isPopoverOpen}
              onOpenChange={(open) => {
                setIsPopoverOpen(open);
                if (!open) {
                  setSelection(null);
                }
              }}
            >
              <button
                className="bg-eliza-purple text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg hover:bg-eliza-purple/90 transition-colors flex items-center gap-1"
                onClick={handleAnnotateClick}
                onMouseDown={(e) => e.preventDefault()}
                onMouseUp={(e) => e.stopPropagation()}
              >
                <span>Annotate</span>
              </button>
            </AnnotationPopover>
          </div>
        )}
      </div>

      <AnnotationDrawer />
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
