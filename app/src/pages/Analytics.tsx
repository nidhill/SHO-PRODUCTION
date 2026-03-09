import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Users,
  GraduationCap,
  CalendarCheck,
  Star,
  TrendingUp,
  TrendingDown,
  School,
  PieChart
} from 'lucide-react';
import { batchService, studentService, schoolService } from '@/services/api';
import { toast } from 'sonner';

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({
    batches: null,
    students: null,
    schools: null
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [batchesResponse, studentsResponse, schoolsResponse] = await Promise.all([
        batchService.getAnalytics(),
        studentService.getAnalytics(),
        schoolService.getAnalytics()
      ]);

      setAnalytics({
        batches: batchesResponse.data.analytics,
        students: studentsResponse.data.analytics,
        schools: schoolsResponse.data.analytics
      });
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDistribution = () => {
    const { students } = analytics;
    if (!students) return [];

    const total = students.totalStudents || 1;
    return [
      { label: 'Active', value: students.activeStudents, color: 'bg-green-500', borderColor: 'border-l-green-500', bgColor: 'bg-green-500/10', textColor: 'text-green-600 dark:text-green-400', percentage: (students.activeStudents / total) * 100 },
      { label: 'Placed', value: students.placedStudents, color: 'bg-blue-500', borderColor: 'border-l-blue-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-600 dark:text-blue-400', percentage: (students.placedStudents / total) * 100 },
      { label: 'Interview Required', value: students.interviewRequired, color: 'bg-yellow-500', borderColor: 'border-l-yellow-500', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-600 dark:text-yellow-400', percentage: (students.interviewRequired / total) * 100 },
      { label: 'Revoked', value: students.revokedStudents, color: 'bg-red-500', borderColor: 'border-l-red-500', bgColor: 'bg-red-500/10', textColor: 'text-red-600 dark:text-red-400', percentage: (students.revokedStudents / total) * 100 },
    ];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive insights and statistics
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0ms' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Schools</span>
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <School className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{analytics.schools?.totalSchools || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Partner institutions</p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up border-border/60" style={{ animationDelay: '60ms' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Batches</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{analytics.batches?.totalBatches || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Active batches</p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up border-border/60" style={{ animationDelay: '120ms' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Students</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{analytics.students?.totalStudents || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Enrolled learners</p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up border-border/60" style={{ animationDelay: '180ms' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Attendance</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <CalendarCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{analytics.batches?.averageAttendance?.toFixed(1) || 0}%</p>
            <p className="text-xs text-muted-foreground mt-1">Across all batches</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Assignment Completion Rate</span>
                    <span className="font-medium">{analytics.batches?.assignmentCompletionRate?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={analytics.batches?.assignmentCompletionRate || 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Feedback Score</span>
                    <span className="font-medium">{analytics.batches?.averageFeedbackScore?.toFixed(1) || 0}/5</span>
                  </div>
                  <Progress value={(analytics.batches?.averageFeedbackScore || 0) * 20} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Attendance</span>
                    <span className="font-medium">{analytics.batches?.averageAttendance?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={analytics.batches?.averageAttendance || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Student Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getStatusDistribution().map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          {item.label}
                        </span>
                        <span className="font-medium">{item.value} ({item.percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Students</span>
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">{analytics.students?.activeStudents || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Placed Students</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{analytics.students?.placedStudents || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Interview Required</span>
                  <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <CalendarCheck className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-yellow-600 dark:text-yellow-400">{analytics.students?.interviewRequired || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revoked</span>
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">{analytics.students?.revokedStudents || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getStatusDistribution().map((item, idx) => (
                  <div key={idx} className={`relative p-4 rounded-xl border-l-4 ${item.borderColor} ${item.bgColor} bg-opacity-50`}>
                    <p className={`text-3xl font-bold tracking-tight ${item.textColor}`}>{item.value}</p>
                    <p className="text-sm font-medium mt-1">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.percentage.toFixed(1)}% of total</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5" />
                  Attendance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-5xl font-bold">{analytics.batches?.averageAttendance?.toFixed(1) || 0}%</p>
                  <p className="text-muted-foreground mt-2">Average Attendance</p>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Excellent (90-100%)</span>
                    <Badge variant="default">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Good (75-89%)</span>
                    <Badge variant="secondary">Average</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Needs Improvement (&lt;75%)</span>
                    <Badge variant="destructive">Poor</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Assignment Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-5xl font-bold">{analytics.batches?.assignmentCompletionRate?.toFixed(1) || 0}%</p>
                  <p className="text-muted-foreground mt-2">Completion Rate</p>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed on time</span>
                    <span className="font-medium">{(analytics.batches?.assignmentCompletionRate || 0).toFixed(0)}%</span>
                  </div>
                  <Progress value={analytics.batches?.assignmentCompletionRate || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Feedback Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-5xl font-bold">{analytics.batches?.averageFeedbackScore?.toFixed(1) || 0}</p>
                  <p className="text-muted-foreground mt-2">Average Score (out of 5)</p>
                </div>
                <div className="flex items-center justify-center gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${star <= (analytics.batches?.averageFeedbackScore || 0)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schools Tab */}
        <TabsContent value="schools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.schools?.schoolsList?.map((school: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/60 border-l-4 border-l-violet-500 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                        <School className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="font-medium leading-none">{school.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {school.totalBatches} batches
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {school.totalStudents} students
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
                        {school.totalStudents > 0
                          ? ((school.totalStudents / (analytics.schools?.totalStudents || 1)) * 100).toFixed(1)
                          : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">of total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
