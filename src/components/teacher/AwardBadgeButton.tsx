// Award Badge Button - Manual badge award interface for teachers
// Allows teachers to award badges to students with optional notes

import { useState } from 'react';
import { Award } from 'lucide-react';
import { useBadgeDefinitions } from '@/hooks/useBadgeDefinitions';
import { useAwardBadge } from '@/hooks/useStudentAchievements';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AwardBadgeButtonProps {
  studentId: string;
  studentName?: string;
  subchapterId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const AwardBadgeButton = ({
  studentId,
  studentName,
  subchapterId,
  variant = 'default',
  size = 'default',
}: AwardBadgeButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const { data: badges, isLoading: loadingBadges } = useBadgeDefinitions(subchapterId);
  const awardMutation = useAwardBadge();
  const { toast } = useToast();

  // Filter to only teacher-awardable badges
  const awardableBadges = badges?.filter((b) => b.is_teacher_awardable) || [];
  const selectedBadge = badges?.find((b) => b.id === selectedBadgeId);

  const handleAward = async () => {
    if (!selectedBadgeId) {
      toast({
        title: 'No badge selected',
        description: 'Please select a badge to award',
        variant: 'destructive',
      });
      return;
    }

    // Check if notes are required
    if (selectedBadge?.criteria.notes_required && !notes.trim()) {
      toast({
        title: 'Notes required',
        description: 'This badge requires notes when awarding',
        variant: 'destructive',
      });
      return;
    }

    try {
      await awardMutation.mutateAsync({
        badgeDefinitionId: selectedBadgeId,
        studentId,
        notes: notes.trim() || undefined,
      });

      toast({
        title: 'Badge awarded!',
        description: `${selectedBadge?.display_name} has been awarded to ${studentName || 'the student'}.`,
      });

      // Reset and close
      setShowModal(false);
      setSelectedBadgeId('');
      setNotes('');
    } catch (error) {
      toast({
        title: 'Failed to award badge',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (loadingBadges || awardableBadges.length === 0) {
    return null; // Don't show button if no awardable badges
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <Award className="h-4 w-4" />
        Award Badge
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Award Badge</DialogTitle>
            <DialogDescription>
              Award a badge to {studentName || 'this student'} for their achievement or
              effort.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Badge Selection */}
            <div className="space-y-2">
              <Label htmlFor="badge-select">Select Badge</Label>
              <Select value={selectedBadgeId} onValueChange={setSelectedBadgeId}>
                <SelectTrigger id="badge-select">
                  <SelectValue placeholder="Choose a badge..." />
                </SelectTrigger>
                <SelectContent>
                  {awardableBadges.map((badge) => (
                    <SelectItem key={badge.id} value={badge.id}>
                      <div className="flex items-center gap-2">
                        <span>{badge.icon || '🏆'}</span>
                        <span>{badge.display_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Badge Preview */}
            {selectedBadge && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-eliza-purple to-eliza-blue flex items-center justify-center text-xl">
                    {selectedBadge.icon || '🏆'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{selectedBadge.display_name}</p>
                    {selectedBadge.criteria.notes_required && (
                      <p className="text-xs text-red-600">* Notes required</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">{selectedBadge.description}</p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes {selectedBadge?.criteria.notes_required && '(Required)'}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a personal message or reason for this award..."
                rows={3}
                required={selectedBadge?.criteria.notes_required}
              />
              <p className="text-xs text-gray-500">
                The student will see this message with their badge
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setSelectedBadgeId('');
                setNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAward}
              disabled={!selectedBadgeId || awardMutation.isPending}
              className="bg-eliza-purple hover:bg-eliza-purple/90"
            >
              {awardMutation.isPending ? 'Awarding...' : 'Award Badge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
