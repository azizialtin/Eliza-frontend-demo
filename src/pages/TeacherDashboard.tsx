import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown, BookOpen, Users, TrendingUp, ClipboardCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { EngagementChart } from "@/components/dashboard/analytics/EngagementChart";
import { MasteryHeatmap } from "@/components/dashboard/analytics/MasteryHeatmap";
import { ClassLeaderboard } from "@/components/dashboard/analytics/ClassLeaderboard";
import { calculateLeaderboard, MOCK_CLASSES } from "@/lib/mock-gamification";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);

  // Global Class Filter State
  const [selectedClass, setSelectedClass] = useState<string>('9 Integral');

  // Fetch / Recalculate Leaderboard when class changes
  useEffect(() => {
    setLoadingLb(true);
    // Simulate API delay slightly for realism
    setTimeout(() => {
      const data = calculateLeaderboard(selectedClass);
      setLeaderboardData(data);
      setLoadingLb(false);
    }, 300);
  }, [selectedClass]);

  return (
    <div className="flex min-h-screen bg-gray-50 relative overflow-hidden font-brand">
      {/* Left Sidebar - Fixed */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <DashboardSidebar className="fixed inset-y-0 w-64 z-20" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative">

        {/* Header with Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Teacher!
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your courses and students.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          {/* Card 1: Total Courses (Red) */}
          <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">5</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Total Students (Blue) */}
          <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">24</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Active This Week (Green) */}
          <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500">Active This Week</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">18</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4: Pending Reviews (Orange) */}
          <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">2</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <ClipboardCheck className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Analytics Section Header with Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-eliza-blue" />
            <h2 className="text-xl font-bold text-gray-900">Class Analytics & Gamification</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Class Selector */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Filter Class:</span>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[120px] h-8 border-none bg-transparent focus:ring-0">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CLASSES.map(cls => (
                    <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Analytics Row - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px] mb-8">
          {/* Engagement Chart (Stacked Activity) */}
          <EngagementChart classId={selectedClass} />

          <MasteryHeatmap classId={selectedClass} />
        </div>

        {/* Leaderboard Section - Full Width */}
        <div className="w-full pb-20">
          <ClassLeaderboard
            leaderboardData={leaderboardData}
            isLoading={loadingLb}
            variant="default" // Explicitly Teacher Mode
          />
        </div>

      </main>
    </div>
  );
}
