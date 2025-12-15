// Badge Definition Modal - Form for creating/editing badge definitions
// Provides complete badge configuration interface

import { useState, useEffect } from 'react';
import {
  useCreateBadgeDefinition,
  useUpdateBadgeDefinition,
} from '@/hooks/useBadgeDefinitions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CriteriaFieldsBuilder } from './CriteriaFieldsBuilder';
import { useToast } from '@/hooks/use-toast';
import type { BadgeDefinition, BadgeCriteria } from '@/types/gamification';

interface BadgeDefinitionModalProps {
  subchapterId: string;
  badge?: BadgeDefinition | null;
  onClose: () => void;
}

export const BadgeDefinitionModal = ({
  subchapterId,
  badge,
  onClose,
}: BadgeDefinitionModalProps) => {
  const [formData, setFormData] = useState({
    badge_key: badge?.badge_key || '',
    display_name: badge?.display_name || '',
    description: badge?.description || '',
    icon: badge?.icon || '',
    is_teacher_awardable: badge?.is_teacher_awardable ?? false,
    criteria: (badge?.criteria || { type: 'manual' }) as BadgeCriteria,
  });

  const createMutation = useCreateBadgeDefinition(subchapterId);
  const updateMutation = useUpdateBadgeDefinition();
  const { toast } = useToast();

  const isEditing = !!badge;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.badge_key.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Badge key is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.display_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Display name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          badgeId: badge.id,
          updates: {
            display_name: formData.display_name,
            description: formData.description,
            icon: formData.icon,
            is_teacher_awardable: formData.is_teacher_awardable,
            criteria: formData.criteria,
          },
        });
        toast({
          title: 'Badge updated',
          description: `${formData.display_name} has been updated successfully.`,
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({
          title: 'Badge created',
          description: `${formData.display_name} has been created successfully.`,
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save badge',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Badge' : 'Create New Badge'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the badge definition. Changes will apply to future awards.'
              : 'Create a new badge that students can earn in this subchapter.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Badge Key */}
          <div className="space-y-2">
            <Label htmlFor="badge-key">
              Badge Key <span className="text-red-500">*</span>
            </Label>
            <Input
              id="badge-key"
              value={formData.badge_key}
              onChange={(e) =>
                setFormData({ ...formData, badge_key: e.target.value })
              }
              placeholder="e.g., participation_star"
              disabled={isEditing} // Can't change key after creation
              required
            />
            <p className="text-xs text-gray-500">
              Unique identifier (lowercase, underscores only). Cannot be changed
              after creation.
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display-name">
              Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="display-name"
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
              placeholder="e.g., Participation Star"
              required
            />
            <p className="text-xs text-gray-500">
              The name students will see when they earn this badge
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe when and why this badge is earned"
              rows={3}
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Emoji)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="⭐"
                maxLength={2}
                className="w-24"
              />
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-eliza-purple to-eliza-blue text-2xl">
                {formData.icon || '🏆'}
              </div>
              <p className="text-xs text-gray-500">
                Enter an emoji to represent this badge
              </p>
            </div>
          </div>

          {/* Criteria */}
          <CriteriaFieldsBuilder
            criteria={formData.criteria}
            onChange={(criteria) => setFormData({ ...formData, criteria })}
          />

          {/* Teacher Awardable */}
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="teacher-awardable"
              checked={formData.is_teacher_awardable}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  is_teacher_awardable: checked as boolean,
                })
              }
            />
            <Label
              htmlFor="teacher-awardable"
              className="text-sm font-normal cursor-pointer"
            >
              Allow teachers to award this badge manually (in addition to
              automatic criteria)
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-eliza-purple hover:bg-eliza-purple/90"
            >
              {isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Badge'
                  : 'Create Badge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
