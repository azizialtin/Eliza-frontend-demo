// Media Version Modal Component
// Modal for requesting and managing media versions

import React, { useState } from 'react';
import { useRequestMediaVersion } from '@/hooks/useTeacherSections';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Film, Mic, FileText, Check, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentSection, MediaVersion } from '@/types/content-sections';

interface MediaVersionModalProps {
  section: ContentSection;
  onClose: () => void;
}

export const MediaVersionModal: React.FC<MediaVersionModalProps> = ({
  section,
  onClose,
}) => {
  const [mediaType, setMediaType] = useState<'video' | 'voiceover' | 'script'>('video');
  const [teacherFeedback, setTeacherFeedback] = useState('');
  
  const requestMediaVersion = useRequestMediaVersion();

  // Handle request new version
  const handleRequestVersion = async () => {
    try {
      await requestMediaVersion.mutateAsync({
        sectionId: section.id,
        request: {
          media_type: mediaType,
          teacher_feedback: teacherFeedback || undefined,
        },
      });
      setTeacherFeedback('');
    } catch (error) {
      console.error('Failed to request media version:', error);
    }
  };

  // Get status badge config
  const getStatusBadge = (status: MediaVersion['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, label: 'Pending', className: 'bg-eliza-yellow/20 text-eliza-yellow' };
      case 'processing':
        return { icon: Loader2, label: 'Processing', className: 'bg-eliza-blue/20 text-eliza-blue' };
      case 'approved':
        return { icon: Check, label: 'Approved', className: 'bg-eliza-green/20 text-eliza-green' };
      case 'rejected':
        return { icon: XCircle, label: 'Rejected', className: 'bg-eliza-red/20 text-eliza-red' };
      default:
        return { icon: Clock, label: status, className: 'bg-eliza-surface text-eliza-text-secondary' };
    }
  };

  // Get media type icon
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Film;
      case 'voiceover':
        return Mic;
      case 'script':
        return FileText;
      default:
        return FileText;
    }
  };

  // Sort versions by version_index (descending)
  const sortedVersions = [...section.media_versions].sort(
    (a, b) => b.version_index - a.version_index
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Media Versions - {section.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request New Version */}
          <div className="p-4 bg-eliza-surface rounded-lg border border-eliza-border">
            <h3 className="font-semibold text-eliza-text-primary mb-4">
              Request New Media Version
            </h3>

            <div className="space-y-4">
              {/* Media Type Selection */}
              <div>
                <Label htmlFor="media-type">Media Type</Label>
                <Select
                  value={mediaType}
                  onValueChange={(value: any) => setMediaType(value)}
                >
                  <SelectTrigger id="media-type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="voiceover">Voiceover</SelectItem>
                    <SelectItem value="script">Script</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Teacher Feedback */}
              <div>
                <Label htmlFor="feedback">
                  Feedback / Instructions (optional)
                </Label>
                <Textarea
                  id="feedback"
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  placeholder="Provide specific instructions or feedback for the AI generation..."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleRequestVersion}
                disabled={requestMediaVersion.isPending}
                className="w-full"
              >
                {requestMediaVersion.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 mr-2" />
                    Request New Version
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Version History */}
          <div>
            <h3 className="font-semibold text-eliza-text-primary mb-3">
              Version History ({sortedVersions.length})
            </h3>

            {sortedVersions.length > 0 ? (
              <div className="space-y-3">
                {sortedVersions.map((version) => {
                  const statusBadge = getStatusBadge(version.status);
                  const StatusIcon = statusBadge.icon;
                  const MediaIcon = getMediaTypeIcon(version.media_type);

                  return (
                    <div
                      key={version.id}
                      className={cn(
                        'p-4 rounded-lg border-2',
                        version.status === 'approved'
                          ? 'border-eliza-green bg-eliza-green/5'
                          : 'border-eliza-border bg-eliza-surface'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MediaIcon className="w-4 h-4 text-eliza-text-secondary" />
                          <span className="font-medium text-eliza-text-primary">
                            Version {version.version_index}
                          </span>
                          <Badge className={cn('text-xs flex items-center gap-1', statusBadge.className)}>
                            <StatusIcon className={cn('w-3 h-3', version.status === 'processing' && 'animate-spin')} />
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <span className="text-xs text-eliza-text-secondary">
                          {new Date(version.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {version.teacher_feedback && (
                        <div className="mt-2 p-2 bg-eliza-background rounded text-sm">
                          <p className="text-xs text-eliza-text-secondary mb-1">
                            Teacher Feedback:
                          </p>
                          <p className="text-eliza-text-primary">
                            {version.teacher_feedback}
                          </p>
                        </div>
                      )}

                      {version.media_url && (
                        <div className="mt-2">
                          <a
                            href={version.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-eliza-primary hover:underline"
                          >
                            View Media →
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-eliza-surface rounded-lg border border-eliza-border">
                <p className="text-sm text-eliza-text-secondary">
                  No media versions yet. Request one above to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
