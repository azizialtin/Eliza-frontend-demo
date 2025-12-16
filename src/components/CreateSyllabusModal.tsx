import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface CreateSyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSyllabus: (syllabusId: string, name: string) => void;
}

export const CreateSyllabusModal = ({ isOpen, onClose, onCreateSyllabus }: CreateSyllabusModalProps) => {
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      setUploading(true);

      const syllabus = await apiClient.createSyllabus(name);

      toast({
        title: "Class Created",
        description: "Class created successfully.",
      });

      onCreateSyllabus(syllabus.id, syllabus.name);
      handleReset();
    } catch (error) {
      console.error("Creation failed", error)
      toast({
        title: "Creation Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="sm:max-w-lg border-4 border-eliza-orange rounded-3xl">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="font-brand text-2xl font-bold text-gray-900">
              Create New Class
            </h2>
            <p className="font-brand text-sm text-gray-600 mt-1">
              Start by giving your class a name. You'll add content in the next step.
            </p>
          </div>

          <div className="space-y-6">
            {/* Class Name Input */}
            <div className="space-y-2">
              <Label htmlFor="class-name" className="text-base font-semibold text-gray-800">
                Class Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="class-name"
                placeholder="e.g. Advanced Mathematics 101"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-brand text-lg py-6 rounded-xl border-2 border-gray-200 focus:border-eliza-purple focus:ring-eliza-purple/20"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={handleReset}
                className="font-brand rounded-xl"
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || uploading}
                className="bg-eliza-orange text-white hover:bg-eliza-orange/90 font-brand font-semibold rounded-xl px-8"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Class'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
