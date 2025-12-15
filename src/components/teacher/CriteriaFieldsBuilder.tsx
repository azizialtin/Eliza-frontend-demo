// Criteria Fields Builder - Dynamic form fields based on criteria type
// Provides appropriate inputs for each badge criteria type

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { BadgeCriteria, BadgeCriteriaType } from '@/types/gamification';

interface CriteriaFieldsBuilderProps {
  criteria: BadgeCriteria;
  onChange: (criteria: BadgeCriteria) => void;
}

export const CriteriaFieldsBuilder = ({
  criteria,
  onChange,
}: CriteriaFieldsBuilderProps) => {
  const handleTypeChange = (type: BadgeCriteriaType) => {
    // Reset criteria when type changes
    onChange({ type });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="criteria-type">Criteria Type</Label>
        <Select value={criteria.type} onValueChange={handleTypeChange}>
          <SelectTrigger id="criteria-type">
            <SelectValue placeholder="Select criteria type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Award</SelectItem>
            <SelectItem value="quiz_score">Quiz Score</SelectItem>
            <SelectItem value="streak">Streak</SelectItem>
            <SelectItem value="completion">Completion</SelectItem>
            <SelectItem value="participation">Participation</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          {criteria.type === 'manual' &&
            'Badge must be awarded manually by a teacher'}
          {criteria.type === 'quiz_score' &&
            'Badge is automatically awarded when student achieves the score'}
          {criteria.type === 'streak' &&
            'Badge is automatically awarded when student maintains the streak'}
          {criteria.type === 'completion' &&
            'Badge is automatically awarded when student completes requirements'}
          {criteria.type === 'participation' &&
            'Badge is awarded for active participation'}
        </p>
      </div>

      {/* Manual Criteria Fields */}
      {criteria.type === 'manual' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="notes-required"
            checked={criteria.notes_required || false}
            onCheckedChange={(checked) =>
              onChange({ ...criteria, notes_required: checked as boolean })
            }
          />
          <Label
            htmlFor="notes-required"
            className="text-sm font-normal cursor-pointer"
          >
            Require notes when awarding this badge
          </Label>
        </div>
      )}

      {/* Quiz Score Criteria Fields */}
      {criteria.type === 'quiz_score' && (
        <div className="space-y-2">
          <Label htmlFor="minimum-score">Minimum Score (%)</Label>
          <Input
            id="minimum-score"
            type="number"
            min="0"
            max="100"
            value={criteria.minimum_score || 90}
            onChange={(e) =>
              onChange({
                ...criteria,
                minimum_score: parseInt(e.target.value) || 90,
              })
            }
          />
          <p className="text-xs text-gray-500">
            Students must score at least this percentage to earn the badge
          </p>
        </div>
      )}

      {/* Streak Criteria Fields */}
      {criteria.type === 'streak' && (
        <div className="space-y-2">
          <Label htmlFor="days-required">Days Required</Label>
          <Input
            id="days-required"
            type="number"
            min="1"
            value={criteria.days_required || 5}
            onChange={(e) =>
              onChange({
                ...criteria,
                days_required: parseInt(e.target.value) || 5,
              })
            }
          />
          <p className="text-xs text-gray-500">
            Number of consecutive days required to earn the badge
          </p>
        </div>
      )}

      {/* Completion Criteria Fields */}
      {criteria.type === 'completion' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sections-required"
            checked={criteria.sections_required || false}
            onCheckedChange={(checked) =>
              onChange({ ...criteria, sections_required: checked as boolean })
            }
          />
          <Label
            htmlFor="sections-required"
            className="text-sm font-normal cursor-pointer"
          >
            Require all sections viewed (in addition to quiz completion)
          </Label>
        </div>
      )}

      {/* Participation has no additional fields */}
      {criteria.type === 'participation' && (
        <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
          This badge will be awarded manually for active participation in class
          discussions, activities, or other engagement.
        </p>
      )}
    </div>
  );
};
