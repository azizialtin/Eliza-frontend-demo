// Alert Card Component
// Individual alert card for struggling students

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Eye, MessageSquare, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { TeacherAlert } from '@/types/quiz';

interface AlertCardProps {
  alert: TeacherAlert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const navigate = useNavigate();
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(alert.is_resolved);

  const accuracyPercentage = Math.round(alert.accuracy * 100);

  // Handle mark as resolved
  const handleMarkResolved = async () => {
    setIsResolving(true);
    try {
      // This would call an API to mark the alert as resolved
      // For now, we'll just update local state
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsResolved(true);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    } finally {
      setIsResolving(false);
    }
  };

  // Handle view performance
  const handleViewPerformance = () => {
    // Navigate to student performance page
    navigate(`/app/students/${alert.student_id}/performance`);
  };

  // Handle message student
  const handleMessageStudent = () => {
    // Open messaging interface
    // This would be implemented based on your messaging system
    console.log('Message student:', alert.student_id);
  };

  // Handle assign content
  const handleAssignContent = () => {
    // Navigate to content assignment
    navigate(`/app/syllabus/${alert.syllabus_id}/subchapter/${alert.subchapter_id}`);
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all',
        isResolved
          ? 'border-eliza-border bg-eliza-surface/50 opacity-60'
          : 'border-eliza-red/30 bg-eliza-red/5'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-eliza-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-eliza-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-eliza-text-primary">
              {alert.student_name}
            </h4>
            <p className="text-sm text-eliza-text-secondary">
              {alert.subchapter_title}
            </p>
          </div>
        </div>
        {isResolved && (
          <Badge className="bg-eliza-green/20 text-eliza-green">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-2 bg-eliza-background rounded">
          <p className="text-xs text-eliza-text-secondary mb-1">Accuracy</p>
          <p className="text-lg font-bold text-eliza-red">
            {accuracyPercentage}%
          </p>
        </div>
        <div className="p-2 bg-eliza-background rounded">
          <p className="text-xs text-eliza-text-secondary mb-1">Attempts</p>
          <p className="text-lg font-bold text-eliza-text-primary">
            {alert.attempts}
          </p>
        </div>
      </div>

      {/* Recommended Action */}
      {alert.recommended_action && !isResolved && (
        <div className="mb-3 p-2 bg-eliza-blue/10 border border-eliza-blue/20 rounded text-sm">
          <p className="text-eliza-text-primary">
            <strong>Recommended:</strong> {alert.recommended_action}
          </p>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-eliza-text-secondary mb-3">
        {new Date(alert.created_at).toLocaleString()}
      </p>

      {/* Actions */}
      {!isResolved && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleViewPerformance}
          >
            <Eye className="w-3 h-3 mr-2" />
            View Performance
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMessageStudent}
          >
            <MessageSquare className="w-3 h-3 mr-2" />
            Message
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAssignContent}
          >
            <FileText className="w-3 h-3 mr-2" />
            Assign Content
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMarkResolved}
            disabled={isResolving}
            className="ml-auto text-eliza-green hover:text-eliza-green"
          >
            {isResolving ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 mr-2" />
                Mark Resolved
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
