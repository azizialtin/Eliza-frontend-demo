import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Globe, Sparkles } from 'lucide-react';

interface LearningJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOwn: () => void;
  onBrowsePublic: () => void;
}

export function LearningJourneyModal({
  isOpen,
  onClose,
  onCreateOwn,
  onBrowsePublic,
}: LearningJourneyModalProps) {
  const handleCreateOwn = () => {
    onClose();
    onCreateOwn();
  };

  const handleBrowsePublic = () => {
    onClose();
    onBrowsePublic();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-brand text-3xl font-bold text-gray-900 mb-2">
            Start a New Learning Journey
          </DialogTitle>
          <p className="font-brand text-gray-600">
            Choose how you'd like to begin your learning adventure
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Create Your Own */}
          <Card
            className="cursor-pointer hover:shadow-2xl border-4 border-eliza-purple/40 hover:border-eliza-purple transition-all duration-300 hover:scale-105 rounded-3xl overflow-hidden group"
            onClick={handleCreateOwn}
          >
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-eliza-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="font-brand text-2xl font-bold text-gray-900 mb-2">
                    Create Your Own
                  </h3>
                  <p className="font-brand text-sm text-gray-600">
                    Upload your PDFs and let AI create a personalized course just for you
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-eliza-purple font-brand font-semibold">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browse Public */}
          <Card
            className="cursor-pointer hover:shadow-2xl border-4 border-eliza-orange/40 hover:border-eliza-orange transition-all duration-300 hover:scale-105 rounded-3xl overflow-hidden group"
            onClick={handleBrowsePublic}
          >
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-eliza-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="font-brand text-2xl font-bold text-gray-900 mb-2">
                    Browse Public Courses
                  </h3>
                  <p className="font-brand text-sm text-gray-600">
                    Explore courses created by teachers and join existing learning communities
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-eliza-orange font-brand font-semibold">
                  <Globe className="h-4 w-4" />
                  Community Courses
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
