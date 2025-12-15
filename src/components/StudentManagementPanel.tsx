import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { UserPlus, X, Mail, TrendingUp, Clock } from 'lucide-react';
import { useSyllabusStudents } from '@/hooks/useTeacherApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StudentManagementPanelProps {
  syllabusId: string;
}

export function StudentManagementPanel({ syllabusId }: StudentManagementPanelProps) {
  const { students, loading, addStudent, removeStudent } = useSyllabusStudents(syllabusId);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddStudent = async () => {
    if (!newStudentEmail.trim()) return;

    try {
      setIsAdding(true);
      await addStudent(newStudentEmail);
      setNewStudentEmail('');
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="border-2 border-eliza-purple/30 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-brand text-2xl flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-eliza-purple" />
          Student Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Student */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Student email address"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
              className="font-brand"
            />
          </div>
          <Button
            onClick={handleAddStudent}
            disabled={isAdding || !newStudentEmail.trim()}
            className="bg-eliza-purple hover:bg-eliza-purple/90 font-brand"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </Button>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="text-center py-8 text-gray-500 font-brand">
            Loading students...
          </div>
        ) : students.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {students.map((student: any) => (
              <Card key={student.student_id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-brand font-semibold text-gray-900 truncate">
                          {student.first_name} {student.last_name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-brand truncate mb-3">
                        {student.email}
                      </p>

                      {/* Progress Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-brand text-gray-600">Progress</span>
                          <span className="font-brand font-semibold text-eliza-purple">
                            {student.progress_percentage || 0}%
                          </span>
                        </div>
                        <Progress value={student.progress_percentage || 0} className="h-2" />
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span className="font-brand">
                              {student.completed_subchapters || 0}/{student.total_subchapters || 0} lessons
                            </span>
                          </div>
                          {student.last_watched_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className="font-brand">
                                {new Date(student.last_watched_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-brand">Remove Student</AlertDialogTitle>
                          <AlertDialogDescription className="font-brand">
                            Are you sure you want to remove {student.first_name} {student.last_name} from this course?
                            Their progress will be lost.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-brand">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeStudent(student.student_id)}
                            className="bg-red-500 hover:bg-red-600 font-brand"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 font-brand">
            No students enrolled yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
