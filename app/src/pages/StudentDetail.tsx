import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, Loader2, User, Phone, MapPin, GraduationCap, Target,
  CalendarCheck, ClipboardList, MessageSquare, Presentation, Mic2,
  Brain, FileCheck, Users, Mail, Home, Pencil, Save,
} from 'lucide-react';
import { studentService } from '@/services/api';
import type { Student } from '@/types';
import { toast } from 'sonner';

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', email: '', mobileNumber: '', parentGuardianNumber: '',
    age: '', qualification: '', address: '', place: '',
    careerDreamsGoals: '', status: '',
  });

  const openEdit = () => {
    if (!student) return;
    setEditForm({
      name: student.name || '',
      email: student.email || '',
      mobileNumber: student.mobileNumber || '',
      parentGuardianNumber: student.parentGuardianNumber || '',
      age: student.age?.toString() || '',
      qualification: student.qualification || '',
      address: student.address || '',
      place: student.place || '',
      careerDreamsGoals: student.careerDreamsGoals || '',
      status: student.status || 'active',
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!student) return;
    setIsSaving(true);
    try {
      const payload = { ...editForm, age: Number(editForm.age) };
      const res = await studentService.update(student._id, payload);
      setStudent(res.data.student || { ...student, ...payload });
      toast.success('Student updated successfully ✅');
      setEditOpen(false);
      fetchStudent(student._id);
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const field = (key: keyof typeof editForm) => ({
    value: editForm[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEditForm(prev => ({ ...prev, [key]: e.target.value })),
  });

  useEffect(() => {
    if (id) fetchStudent(id);
  }, [id]);

  const fetchStudent = async (studentId: string) => {
    try {
      setIsLoading(true);
      const response = await studentService.getById(studentId);
      setStudent(response.data.student || null);
    } catch (error) {
      toast.error('Failed to load student details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string }> = {
      active: { variant: 'default', label: 'Active', color: 'bg-emerald-500' },
      placed: { variant: 'secondary', label: 'Placed', color: 'bg-blue-500' },
      interview_required: { variant: 'outline', label: 'Interview Required', color: 'bg-amber-500' },
      revoked: { variant: 'destructive', label: 'Revoked', color: 'bg-red-500' },
    };
    return config[status] || config.active;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Student Not Found</h2>
          <Link to="/students"><Button>Back to Students</Button></Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(student.status);

  return (



    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Back Button */}
      <Link to="/students">
        <Button variant="ghost" size="sm" className="mb-6 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Students
        </Button>
      </Link>

      {/* Student Profile Header */}
      <Card className="mb-6 border-border/60 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold">
              {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">{student.name}</h1>
                <Badge variant={statusConfig.variant} className="w-fit text-[10px] font-medium">
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{student.batch?.name} · {student.school?.name}</p>

              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {student.email}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {student.mobileNumber}
                </div>
              </div>
            </div>

            {/* Performance Score + Edit button */}
            <div className="flex flex-col items-end gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={openEdit}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <div className="text-center bg-muted/50 rounded-lg p-4 min-w-[90px]">
                <div className="stat-number text-gradient">{student.overallPerformance}%</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Overall Score</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="animate-slide-up">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
          <TabsTrigger value="personal" className="gap-1.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="cocurriculum" className="gap-1.5">
            <Presentation className="h-4 w-4" />
            <span className="hidden sm:inline">Co-Curriculum</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5">
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1.5">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Reviews</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Details Tab */}
        <TabsContent value="personal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: User, label: 'Full Name', value: student.name },
                  { icon: Mail, label: 'Email', value: student.email },
                  { icon: GraduationCap, label: 'Age', value: `${student.age} years` },
                  { icon: GraduationCap, label: 'Qualification', value: student.qualification },
                  { icon: Home, label: 'Address', value: student.address },
                  { icon: MapPin, label: 'Place', value: student.place },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-emerald-500" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mobile Number</p>
                      <p className="text-sm font-medium">{student.mobileNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Parent/Guardian Number</p>
                      <p className="text-sm font-medium">{student.parentGuardianNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Career Dreams & Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                    {student.careerDreamsGoals}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Co-Curriculum Tab */}
        <TabsContent value="cocurriculum">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Presentation Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Presentation className="h-5 w-5 text-blue-500" />
                  Presentation Sessions
                </CardTitle>
                <CardDescription>
                  {student.coCurriculum?.presentationSessions?.length || 0} sessions tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                {student.coCurriculum?.presentationSessions?.length ? (
                  <div className="space-y-3">
                    {student.coCurriculum.presentationSessions.map((session, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-blue-500">{session.score}/10</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.topic}</p>
                          <p className="text-xs text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={session.attended ? 'default' : 'destructive'} className="text-xs">
                          {session.attended ? 'Present' : 'Absent'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No sessions recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Communication Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic2 className="h-5 w-5 text-emerald-500" />
                  Communication Sessions
                </CardTitle>
                <CardDescription>
                  {student.coCurriculum?.communicationSessions?.length || 0} sessions tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                {student.coCurriculum?.communicationSessions?.length ? (
                  <div className="space-y-3">
                    {student.coCurriculum.communicationSessions.map((session, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-emerald-500">{session.score}/10</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.topic}</p>
                          <p className="text-xs text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={session.attended ? 'default' : 'destructive'} className="text-xs">
                          {session.attended ? 'Present' : 'Absent'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No sessions recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Personality Development */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Personality Development
                </CardTitle>
                <CardDescription>
                  {student.coCurriculum?.personalityDevelopment?.length || 0} sessions tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                {student.coCurriculum?.personalityDevelopment?.length ? (
                  <div className="space-y-3">
                    {student.coCurriculum.personalityDevelopment.map((session, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-purple-500">{session.score}/10</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.topic}</p>
                          <p className="text-xs text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={session.attended ? 'default' : 'destructive'} className="text-xs">
                          {session.attended ? 'Present' : 'Absent'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No sessions recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Mock Interviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-amber-500" />
                  Mock Interview Tracking
                </CardTitle>
                <CardDescription>
                  {student.coCurriculum?.mockInterviews?.length || 0} interviews conducted
                </CardDescription>
              </CardHeader>
              <CardContent>
                {student.coCurriculum?.mockInterviews?.length ? (
                  <div className="space-y-3">
                    {student.coCurriculum.mockInterviews.map((interview, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-amber-500">{interview.score}/10</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{interview.topic}</p>
                          <p className="text-xs text-muted-foreground">{new Date(interview.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={interview.attended ? 'default' : 'destructive'} className="text-xs">
                          {interview.attended ? 'Attended' : 'Missed'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No mock interviews conducted</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attendance %</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CalendarCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="stat-number">{student.attendanceSummary?.percentage?.toFixed(0)}%</div>
                <Progress value={student.attendanceSummary?.percentage || 0} className="mt-2 h-1" />
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Present Days</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CalendarCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="stat-number text-emerald-600 dark:text-emerald-400">{student.attendanceSummary?.presentDays}</div>
                <p className="text-[11px] text-muted-foreground mt-1">out of {student.attendanceSummary?.totalDays} total days</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Absent Days</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <CalendarCheck className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                </div>
                <div className="stat-number text-rose-600 dark:text-rose-400">{student.attendanceSummary?.absentDays}</div>
                <p className="text-[11px] text-muted-foreground mt-1">days missed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completion Rate</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="stat-number">{student.assignmentSummary?.completionRate?.toFixed(0)}%</div>
                <Progress value={student.assignmentSummary?.completionRate || 0} className="mt-2 h-1" />
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="stat-number text-emerald-600 dark:text-emerald-400">{student.assignmentSummary?.completedAssignments}</div>
                <p className="text-[11px] text-muted-foreground mt-1">out of {student.assignmentSummary?.totalAssignments} total</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="stat-number text-amber-600 dark:text-amber-400">{student.assignmentSummary?.pendingAssignments}</div>
                <p className="text-[11px] text-muted-foreground mt-1">assignments remaining</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="space-y-3">
            {student.coCurriculum?.reviews?.length ? (
              student.coCurriculum.reviews.map((review, idx) => (
                <Card key={idx} className="border-border/60">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm">
                        {review.overallScore.toFixed(1)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">Review by {review.reviewer}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{review.comments}</p>
                        {review.areasOfImprovement.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-muted-foreground">Areas to improve:</span>
                            {review.areasOfImprovement.map((area, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Reviews Yet</h3>
                <p className="text-muted-foreground">No reviews have been recorded for this student</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Edit Student Dialog ──────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Edit Student — {student?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Full Name</label>
              <Input {...field('name')} placeholder="Full name" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
              <Input {...field('email')} placeholder="Email" type="email" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Mobile Number</label>
              <Input {...field('mobileNumber')} placeholder="Mobile" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Parent / Guardian Number</label>
              <Input {...field('parentGuardianNumber')} placeholder="Parent number" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Age</label>
              <Input {...field('age')} placeholder="Age" type="number" min="10" max="60" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Qualification</label>
              <Input {...field('qualification')} placeholder="e.g. B.Com, B.Tech" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Address</label>
              <Input {...field('address')} placeholder="Address" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Place / City</label>
              <Input {...field('place')} placeholder="Place" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
              <Select value={editForm.status} onValueChange={v => setEditForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="placed">Placed</SelectItem>
                  <SelectItem value="interview_required">Interview Required</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Career Dreams &amp; Goals</label>
              <Textarea
                value={editForm.careerDreamsGoals}
                onChange={e => setEditForm(p => ({ ...p, careerDreamsGoals: e.target.value }))}
                placeholder="Student's career goals…"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
