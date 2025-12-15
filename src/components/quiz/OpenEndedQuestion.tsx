// Open Ended Question Component
// Handles text, image, and voice input for open-ended questions

import React, { useState, useRef } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OpenEndedQuestionProps {
  question: QuizQuestion;
  onSubmit: (answer: string, type: 'text' | 'image' | 'voice') => Promise<void>;
  className?: string;
}

export const OpenEndedQuestion: React.FC<OpenEndedQuestionProps> = ({
  question,
  onSubmit,
  className,
}) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const characterLimit = 1000;
  const remainingChars = characterLimit - textAnswer.length;

  // Handle text submission
  const handleTextSubmit = async () => {
    if (!textAnswer.trim()) {
      toast({
        title: 'Answer required',
        description: 'Please enter your answer before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(textAnswer, 'text');
      toast({
        title: '✅ Answer submitted',
        description: 'Your answer has been recorded.',
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast({
        title: 'Submission failed',
        description: 'Could not submit your answer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP).',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image submission
  const handleImageSubmit = async () => {
    if (!selectedImage || !imagePreview) {
      toast({
        title: 'Image required',
        description: 'Please select an image before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(imagePreview, 'image');
      toast({
        title: '✅ Image submitted',
        description: 'Your image has been uploaded.',
      });
    } catch (error) {
      console.error('Failed to submit image:', error);
      toast({
        title: 'Submission failed',
        description: 'Could not upload your image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear image
  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: '🎤 Recording started',
        description: 'Speak your answer clearly.',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: 'Recording failed',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: '⏹️ Recording stopped',
        description: 'You can now submit your voice answer.',
      });
    }
  };

  // Handle voice submission
  const handleVoiceSubmit = async () => {
    if (!audioBlob) {
      toast({
        title: 'Recording required',
        description: 'Please record your answer before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        await onSubmit(base64Audio, 'voice');
        toast({
          title: '✅ Voice answer submitted',
          description: 'Your recording has been uploaded.',
        });
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Failed to submit voice answer:', error);
      toast({
        title: 'Submission failed',
        description: 'Could not upload your recording. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('open-ended-question space-y-6', className)}>
      {/* Question */}
      <div className="bg-eliza-surface p-6 rounded-lg">
        <h3 className="text-xl font-bold text-eliza-text-primary mb-3">
          {question.body}
        </h3>
        {question.answer_explanation && (
          <p className="text-sm text-eliza-text-secondary">
            {question.answer_explanation}
          </p>
        )}
      </div>

      {/* Text input */}
      <div>
        <label className="block text-sm font-medium text-eliza-text-primary mb-2">
          Written Answer
        </label>
        <Textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[150px] resize-y"
          maxLength={characterLimit}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-eliza-text-secondary">
            {remainingChars} characters remaining
          </p>
          <Button
            onClick={handleTextSubmit}
            disabled={!textAnswer.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Text
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-eliza-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-eliza-background text-eliza-text-secondary">
            Or
          </span>
        </div>
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-eliza-text-primary mb-2">
          Upload Image
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          disabled={isSubmitting}
        />
        
        {imagePreview ? (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-md rounded-lg border border-eliza-border"
              />
              <button
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-1 bg-eliza-red rounded-full hover:bg-eliza-red/90"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <Button
              onClick={handleImageSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Image
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Choose Image
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-eliza-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-eliza-background text-eliza-text-secondary">
            Or
          </span>
        </div>
      </div>

      {/* Voice recording */}
      <div>
        <label className="block text-sm font-medium text-eliza-text-primary mb-2">
          Voice Recording
        </label>
        <div className="flex items-center gap-3">
          <Button
            variant={isRecording ? 'destructive' : 'outline'}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSubmitting}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          
          {audioBlob && !isRecording && (
            <Button
              onClick={handleVoiceSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Recording
                </>
              )}
            </Button>
          )}
        </div>
        
        {isRecording && (
          <p className="text-sm text-eliza-red mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-eliza-red rounded-full animate-pulse" />
            Recording in progress...
          </p>
        )}
        
        {audioBlob && !isRecording && (
          <p className="text-sm text-eliza-green mt-2">
            ✓ Recording ready to submit
          </p>
        )}
      </div>
    </div>
  );
};
