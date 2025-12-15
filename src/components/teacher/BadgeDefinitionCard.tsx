// Badge Definition Card - Display individual badge with actions
// Shows badge info and provides edit/delete controls

import { useState } from 'react';
import { Edit2, Trash2, Lock } from 'lucide-react';
import { useDeleteBadgeDefinition } from '@/hooks/useBadgeDefinitions';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { BadgeDefinition } from '@/types/gamification';

interface BadgeDefinitionCardProps {
  badge: BadgeDefinition;
  onEdit: (badge: BadgeDefinition) => void;
}

export const BadgeDefinitionCard = ({
  badge,
  onEdit,
}: BadgeDefinitionCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteMutation = useDeleteBadgeDefinition();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(badge.id);
      toast({
        title: 'Badge deleted',
        description: `${badge.display_name} has been removed.`,
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: 'Cannot delete badge',
        description:
          error instanceof Error
            ? error.message
            : 'Students have already earned this badge.',
        variant: 'destructive',
      });
    }
  };

  const getCriteriaText = () => {
    const { criteria } = badge;
    switch (criteria.type) {
      case 'manual':
        return 'Awarded manually by teacher';
      case 'quiz_score':
        return `Score ${criteria.minimum_score || 90}% or higher`;
      case 'streak':
        return `Maintain ${criteria.days_required || 5} day streak`;
      case 'completion':
        return criteria.sections_required
          ? 'Complete all sections and quiz'
          : 'Complete the quiz';
      case 'participation':
        return 'Active participation';
      default:
        return 'Custom criteria';
    }
  };

  return (
    <>
      <div className="flex items-start gap-4 p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
        {/* Badge Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-eliza-purple to-eliza-blue flex items-center justify-center text-2xl">
            {badge.icon || '🏆'}
          </div>
        </div>

        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                {badge.display_name}
                {badge.is_default && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                    Default
                  </span>
                )}
                {badge.is_teacher_awardable && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                    Manual
                  </span>
                )}
              </h5>
              <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="font-medium">Criteria:</span>
                {getCriteriaText()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {badge.is_default ? (
                <div className="p-2 text-gray-400" title="Default badges cannot be edited">
                  <Lock className="h-4 w-4" />
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(badge)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Badge?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{badge.display_name}"? This action
              cannot be undone. If students have already earned this badge, deletion
              will be blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
