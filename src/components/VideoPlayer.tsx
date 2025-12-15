import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  subchapterId: string;
  videoStatus?: string;
  videoProgress?: number;
  videoFilePath?: string | null;
  audioFilePath?: string | null;
  videoMessage?: string | null;
  onRetry?: () => void;
  onGenerateVideo?: () => void;
  videoType?: 'explanation' | 'blackboard';
}

export const VideoPlayer = ({
  subchapterId,
  videoStatus: initialStatus,
  videoProgress: initialProgress,
  videoFilePath: initialVideoPath,
  audioFilePath: initialAudioPath,
  videoMessage: initialMessage,
  onRetry,
  onGenerateVideo,
  videoType = 'explanation'
}: VideoPlayerProps) => {
  // Internal state for uncontrolled mode
  const [internalStatus, setInternalStatus] = useState<string>(initialStatus || 'loading');
  const [internalProgress, setInternalProgress] = useState<number>(initialProgress || 0);
  const [internalMessage, setInternalMessage] = useState<string | null>(initialMessage || null);
  const [internalVideoPath, setInternalVideoPath] = useState<string | null>(initialVideoPath || null);

  // Derived state (prioritize props if provided, otherwise use internal state)
  const status = initialStatus || internalStatus;
  const progress = initialProgress !== undefined ? initialProgress : internalProgress;
  const message = initialMessage || internalMessage;

  // Blob URL state for authenticated video playback
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { toast } = useToast();

  // Polling logic
  useEffect(() => {
    // If props are provided, don't poll internally
    if (initialStatus) return;

    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const checkStatus = async () => {
      if (!subchapterId) return;

      try {
        const data = await apiClient.getVideoStatus(subchapterId);

        if (isMounted) {
          setInternalStatus(data.video_status);
          setInternalProgress(data.video_progress);
          setInternalMessage(data.video_message || null);
          setInternalVideoPath(data.video_file_path || null);

          if (data.video_status === 'COMPLETED' || data.video_status === 'FAILED' || data.video_status === 'NOT_GENERATED') {
            if (intervalId) clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error("Failed to poll video status:", err);
        // Don't stop polling on transient errors, but maybe log it
      }
    };

    // Initial check
    checkStatus();

    // Start polling if we are in a generating state or loading
    if (status === 'loading' || status === 'QUEUED' || status === 'GENERATING_SCRIPT' || status === 'GENERATING_IMAGES' || status === 'GENERATING_AUDIO' || status === 'CREATING_SCENES' || status === 'RENDERING_VIDEO' || status === 'GENERATING') {
      intervalId = setInterval(checkStatus, 3000);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [subchapterId, initialStatus, status]);

  useEffect(() => {
    if (status !== 'FAILED' && isRetrying) {
      setIsRetrying(false);
    }
  }, [status, isRetrying]);

  // Fetch video blob when status is completed
  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      if (status === 'COMPLETED' && !blobUrl && !isLoadingVideo) {
        setIsLoadingVideo(true);
        try {
          // For blackboard video, we might need a different method if it exists,
          // but for now we only implemented fetchVideoBlob for the main video.
          // If videoType is blackboard, we might need to implement fetchBlackboardVideoBlob or similar.
          // Assuming fetchVideoBlob works for the main video endpoint.

          if (videoType === 'explanation') {
            const blob = await apiClient.fetchVideoBlob(subchapterId);
            if (isMounted) {
              const url = URL.createObjectURL(blob);
              setBlobUrl(url);
              setError(null);
            }
          } else {
            // Fallback for blackboard or other types if we haven't implemented blob fetch for them yet
            // Or if we assume getBlackboardVideoUrl is public/cookie-based
            // For now, let's just use the URL directly for blackboard as we didn't change that API
          }
        } catch (err) {
          console.error("Failed to load video blob:", err);
          if (isMounted) {
            setError(`Failed to load video: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        } finally {
          if (isMounted) {
            setIsLoadingVideo(false);
          }
        }
      }
    };

    loadVideo();

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [subchapterId, status, videoType]); // Removed blobUrl from dependency to avoid loops, but added check inside

  const handleRetryClick = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } catch (error) {
        setIsRetrying(false);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (audioRef.current) {
          audioRef.current.pause();
        }
      } else {
        videoRef.current.play();
        if (audioRef.current) {
          audioRef.current.play();
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  if (status === 'QUEUED' ||
    status === 'GENERATING_SCRIPT' ||
    status === 'GENERATING_IMAGES' ||
    status === 'GENERATING_AUDIO' ||
    status === 'CREATING_SCENES' ||
    status === 'RENDERING_VIDEO' ||
    status === 'GENERATING') {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="font-medium mb-2">Generating Video Content</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {message || "AI is creating your educational content..."}
            </p>
            {progress > 0 && (
              <div className="w-full bg-secondary rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Progress: {progress}% - This usually takes 3-5 minutes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'FAILED') {
    return (
      <Card className="w-full border-destructive">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <h3 className="font-medium mb-2 text-destructive">Video Generation Failed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an issue generating the video content. Please try again.
            </p>
            {onRetry && (
              <Button onClick={handleRetryClick} variant="outline" disabled={isRetrying}>
                {isRetrying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry Generation
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'NOT_STARTED' || status === 'NOT_GENERATED' || (!blobUrl && videoType === 'explanation' && status === 'COMPLETED' && !isLoadingVideo) || (videoType !== 'explanation' && !initialVideoPath && status !== 'COMPLETED')) {
    // If completed but failed to load blob (and not loading), show error or placeholder
    if (status === 'COMPLETED' && error) {
      return (
        <Card className="w-full border-destructive">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
              <h3 className="font-medium mb-2 text-destructive">Failed to Load Video</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error}
              </p>
              <Button onClick={() => { setError(null); setIsLoadingVideo(false); }} variant="outline">
                Retry Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (status === 'COMPLETED' && isLoadingVideo) {
      return (
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="font-medium mb-2">Loading Video...</h3>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Play className="h-4 w-4" />
            </div>
            <h3 className="font-medium mb-2">No Video Available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Video content has not been generated for this lesson yet.
            </p>
            {onGenerateVideo && (
              <Button onClick={onGenerateVideo} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Generate Video
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Video completed - render player
  const videoSrc = videoType === 'blackboard'
    ? apiClient.getBlackboardVideoUrl(subchapterId)
    : (blobUrl || '');

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        {error ? (
          <div className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={() => setError(null)} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="relative bg-black rounded-t-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-96 object-contain"
              src={videoSrc}
              controls
              preload="metadata"
              onError={() => setError('Failed to load video')}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
