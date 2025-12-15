// Personalized Section Sidebar Component
// Renders STUDENT_EXTRA sections in a sidebar panel

import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { ContentSection } from '@/types/content-sections';
import { cn } from '@/lib/utils';
import { User, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PersonalizedSectionSidebarProps {
  section: ContentSection;
  className?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

export const PersonalizedSectionSidebar: React.FC<PersonalizedSectionSidebarProps> = ({
  section,
  className,
  onClose,
  isOpen = true,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      className={cn(
        'personalized-sidebar fixed right-0 top-0 h-full w-96 bg-eliza-surface border-l border-eliza-border shadow-2xl z-40 overflow-y-auto',
        'transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        className
      )}
      role="complementary"
      aria-label="Personalized explanation"
    >
      {/* Header */}
      <div className="sticky top-0 bg-eliza-surface border-b border-eliza-border p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-eliza-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-eliza-primary" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-eliza-text-primary">
              Your Notes
            </h4>
            <p className="text-xs text-eliza-text-secondary">
              Personalized for you
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close personalized notes"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Generated badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-eliza-primary/10 rounded-full">
          <Sparkles className="w-3 h-3 text-eliza-primary" />
          <span className="text-xs font-medium text-eliza-primary">
            Generated for you
          </span>
        </div>

        {/* Section title */}
        {section.title && (
          <h3 className="text-xl font-bold text-eliza-text-primary mb-4">
            {section.title}
          </h3>
        )}

        {/* Section body with markdown */}
        <div className="prose prose-sm prose-eliza max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h4 className="text-lg font-semibold mt-4 mb-2 text-eliza-text-primary">
                  {children}
                </h4>
              ),
              h2: ({ children }) => (
                <h5 className="text-base font-semibold mt-3 mb-2 text-eliza-text-primary">
                  {children}
                </h5>
              ),
              h3: ({ children }) => (
                <h6 className="text-sm font-semibold mt-2 mb-1 text-eliza-text-primary">
                  {children}
                </h6>
              ),
              p: ({ children }) => (
                <p className="text-sm text-eliza-text-primary mb-3 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-3 space-y-1 text-eliza-text-primary">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-3 space-y-1 text-eliza-text-primary">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-eliza-text-primary ml-4">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-eliza-primary pl-3 italic my-3 text-eliza-text-secondary text-sm">
                  {children}
                </blockquote>
              ),
              code: ({ inline, children }) =>
                inline ? (
                  <code className="bg-eliza-background px-1.5 py-0.5 rounded text-xs font-mono text-eliza-primary">
                    {children}
                  </code>
                ) : (
                  <code className="block bg-eliza-background p-3 rounded-lg text-xs font-mono overflow-x-auto my-3">
                    {children}
                  </code>
                ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-eliza-primary hover:text-eliza-primary-hover underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-eliza-text-primary">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-eliza-text-primary">
                  {children}
                </em>
              ),
            }}
          >
            {section.body}
          </ReactMarkdown>
        </div>

        {/* Link to base section */}
        {section.base_section_id && (
          <div className="mt-6 pt-4 border-t border-eliza-border">
            <p className="text-xs text-eliza-text-secondary">
              This explanation relates to the main lesson content above.
            </p>
          </div>
        )}

        {/* Generation metadata */}
        {section.created_at && (
          <div className="mt-4 text-xs text-eliza-text-secondary">
            Generated {new Date(section.created_at).toLocaleDateString()} at{' '}
            {new Date(section.created_at).toLocaleTimeString()}
          </div>
        )}
      </div>
    </aside>
  );
};

// Standalone version for inline display (not sidebar)
export const PersonalizedSectionInline: React.FC<{
  section: ContentSection;
  className?: string;
}> = ({ section, className }) => {
  return (
    <div
      className={cn(
        'personalized-section-inline p-6 bg-eliza-primary/5 border-l-4 border-eliza-primary rounded-lg',
        className
      )}
      role="region"
      aria-label="Personalized explanation"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-eliza-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-eliza-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-eliza-text-primary">
              Your Personalized Note
            </h4>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-eliza-primary/10 rounded-full">
              <Sparkles className="w-3 h-3 text-eliza-primary" />
              <span className="text-xs font-medium text-eliza-primary">
                Generated for you
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      {section.title && (
        <h3 className="text-lg font-bold text-eliza-text-primary mb-3">
          {section.title}
        </h3>
      )}

      <div className="prose prose-sm prose-eliza max-w-none">
        <ReactMarkdown>{section.body}</ReactMarkdown>
      </div>
    </div>
  );
};
