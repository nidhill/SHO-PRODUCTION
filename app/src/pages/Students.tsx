import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Search,
  ExternalLink,
  Users,
  UserCheck,
  AlertCircle,
  Filter,
  GraduationCap
} from 'lucide-react';
import { studentService, batchService } from '@/services/api';
import type { Student, Batch } from '@/types';
import { toast } from 'sonner';

export default function Students() {
  const { } = useAuth();
      const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [studentRes, batchRes] = await Promise.all([
        studentService.getAll(),
        batchService.getAll()
      ]);
      setStudents(studentRes.data.students || []);
      setBatches(batchRes.data.batches || []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchQuery ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.mobileNumber?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesBatch = batchFilter === 'all' || student.batch?._id === batchFilter;
    return matchesSearch && matchesStatus && matchesBatch;
  });

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    placed: students.filter(s => s.status === 'placed').length,
    interviewReq: students.filter(s => s.status === 'interview_required').length,
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      placed: { variant: 'secondary', label: 'Placed' },
      interview_required: { variant: 'outline', label: 'Interview Req.' },
      revoked: { variant: 'destructive', label: 'Revoked' },
    };
    const { variant, label } = config[status] || config.active;
    return <Badge variant={variant} className="text-[10px] font-medium">{label}</Badge>;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    

      
        <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and track {students.length} students</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Placed', value: stats.placed, icon: GraduationCap, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
              { label: 'Interview Req.', value: stats.interviewReq, icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-border/60 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                        <p className="stat-number mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          <Card className="mb-4 border-border/60 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or mobile…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] h-9 text-sm">
                      <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="placed">Placed</SelectItem>
                      <SelectItem value="interview_required">Interview Req.</SelectItem>
                      <SelectItem value="revoked">Revoked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={batchFilter} onValueChange={setBatchFilter}>
                    <SelectTrigger className="w-[140px] h-9 text-sm">
                      <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <SelectValue placeholder="Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches.map(batch => (
                        <SelectItem key={batch._id} value={batch._id}>{batch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="border-border/60 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Student</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Batch</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Attendance</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Assignments</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Score</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student._id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-[11px] text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-muted-foreground">{student.batch?.name}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.attendanceSummary?.percentage || 0} className="h-1 w-14" />
                          <span className="text-xs font-medium tabular-nums">
                            {student.attendanceSummary?.percentage?.toFixed(0) || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.assignmentSummary?.completionRate || 0} className="h-1 w-14" />
                          <span className="text-xs font-medium tabular-nums">
                            {student.assignmentSummary?.completionRate?.toFixed(0) || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-semibold tabular-nums ${getPerformanceColor(student.overallPerformance || 0)}`}>
                          {student.overallPerformance}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/students/${student._id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            View <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">No students found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      
  );
}
