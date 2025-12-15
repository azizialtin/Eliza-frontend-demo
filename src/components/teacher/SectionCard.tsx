// Section Card Component
// Individual section card with edit, lock, reorder, and delete actions

import React, { useState } from 'react';
import { useUpdateSection, useDeleteSection } from '@/hooks/useTeacherSections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Edit2,
  Save,
  X,
  Trash2,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Film,
  Image as ImageIcon,
  FileText,
  Lightbulb,
  CheckSquare,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MediaVersionModal } from './MediaVersionModal';
import type { ContentSection } from '@/types/content-sections';

interface SectionCardProps {
  section: ContentSection;
  index: number;
  totalSections: number;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  index,
  totalSections,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [editBody, setEditBody] = useState(section.body);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();

  // Get section type icon and color
  const getSectionTypeConfig = () => {
    switch (section.content_type) {
      case 'VIDEO':
        return { icon: Film, color: 'text-eliza-purple', bg: 'bg-eliza-purple/10' };
      case 'IMAGE':
        return { icon: ImageIcon, color: 'text-eliza-blue', bg: 'bg-eliza-blue/10' };
      case 'INTRO':
        return { icon: FileText, color: 'text-eliza-blue', bg: 'bg-eliza-blue/10' };
      case 'CONCEPT':
        return { icon: Lightbulb, color: 'text-eliza-yellow', bg: 'bg-eliza-yellow/10' };
      case 'PRACTICE':
        return { icon: CheckSquare, color: 'text-eliza-green', bg: 'bg-eliza-green/10' };
      case 'CTA':
        return { icon: MessageSquare, color: 'text-eliza-primary', bg: 'bg-eliza-primary/10' };
      default:
        return { icon: FileText, color: 'text-eliza-text-secondary', bg: 'bg-eliza-surface' };
    }
  };

  const typeConfig = getSectionTypeConfig();
  const TypeIcon = typeConfig.icon;

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      await updateSection.mutateAsync({
        sectionId: section.id,
        updates: {
          title: editTitle,
          body: editBody,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditTitle(section.title);
    setEditBody(section.body);
    setIsEditing(false);
  };

  // Handle toggle lock
  const handleToggleLock = async () => {
    try {
      await updateSection.mutateAsync({
        sectionId: section.id,
        updates: {
          is_locked: !section.is_locked,
        },
      });
    } catch (error) {
      console.error('Failed to toggle lock:', error);
    }
  };

  // Handle reorder
  const handleReorder = async (direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? section.order_index - 1 : section.order_index + 1;
    
    try {
      await updateSection.mutateAsync({
        sectionId: section.id,
        updates: {
          order_index: newIndex,
        },
      });
    } catch (error) {
      console.error('Failed to reorder section:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteSection.mutateAsync(section.id);
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  return (
    <>
      <div
        className={cn(
          'p-4 rounded-lg border-2 transition-all',
          section.is_locked
            ? 'border-eliza-yellow bg-eliza-yellow/5'
            : 'border-eliza-border bg-eliza-surface',
          isEditing && 'ring-2 ring-eliza-primary'
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Type icon */}
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeConfig.bg)}>
            <TypeIcon className={cn('w-5 h-5', typeConfig.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Section title"
                  className="font-semibold"
                />
                <Textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder="Section body"
                  className="min-h-[100px]"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-eliza-text-primary">
                    {section.title || 'Untitled Section'}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {section.content_type}
                  </Badge>
                  {section.is_locked && (
                    <Badge className="text-xs bg-eliza-yellow/20 text-eliza-yellow">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-eliza-text-secondary line-clamp-2">
                  {section.body || 'No content'}
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveEdit}
                  disabled={updateSection.isPending}
                  className="text-eliza-green hover:text-eliza-green"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleToggleLock}
                  disabled={updateSection.isPending}
                  title={section.is_locked ? 'Unlock section' : 'Lock section'}
                >
                  {section.is_locked ? (
                    <Lock className="w-4 h-4 text-eliza-yellow" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReorder('up')}
                  disabled={index === 0 || updateSection.isPending}
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReorder('down')}
                  disabled={index === totalSections - 1 || updateSection.isPending}
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  title="Edit section"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-eliza-red hover:text-eliza-red"
                      title="Delete section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this section. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-eliza-red hover:bg-eliza-red/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {/* Media versions info */}
        {!isEditing && (section.content_type === 'VIDEO' || section.content_type === 'IMAGE') && (
          <div className="mt-3 pt-3 border-t border-eliza-border">
            <div className="flex items-center justify-between">
              <div className="text-xs text-eliza-text-secondary">
                {section.media_versions.length} media version(s)
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMediaModalOpen(true)}
              >
                <Film className="w-3 h-3 mr-2" />
                Manage Media
              </Button>
            </div>
          </div>
        )}

        {/* Provenance info */}
        {!isEditing && (section.source_page_start || section.source_page_end) && (
          <div className="mt-2 text-xs text-eliza-text-secondary">
            Source: Page {section.source_page_start}
            {section.source_page_end && section.source_page_end !== section.source_page_start
              ? `-${section.source_page_end}`
              : ''}
          </div>
        )}
      </div>

      {/* Media Version Modal */}
      {mediaModalOpen && (
        <MediaVersionModal
          section={section}
          onClose={() => setMediaModalOpen(false)}
        />
      )}
    </>
  );
};
