import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft, Search, Users, GraduationCap, CalendarCheck,
  ClipboardList, Star, Loader2, School, ExternalLink,
} from 'lucide-react';
import { batchService } from '@/services/api';
import type { Batch, Student } from '@/types';

const statusVariant = (status: string) => {
  switch (status) {
    case 'placed': return 'default';
    case 'active': return 'secondary';
    case 'interview_required': return 'outline';
    case 'revoked': return 'destructive';
    default: return 'outline';
  }
};

export default function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [batchRes, studentsRes] = await Promise.all([
          batchService.getById(id),
          batchService.getStudents(id),
        ]);
        setBatch(batchRes.data);
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data?.students || []);
      } catch {
        // batch not found or error — go back
        navigate('/batches');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const filtered = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!batch) return null;

  return (
    <div className="p-6 space-y-6 animate-slide-up">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/batches')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{batch.name}</h1>
          <p className="text-xs text-muted-foreground">{batch.code}</p>
        </div>
        <Badge
          variant={batch.status === 'active' ? 'default' : batch.status === 'completed' ? 'secondary' : 'outline'}
          className="ml-2 text-[10px]"
        >
          {batch.status}
        </Badge>
      </div>

      {/* Batch Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Students</span>
            </div>
            <p className="text-2xl font-bold">{students.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Attendance</span>
            </div>
            <p className="text-2xl font-bold">{batch.averageAttendance?.toFixed(0) || 0}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Assignments</span>
            </div>
            <p className="text-2xl font-bold">{batch.assignmentCompletionRate?.toFixed(0) || 0}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Feedback</span>
            </div>
            <p className="text-2xl font-bold">{batch.averageFeedbackScore?.toFixed(1) || '—'}/5</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch meta */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {batch.school && (
          <span className="flex items-center gap-1.5">
            <School className="h-3.5 w-3.5" />
            {batch.school.name}
          </span>
        )}
        {batch.assignedSHO && (
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            SHO: <span className="font-medium text-foreground/80 ml-0.5">{batch.assignedSHO.name}</span>
          </span>
        )}
        {(batch as any).assignedSSHO && (
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            SSHO: <span className="font-medium text-foreground/80 ml-0.5">{(batch as any).assignedSSHO.name}</span>
          </span>
        )}
      </div>

      {/* Students table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Students in this batch</h2>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <Card className="border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Attendance</TableHead>
                <TableHead className="text-xs">Assignments</TableHead>
                <TableHead className="text-xs">Performance</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    {searchQuery ? 'No students match your search.' : 'No students in this batch yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student) => {
                  const attendance = student.attendanceSummary?.percentage ?? 0;
                  const assignments = student.assignmentSummary?.completionRate ?? 0;
                  const performance = student.overallPerformance ?? 0;
                  return (
                    <TableRow key={student._id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-[11px] text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(student.status)} className="text-[10px] capitalize">
                          {student.status?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <Progress value={attendance} className="h-1.5 flex-1" />
                          <span className="text-[11px] tabular-nums w-8 text-right">{attendance.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <Progress value={assignments} className="h-1.5 flex-1" />
                          <span className="text-[11px] tabular-nums w-8 text-right">{assignments.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{performance.toFixed(1)}</span>
                      </TableCell>
                      <TableCell>
                        <Link to={`/students/${student._id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
