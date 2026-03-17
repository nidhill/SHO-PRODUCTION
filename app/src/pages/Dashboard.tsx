import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Loader2,
  School,
  Star,
  Bell,
  CalendarDays,
  MessageSquare,
  ChevronRight,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Phone,
  Mail
} from 'lucide-react';
import { batchService, studentService, schoolService, syncService } from '@/services/api';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardStats {
  totalBatches: number;
  totalStudents: number;
  averageAttendance: number;
  averageFeedbackScore: number;
  assignmentCompletionRate: number;
  totalSchools?: number;
  activeStudents?: number;
  placedStudents?: number;
  interviewRequired?: number;
}

interface RecentActivity {
  id: string;
  type: 'student' | 'attendance' | 'assignment' | 'feedback' | 'notification';
  title: string;
  description: string;
  timestamp: string;
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingBatches, setUpcomingBatches] = useState<any[]>([]);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const batchResponse = await batchService.getAnalytics();
      const studentResponse = await studentService.getAnalytics();

      let schoolData = { totalSchools: 0 };
      if (hasRole(['leadership', 'admin', 'ssho', 'academic', 'ceo_haca', 'pl'])) {
        const schoolResponse = await schoolService.getAnalytics();
        schoolData = schoolResponse.data.analytics;
      }

      setStats({
        ...batchResponse.data.analytics,
        ...studentResponse.data.analytics,
        totalSchools: schoolData.totalSchools
      });

      // Fetch batches starting within 2 days
      try {
        const upcomingRes = await syncService.getUpcomingBatches();
        setUpcomingBatches(upcomingRes.data.batches || []);
      } catch {
        setUpcomingBatches([]);
      }

      // Fetch upcoming batches for the activities feed
      const allBatchesRes = await batchService.getAll();
      const allBatches = allBatchesRes.data.batches || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const upcoming: RecentActivity[] = allBatches
        .filter((b: any) => {
          if (!b.startDate) return false;
          const sDate = new Date(b.startDate);
          return sDate >= today && sDate <= nextWeek;
        })
        .map((b: any) => ({
          id: b._id,
          type: 'notification',
          title: `Batch Starting Soon: ${b.name}`,
          description: `Code: ${b.code} | Starts on ${new Date(b.startDate).toLocaleDateString()}`,
          timestamp: 'Upcoming'
        }));

      setRecentActivities(upcoming);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const res = await syncService.syncData();
      toast.success(res.data.message || 'Sync complete');
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      sho: 'Student Happiness Officer',
      ssho: 'Senior SHO',
      academic: 'Academic Lead',
      mentor: 'Mentor',
      leadership: 'Leadership',
      admin: 'Administrator',
      ceo_haca: 'CEO',
      pl: 'Project Lead'
    };
    return labels[role] || role;
  };

  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      student: GraduationCap,
      attendance: CalendarCheck,
      assignment: ClipboardList,
      feedback: Star,
      notification: Bell,
    };
    const Icon = iconMap[type] || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      student: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      attendance: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      assignment: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      feedback: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      notification: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-600';
  };

  const quickActions = [
    { label: 'Mark Attendance', icon: CalendarCheck, path: '/attendance', roles: ['sho'] },
    { label: 'Projects', icon: ClipboardList, path: '/assignments', roles: [] },
    { label: 'Send Notice', icon: Bell, path: '/notifications', roles: ['sho', 'ssho', 'academic', 'leadership', 'admin', 'ceo_haca', 'pl'] },
    { label: 'Feedback', icon: MessageSquare, path: '/feedback', roles: [] },
    { label: 'Students', icon: GraduationCap, path: '/students', roles: [] },
{ label: 'Class Planner', icon: CalendarDays, path: '/class-planner', roles: [] },
    { label: 'Analytics', icon: TrendingUp, path: '/analytics', roles: [] },
    { label: 'Add User', icon: UserPlus, path: '/users', roles: ['leadership', 'admin', 'ceo_haca'] },
  ].filter(action => action.roles.length === 0 || hasRole(action.roles));

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-6 w-40 bg-muted rounded-full mb-4 animate-pulse" />
          <div className="h-8 w-72 bg-muted rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-52 bg-muted rounded animate-pulse" />
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 h-60 bg-muted rounded-xl animate-pulse" />
          <div className="lg:col-span-2 h-60 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Batches',
      value: stats?.totalBatches || 0,
      subtitle: hasRole(['sho', 'mentor']) ? 'Assigned to you' : 'Total batches',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
      accent: 'card-accent-blue',
    },
    {
      label: 'Students',
      value: stats?.totalStudents || 0,
      subtitle: `${stats?.activeStudents || 0} active · ${stats?.placedStudents || 0} placed`,
      icon: GraduationCap,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      accent: 'card-accent-emerald',
    },
    ...(hasRole(['leadership', 'admin', 'ssho', 'academic', 'mentor', 'ceo_haca', 'pl'])
      ? [{
        label: 'Schools',
        value: stats?.totalSchools || 0,
        subtitle: 'Partner institutions',
        icon: School,
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-500/10',
        accent: 'card-accent-violet',
      }]
      : [{
        label: 'Attendance',
        value: `${stats?.averageAttendance?.toFixed(0) || 0}%`,
        subtitle: 'Average across batches',
        icon: CalendarCheck,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10',
        accent: 'card-accent-amber',
        hasProgress: true,
        progressValue: stats?.averageAttendance || 0,
      }]
    ),
    {
      label: 'Feedback',
      value: `${stats?.averageFeedbackScore?.toFixed(1) || 0}/5`,
      subtitle: 'Average rating',
      icon: Star,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      accent: 'card-accent-amber',
      hasProgress: true,
      progressValue: (stats?.averageFeedbackScore || 0) * 20,
    },
  ];

  return (



    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400 text-xs font-medium mb-4 shadow-sm">
            <CalendarDays className="h-3.5 w-3.5" />
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            <span className="mx-1 opacity-40">|</span>
            <span className="tabular-nums font-semibold tracking-wide">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {getRoleLabel(user?.role || '')}
            {(user as any)?.school ? (
              <> · <span className="font-medium text-foreground/70">{(user as any).school}</span></>
            ) : null}
            {' '}· Welcome to your dashboard
          </p>
        </div>

        {hasRole(['leadership', 'admin', 'ceo_haca']) && (
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/20"
          >
            {isSyncing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Syncing...</>
            ) : (
              <><RefreshCw className="h-4 w-4" /> Sync from Sales CRM</>
            )}
          </Button>
        )}
      </div>

      {/* ── Upcoming Batches Alert (2 days before start) ── */}
      {upcomingBatches.length > 0 && (
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              {upcomingBatches.length} Batch{upcomingBatches.length > 1 ? 'es' : ''} Starting Within 2 Days
            </div>
          </div>
          <div className="space-y-3">
            {upcomingBatches.map((batch: any) => (
              <Card key={batch._id} className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-900/10">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{batch.name}</h3>
                        <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600">{batch.code}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        🏫 {batch.school?.name} &nbsp;·&nbsp;
                        📅 Starts: <strong>{new Date(batch.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {batch.assignedSHO && (
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px]">SHO</Badge>
                          {batch.assignedSHO.name}
                        </span>
                      )}
                      {batch.assignedSSHO && (
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px]">SSHO</Badge>
                          {batch.assignedSSHO.name}
                        </span>
                      )}
                      <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-0 text-[10px]">
                        {batch.students?.length || 0} Students
                      </Badge>
                    </div>
                  </div>

                  {/* Students list toggle */}
                  {batch.students?.length > 0 && (
                    <>
                      <button
                        onClick={() => setExpandedBatch(expandedBatch === batch._id ? null : batch._id)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ChevronRight className={`h-3 w-3 transition-transform ${expandedBatch === batch._id ? 'rotate-90' : ''}`} />
                        {expandedBatch === batch._id ? 'Hide' : 'Show'} {batch.students.length} students
                      </button>
                      {expandedBatch === batch._id && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {batch.students.map((st: any) => (
                            <div key={st._id} className="flex flex-col gap-0.5 bg-background/60 rounded-md p-2 border border-border/40 text-xs">
                              <span className="font-medium">{st.name}</span>
                              {st.email && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Mail className="h-3 w-3" />{st.email}
                                </span>
                              )}
                              {st.mobileNumber && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Phone className="h-3 w-3" />{st.mobileNumber}
                                </span>
                              )}
                              {st.qualification && (
                                <span className="text-muted-foreground/70">{st.qualification}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={`animate-slide-up border-border/60 card-hover overflow-hidden ${(stat as any).accent}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="section-title">{stat.label}</span>
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
                  </div>
                </div>
                <div className="stat-number">{stat.value}</div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{stat.subtitle}</p>
                {(stat as any).hasProgress && (
                  <Progress value={(stat as any).progressValue || 0} className="mt-2.5 h-1" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Quick Actions */}
        <Card className="lg:col-span-3 animate-slide-up border-border/60" style={{ animationDelay: '0.15s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickActions.slice(0, 8).map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.path} to={action.path}>
                    <div className="group rounded-lg border border-border/50 p-3 hover:bg-accent/50 transition-all duration-150 cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-xs font-medium">{action.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 animate-slide-up border-border/60" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-foreground">
                View All <ChevronRight className="ml-0.5 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight">{activity.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{activity.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Student Status */}
        <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.25s' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Student Distribution</CardTitle>
              <Link to="/students">
                <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground">
                  View <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Active', value: stats?.activeStudents || 0, total: stats?.totalStudents || 1, color: 'bg-emerald-500' },
                { label: 'Placed', value: stats?.placedStudents || 0, total: stats?.totalStudents || 1, color: 'bg-blue-500' },
                { label: 'Interview Req.', value: stats?.interviewRequired || 0, total: stats?.totalStudents || 1, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-24">{item.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                  <Badge variant="secondary" className="min-w-[28px] justify-center text-[11px] font-medium h-5">
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Project Completion', value: stats?.assignmentCompletionRate || 0, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Average Attendance', value: stats?.averageAttendance || 0, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Feedback Score', value: (stats?.averageFeedbackScore || 0) * 20, color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Overall Performance', value: 0, color: 'text-violet-600 dark:text-violet-400' },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium">{metric.label}</span>
                    <span className={`text-xs font-semibold tabular-nums ${metric.color}`}>
                      {metric.value.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={metric.value} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

  );
}
