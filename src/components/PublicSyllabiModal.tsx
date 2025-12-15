import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Sparkles, GraduationCap, Building2 } from 'lucide-react';
import { usePublicSyllabi } from '@/hooks/useStudentApi';
import { Syllabus } from '@/lib/api';

interface PublicSyllabiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (syllabusId: string) => void;
}

export function PublicSyllabiModal({ isOpen, onClose, onEnroll }: PublicSyllabiModalProps) {
  const { syllabi, loading, enrollInSyllabus } = usePublicSyllabi();
  const [searchQuery, setSearchQuery] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const filteredSyllabi = syllabi.filter((syllabus) =>
    syllabus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    syllabus.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEnroll = async (syllabusId: string) => {
    try {
      setEnrolling(syllabusId);
      await enrollInSyllabus(syllabusId);
      onEnroll(syllabusId);
      onClose();
    } catch (err) {
      // Error handled by hook
    } finally {
      setEnrolling(null);
    }
  };

  const colorMap: Record<string, string> = {
    'eliza-red': '0 96.9% 62.4%',
    'eliza-yellow': '64.9 100% 61.8%',
    'eliza-blue': '230 69% 50.6%',
    'eliza-green': '91.4 100% 74.1%',
    'eliza-orange': '34.4 99.1% 55.9%',
    'eliza-purple': '240.5 98.2% 77.6%',
  };

  const colors = ['eliza-red', 'eliza-yellow', 'eliza-blue', 'eliza-green', 'eliza-orange', 'eliza-purple'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-brand text-3xl font-bold text-gray-900 mb-4">
            Browse Public Courses
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-brand"
            />
          </div>
        </div>

        {/* Syllabi Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <Sparkles className="h-12 w-12 text-eliza-purple" />
            </div>
            <p className="font-brand text-xl text-gray-600 mt-4">Loading courses...</p>
          </div>
        ) : filteredSyllabi.length > 0 ? (
          <div className="grid gap-4">
            {filteredSyllabi.map((syllabus: Syllabus & { teacher_name?: string; school_name?: string }, index) => {
              const color = colors[index % colors.length];

              return (
                <Card
                  key={syllabus.id}
                  className="border-2 transition-all hover:shadow-lg rounded-2xl overflow-hidden"
                  style={{ borderColor: `hsl(${colorMap[color]} / 0.3)` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                          style={{ backgroundColor: `hsl(${colorMap[color]} / 0.2)` }}
                        >
                          <BookOpen className="h-4 w-4" style={{ color: `hsl(${colorMap[color]})` }} />
                          <span className="font-brand text-sm font-semibold" style={{ color: `hsl(${colorMap[color]})` }}>
                            Public Course
                          </span>
                        </div>

                        <h3 className="font-brand text-2xl font-bold text-gray-900 mb-2">
                          {syllabus.name}
                        </h3>
                        
                        <p className="font-brand text-sm text-gray-600 mb-4">
                          {syllabus.description || 'Explore this course'}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {syllabus.teacher_name && (
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-4 w-4" />
                              <span className="font-brand">{syllabus.teacher_name}</span>
                            </div>
                          )}
                          {syllabus.school_name && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span className="font-brand">{syllabus.school_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleEnroll(syllabus.id)}
                        disabled={enrolling === syllabus.id}
                        className="font-brand font-semibold rounded-xl"
                        style={{ backgroundColor: `hsl(${colorMap[color]})` }}
                      >
                        {enrolling === syllabus.id ? 'Enrolling...' : 'Enroll'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-brand text-xl font-bold text-gray-800 mb-2">
              No courses found
            </h3>
            <p className="font-brand text-gray-600">
              Try adjusting your search
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
