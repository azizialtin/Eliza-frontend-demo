// Lesson Tab Component
// Displays content sections with personalized content support

import React, { useState, useEffect } from 'react';
import { useContentSections, useRequestPersonalizedSection } from '@/hooks/useContentSections';
import type { PersonalizedSectionRequest } from '@/types/content-sections';
import { SectionList, SectionListSkeleton } from '@/components/sections/SectionList';
import { PersonalizedSectionSidebar } from '@/components/sections/PersonalizedSectionSidebar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Sparkles, Wand2, BookOpen, Bot } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { TutorChatWidget } from "@/components/student/TutorChatWidget";

interface LessonTabProps {
  subchapterId: string;
  onPageNavigate?: (pageNumber: number) => void;
  className?: string;
}

export const LessonTab: React.FC<LessonTabProps> = ({
  subchapterId,
  onPageNavigate,
  className,
}) => {
  const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>(null);
  const [helpRequestSection, setHelpRequestSection] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Determine if we should poll:
  // - Poll when we've fetched successfully but got empty array (generation in progress)
  // - Don't poll on initial load or when we have sections
  const [shouldPoll, setShouldPoll] = useState(false);

  // Reset polling state when subchapter changes
  useEffect(() => {
    setShouldPoll(false);
  }, [subchapterId]);

  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Check if we are in a "generating" state
  // Either explicit local state, or polling is active
  const isProcessing = shouldPoll || isGenerating;

  const {
    data: sections,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useContentSections(subchapterId, {
    refetchInterval: shouldPoll ? 5000 : false, // Poll every 5 seconds when needed
  });

  const requestPersonalized = useRequestPersonalizedSection(subchapterId);
  const queryClient = useQueryClient();

  // Update polling state based on sections data
  useEffect(() => {
    if (!isLoading && !error) {
      // If we got a response with empty array, start polling (generation in progress)
      if (sections && sections.length === 0) {
        setShouldPoll(true);
      } else if (sections && sections.length > 0) {
        // Got sections, stop polling
        setShouldPoll(false);
      }
    } else if (error) {
      // Stop polling on error
      setShouldPoll(false);
    }
  }, [sections, isLoading, error]);

  if (isLoading) {
    return (
      <div className={className}>
        <SectionListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load lesson content. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }



  // Handle "Need more help?" button click
  const handleNeedHelp = (sectionId: string) => {
    setHelpRequestSection(sectionId);
    // In a real implementation, this would open a dialog to collect the question
    // For now, we'll just trigger the personalized section generation
    handleRequestPersonalizedSection(sectionId, 'Can you explain this in simpler terms?');
  };

  // Request personalized section
  const handleRequestPersonalizedSection = async (
    baseSectionId: string,
    question: string,
    contextHint?: string
  ) => {
    try {
      await requestPersonalized.mutateAsync({
        base_section_id: baseSectionId,
        question,
        context_hint: contextHint,
      } as PersonalizedSectionRequest);

      // Open the sidebar to show the new personalized section
      setActiveSidebarSection(baseSectionId);
    } catch (error) {
      console.error('Failed to request personalized section:', error);
    } finally {
      setHelpRequestSection(null);
    }
  };

  const handleGenerateBlog = async () => {
    setIsGenerating(true);
    setShouldPoll(true);
    try {
      await refetch();
      toast({
        title: "Generating Lesson",
        description: "We're creating your lesson content. This may take a minute.",
      });
    } catch (error) {
      setIsGenerating(false);
      setShouldPoll(false);
      toast({
        title: "Error",
        description: "Failed to start generation",
        variant: "destructive"
      });
    }
  };

  // Get personalized sections for the active base section
  const personalizedSections = sections?.filter(
    s => s.content_type === 'STUDENT_EXTRA' && s.base_section_id === activeSidebarSection
  ) || [];

  // Empty state handling
  if (sections && sections.length === 0) {
    if (isProcessing) {
      return (
        <div className={className}>
          <div className="max-w-2xl mx-auto">
            {/* Animated generating state (existing code) */}
            <div className="text-center py-16 px-6">
              {/* ... existing loading animation ... */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 animate-ping">
                  <div className="w-24 h-24 rounded-full bg-eliza-purple/20" />
                </div>
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-eliza-purple to-eliza-blue flex items-center justify-center shadow-xl">
                  <Wand2 className="h-12 w-12 text-white animate-pulse" />
                </div>
              </div>

              <h3 className="font-brand text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Creating Your Lesson Content
              </h3>
              <p className="font-brand text-lg text-gray-600 mb-6">
                Our AI is generating engaging lesson sections for you...
              </p>
              <div className="mt-8 p-4 bg-eliza-yellow/10 border-2 border-eliza-yellow/30 rounded-2xl">
                <p className="font-brand text-sm text-gray-700">
                  <span className="font-bold">💡 Tip:</span> This usually takes 30-60 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Not processing, just empty

      const { user } = useAuth(); // We need to import useAuth
      const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

      if (!isTeacher) {
        return (
          <div className={className}>
            <div className="max-w-2xl mx-auto text-center py-20 px-6">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Lesson Not Available</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                The content for this lesson hasn't been created yet. Please check back later.
              </p>
            </div>
          </div>
        )
      }

      return (
        <div className={className}>
          <div className="max-w-2xl mx-auto text-center py-20 px-6">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Learn?</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              This lesson hasn't been generated yet. Click below to create a comprehensive guide with text and video.
            </p>
            <Button
              size="lg"
              onClick={handleGenerateBlog}
              className="bg-eliza-blue hover:bg-eliza-blue/90 text-white font-semibold px-8 h-12 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Generate Lesson
            </Button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className={className}>
      {/* Main content area */}
      <div className="lesson-content">
        <SectionList
          sections={sections}
          onNeedHelp={handleNeedHelp}
          onPageNavigate={onPageNavigate}
          showPersonalizedInline={false}
        />
      </div>

      {/* Personalized section sidebar */}
      {activeSidebarSection && personalizedSections.length > 0 && (
        <PersonalizedSectionSidebar
          section={personalizedSections[0]}
          isOpen={true}
          onClose={() => setActiveSidebarSection(null)}
        />
      )}

      {/* Loading indicator for personalized section generation */}
      {requestPersonalized.isPending && (
        <div className="fixed bottom-4 right-4 bg-eliza-surface border border-eliza-border rounded-lg shadow-lg p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-eliza-primary" />
          <div>
            <p className="text-sm font-medium text-eliza-text-primary">
              Generating personalized explanation...
            </p>
            <p className="text-xs text-eliza-text-secondary">
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* Tutor Chat Widget */}
      <div className="fixed bottom-24 right-8 z-50 w-[400px] h-[600px] pointer-events-none">
        <div className="pointer-events-auto h-full">
          <TutorChatWidget
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            currentTopic="Lesson Help"
          />
        </div>
      </div>
      {!isChatOpen && (
        <div className="fixed bottom-8 right-24 z-50">
          <Button
            onClick={() => setIsChatOpen(true)}
            size="lg"
            className="rounded-full shadow-lg bg-eliza-blue hover:bg-eliza-blue/90 text-white h-14 w-14 p-0 flex items-center justify-center animate-bounce-subtle"
          >
            <Bot className="w-8 h-8" />
          </Button>
        </div>
      )}
    </div>
  );
};
