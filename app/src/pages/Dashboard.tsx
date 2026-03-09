import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  UserCircle,
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
    { label: 'Mark Attendance', icon: CalendarCheck, path: '/attendance', roles: ['sho'], iconBg: 'bg-sky-500', iconShadow: 'shadow-sky-500/40' },
    { label: 'Assignments', icon: ClipboardList, path: '/assignments', roles: [], iconBg: 'bg-blue-600', iconShadow: 'shadow-blue-600/40' },
    { label: 'Send Notice', icon: Bell, path: '/notifications', roles: ['sho', 'ssho', 'academic', 'leadership', 'admin', 'ceo_haca', 'pl'], iconBg: 'bg-amber-500', iconShadow: 'shadow-amber-500/40' },
    { label: 'Feedback', icon: MessageSquare, path: '/feedback', roles: [], iconBg: 'bg-violet-600', iconShadow: 'shadow-violet-600/40' },
    { label: 'Students', icon: GraduationCap, path: '/students', roles: [], iconBg: 'bg-emerald-600', iconShadow: 'shadow-emerald-600/40' },
    { label: 'Groups', icon: UserCircle, path: '/groups', roles: [], iconBg: 'bg-teal-500', iconShadow: 'shadow-teal-500/40' },
    { label: 'Class Planner', icon: CalendarDays, path: '/class-planner', roles: [], iconBg: 'bg-indigo-600', iconShadow: 'shadow-indigo-600/40' },
    { label: 'Analytics', icon: TrendingUp, path: '/analytics', roles: [], iconBg: 'bg-indigo-500', iconShadow: 'shadow-indigo-500/40' },
    { label: 'Add User', icon: UserPlus, path: '/users', roles: ['leadership', 'admin', 'ceo_haca'], iconBg: 'bg-pink-600', iconShadow: 'shadow-pink-600/40' },
  ].filter(action => action.roles.length === 0 || hasRole(action.roles));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/30">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Loading your dashboard…</p>
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
      gradient: 'from-blue-500 to-blue-700',
      shadow: 'shadow-blue-500/30',
    },
    {
      label: 'Students',
      value: stats?.totalStudents || 0,
      subtitle: `${stats?.activeStudents || 0} active · ${stats?.placedStudents || 0} placed`,
      icon: GraduationCap,
      gradient: 'from-emerald-500 to-emerald-700',
      shadow: 'shadow-emerald-500/30',
    },
    ...(hasRole(['leadership', 'admin', 'ssho', 'academic', 'mentor', 'ceo_haca', 'pl'])
      ? [{
        label: 'Schools',
        value: stats?.totalSchools || 0,
        subtitle: 'Partner institutions',
        icon: School,
        gradient: 'from-violet-500 to-violet-700',
        shadow: 'shadow-violet-500/30',
      }]
      : [{
        label: 'Attendance',
        value: `${stats?.averageAttendance?.toFixed(0) || 0}%`,
        subtitle: 'Average across batches',
        icon: CalendarCheck,
        gradient: 'from-amber-400 to-orange-500',
        shadow: 'shadow-amber-400/30',
        hasProgress: true,
        progressValue: stats?.averageAttendance || 0,
      }]
    ),
    {
      label: 'Feedback',
      value: `${stats?.averageFeedbackScore?.toFixed(1) || 0}/5`,
      subtitle: 'Average rating',
      icon: Star,
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-400/30',
      hasProgress: true,
      progressValue: (stats?.averageFeedbackScore || 0) * 20,
    },
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/30 min-h-full">
      <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">

        {/* ── Welcome Header Banner ── */}
        <div className="mb-8 animate-fade-in">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 dark:from-slate-950 dark:via-blue-950/80 dark:to-indigo-950/80 p-6 lg:p-8 shadow-xl shadow-blue-900/20">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-indigo-500/10 rounded-full translate-y-1/2 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                {/* Date/time pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-4 backdrop-blur-sm">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-300" />
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  <span className="mx-1 opacity-40">|</span>
                  <span className="tabular-nums font-semibold tracking-wide text-white">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                    {user?.name?.split(' ')[0]}
                  </span>{' '}
                  <span className="text-2xl">👋</span>
                </h1>
                <p className="text-sm text-white/60 mt-2 font-medium">
                  {getRoleLabel(user?.role || '')}
                  {(user as any)?.school ? (
                    <> · <span className="text-white/80">{(user as any).school}</span></>
                  ) : null}
                  {' '}· Here's what's happening today.
                </p>
              </div>

              {hasRole(['leadership', 'admin', 'ceo_haca']) && (
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm shadow-lg transition-all duration-200 shrink-0"
                >
                  {isSyncing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Syncing from Sales...</>
                  ) : (
                    <><RefreshCw className="h-4 w-4" /> Sync Sales Data</>
                  )}
                </Button>
              )}
            </div>
          </div>
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

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`animate-slide-up relative rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 overflow-hidden shadow-lg ${stat.shadow} hover:scale-[1.02] transition-transform duration-200 cursor-default`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Giant background icon */}
                <Icon className="absolute -bottom-3 -right-3 h-24 w-24 text-white/10 rotate-[-10deg]" />

                <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-3">{stat.label}</p>
                <p className="text-4xl font-black text-white leading-none mb-2">{stat.value}</p>
                <p className="text-[11px] text-white/65 font-medium">{stat.subtitle}</p>

                {(stat as any).hasProgress && (
                  <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/70 rounded-full transition-all duration-700"
                      style={{ width: `${(stat as any).progressValue || 0}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Quick Actions */}
          <Card className="lg:col-span-3 animate-slide-up border-border/60 shadow-sm" style={{ animationDelay: '0.15s' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 inline-block" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.slice(0, 8).map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.path} to={action.path}>
                      <div className="group rounded-xl border border-border/50 bg-background p-3.5 hover:border-transparent hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                        <div className={`w-10 h-10 rounded-xl ${action.iconBg} shadow-md ${action.iconShadow} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground leading-tight">{action.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 animate-slide-up border-border/60 shadow-sm" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-rose-500 to-pink-600 inline-block" />
                Upcoming Batches
              </CardTitle>
              <Link to="/analytics">
                <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-foreground gap-0.5">
                  View All <ChevronRight className="ml-0.5 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-xs text-muted-foreground">No batches starting this week</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold leading-tight text-foreground/90">{activity.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{activity.description}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-medium uppercase tracking-wide">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Bottom Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

          {/* Student Distribution */}
          <Card className="animate-slide-up border-border/60 shadow-sm" style={{ animationDelay: '0.25s' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600 inline-block" />
                  Student Distribution
                </CardTitle>
                <Link to="/students">
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-foreground">
                    View <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {[
                  {
                    label: 'Active',
                    value: stats?.activeStudents || 0,
                    total: stats?.totalStudents || 1,
                    barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
                    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                    dot: 'bg-emerald-500',
                  },
                  {
                    label: 'Placed',
                    value: stats?.placedStudents || 0,
                    total: stats?.totalStudents || 1,
                    barColor: 'bg-gradient-to-r from-blue-600 to-blue-400',
                    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
                    dot: 'bg-blue-500',
                  },
                  {
                    label: 'Interview Req.',
                    value: stats?.interviewRequired || 0,
                    total: stats?.totalStudents || 1,
                    barColor: 'bg-gradient-to-r from-amber-500 to-amber-400',
                    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
                    dot: 'bg-amber-500',
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                        <span className="text-xs font-semibold text-foreground/80">{item.label}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeClass}`}>
                        {item.value}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.barColor} transition-all duration-700 shadow-sm`}
                        style={{ width: `${(item.value / item.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">
                      {item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}% of total
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card className="animate-slide-up border-border/60 shadow-sm" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600 inline-block" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {[
                  {
                    label: 'Assignment Completion',
                    value: stats?.assignmentCompletionRate || 0,
                    barColor: 'bg-gradient-to-r from-blue-600 to-blue-400',
                    textColor: 'text-blue-600 dark:text-blue-400',
                  },
                  {
                    label: 'Average Attendance',
                    value: stats?.averageAttendance || 0,
                    barColor: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
                    textColor: 'text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    label: 'Feedback Score',
                    value: (stats?.averageFeedbackScore || 0) * 20,
                    barColor: 'bg-gradient-to-r from-amber-500 to-orange-400',
                    textColor: 'text-amber-600 dark:text-amber-400',
                  },
                  {
                    label: 'Overall Performance',
                    value: 0,
                    barColor: 'bg-gradient-to-r from-violet-600 to-purple-400',
                    textColor: 'text-violet-600 dark:text-violet-400',
                  },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground/80">{metric.label}</span>
                      <span className={`text-xs font-black tabular-nums ${metric.textColor}`}>
                        {metric.value.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${metric.barColor} transition-all duration-700 shadow-sm`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
