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
      { label: 'Active', value: students.activeStudents, color: 'bg-green-500', percentage: (students.activeStudents / total) * 100 },
      { label: 'Placed', value: students.placedStudents, color: 'bg-blue-500', percentage: (students.placedStudents / total) * 100 },
      { label: 'Interview Required', value: students.interviewRequired, color: 'bg-yellow-500', percentage: (students.interviewRequired / total) * 100 },
      { label: 'Revoked', value: students.revokedStudents, color: 'bg-red-500', percentage: (students.revokedStudents / total) * 100 },
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Schools</p>
                    <p className="text-3xl font-bold">{analytics.schools?.totalSchools || 0}</p>
                  </div>
                  <School className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Batches</p>
                    <p className="text-3xl font-bold">{analytics.batches?.totalBatches || 0}</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-3xl font-bold">{analytics.students?.totalStudents || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Attendance</p>
                    <p className="text-3xl font-bold">{analytics.batches?.averageAttendance?.toFixed(1) || 0}%</p>
                  </div>
                  <CalendarCheck className="h-8 w-8 text-primary" />
                </div>
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
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Students</p>
                        <p className="text-2xl font-bold text-green-600">{analytics.students?.activeStudents || 0}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Placed Students</p>
                        <p className="text-2xl font-bold text-blue-600">{analytics.students?.placedStudents || 0}</p>
                      </div>
                      <GraduationCap className="h-6 w-6 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Interview Required</p>
                        <p className="text-2xl font-bold text-yellow-600">{analytics.students?.interviewRequired || 0}</p>
                      </div>
                      <CalendarCheck className="h-6 w-6 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revoked</p>
                        <p className="text-2xl font-bold text-red-600">{analytics.students?.revokedStudents || 0}</p>
                      </div>
                      <TrendingDown className="h-6 w-6 text-red-500" />
                    </div>
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
                      <div key={idx} className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-3xl font-bold">{item.value}</p>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.percentage.toFixed(1)}%</p>
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
                  <div className="space-y-4">
                    {analytics.schools?.schoolsList?.map((school: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{school.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{school.totalBatches} batches</span>
                            <span>{school.totalStudents} students</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
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
