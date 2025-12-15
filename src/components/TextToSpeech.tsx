// Text-to-Speech Component
// Provides audio playback of text content using browser SpeechSynthesis API

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TextToSpeechProps {
  text: string;
  title?: string;
  className?: string;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  title,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports speech synthesis
    setIsSupported('speechSynthesis' in window);

    return () => {
      // Cleanup: stop speech when component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!isSupported) {
      toast({
        title: 'Not supported',
        description: 'Text-to-speech is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
      toast({
        title: 'Playback error',
        description: 'Failed to play audio. Please try again.',
        variant: 'destructive',
      });
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {!isPlaying && !isPaused && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlay}
            aria-label={`Listen to ${title || 'content'}`}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Listen
          </Button>
        )}

        {isPlaying && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePause}
            aria-label="Pause audio"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}

        {isPaused && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlay}
            aria-label="Resume audio"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
        )}

        {(isPlaying || isPaused) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStop}
            aria-label="Stop audio"
          >
            <VolumeX className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
