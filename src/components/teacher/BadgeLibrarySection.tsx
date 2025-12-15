// Badge Library Section - Teacher badge management UI
// Collapsible section in ContentEditMode for managing badge definitions

import { useState } from 'react';
import { Award, Plus, ChevronDown } from 'lucide-react';
import { useBadgeDefinitions } from '@/hooks/useBadgeDefinitions';
import { BadgeDefinitionCard } from './BadgeDefinitionCard';
import { BadgeDefinitionModal } from './BadgeDefinitionModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { BadgeDefinition } from '@/types/gamification';

interface BadgeLibrarySectionProps {
  subchapterId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export const BadgeLibrarySection = ({
  subchapterId,
  isExpanded,
  onToggle,
}: BadgeLibrarySectionProps) => {
  const { data: badges, isLoading, error } = useBadgeDefinitions(subchapterId);
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeDefinition | null>(null);

  const handleEdit = (badge: BadgeDefinition) => {
    setEditingBadge(badge);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBadge(null);
  };

  const defaultBadges = badges?.filter((b) => b.is_default) || [];
  const customBadges = badges?.filter((b) => !b.is_default) || [];

  return (
    <div className="badge-library-section border rounded-lg bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-eliza-purple" />
          <span className="font-semibold text-gray-900">Badge Library</span>
          <span className="text-sm text-gray-500">
            ({badges?.length || 0} badges)
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="p-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Manage badges that students can earn in this subchapter
            </p>
            <Button
              onClick={() => setShowModal(true)}
              size="sm"
              className="bg-eliza-purple hover:bg-eliza-purple/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Badge
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Failed to load badges. Please try again.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Default Badges */}
              {defaultBadges.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                      Default
                    </span>
                    System Badges
                  </h4>
                  <div className="grid gap-3">
                    {defaultBadges.map((badge) => (
                      <BadgeDefinitionCard
                        key={badge.id}
                        badge={badge}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Badges */}
              {customBadges.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Custom Badges
                  </h4>
                  <div className="grid gap-3">
                    {customBadges.map((badge) => (
                      <BadgeDefinitionCard
                        key={badge.id}
                        badge={badge}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </div>
              )}

              {badges?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No badges yet</p>
                  <p className="text-xs mt-1">
                    Create your first badge to motivate students
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showModal && (
        <BadgeDefinitionModal
          subchapterId={subchapterId}
          badge={editingBadge}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
