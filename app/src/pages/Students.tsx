import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Loader2, Search, ExternalLink, Users, UserCheck, AlertCircle,
  Filter, GraduationCap, MoreHorizontal, ArrowRightLeft, CheckSquare, Square, X,
} from 'lucide-react';
import { studentService, batchService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Student, Batch } from '@/types';
import { toast } from 'sonner';

// Roles allowed to transfer students
const TRANSFER_ROLES = ['ssho', 'academic', 'pl', 'admin', 'leadership', 'ceo_haca'];

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  // Transfer state
  const [transferStudent, setTransferStudent] = useState<Student | null>(null);
  const [targetBatchId, setTargetBatchId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const canTransfer = user && TRANSFER_ROLES.includes(user.role);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === paginatedStudents.length ? [] : paginatedStudents.map(s => s._id));

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!selectedIds.length) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(selectedIds.map(id => studentService.updateStatus(id, newStatus)));
      toast.success(`Updated ${selectedIds.length} students to "${newStatus.replace('_', ' ')}"`);
      setSelectedIds([]);
      fetchData();
    } catch {
      toast.error('Bulk update failed');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [studentRes, batchRes] = await Promise.all([
        studentService.getAll(),
        batchService.getAll(),
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

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when filters change
  const handleSearchChange = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
  const handleStatusChange = (v: string) => { setStatusFilter(v); setCurrentPage(1); };
  const handleBatchChange = (v: string) => { setBatchFilter(v); setCurrentPage(1); };

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    placed: students.filter(s => s.status === 'placed').length,
    interviewReq: students.filter(s => s.status === 'interview_required').length,
  };

  // ── Transfer single student ─────────────────────────────
  const handleTransfer = async () => {
    if (!transferStudent || !targetBatchId) return;
    setIsTransferring(true);
    try {
      // Use student update endpoint to change batch directly
      await studentService.update(transferStudent._id, { batch: targetBatchId });
      // Recalculate student counts
      const srcBatch = transferStudent.batch?._id;
      if (srcBatch) {
        const srcCount = students.filter(s => s.batch?._id === srcBatch && s._id !== transferStudent._id).length;
        await batchService.update(srcBatch, { totalStudents: srcCount });
      }
      toast.success(`${transferStudent.name} moved to new batch ✅`);
      setTransferStudent(null);
      setTargetBatchId('');
      fetchData();
    } catch {
      toast.error('Transfer failed');
    } finally {
      setIsTransferring(false);
    }
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
      <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
        <div className="mb-6">
          <div className="h-7 w-32 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-52 bg-muted/60 animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
        <div className="h-12 bg-muted/60 animate-pulse rounded-xl mb-4" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track {students.length} students</p>
        </div>
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
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
              <Select value={batchFilter} onValueChange={handleBatchChange}>
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

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-2 bg-primary/5 border border-primary/20 rounded-lg animate-slide-up">
          <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>
          <span className="text-muted-foreground text-xs">— Set status to:</span>
          {(['active', 'placed', 'interview_required', 'revoked'] as const).map(s => (
            <Button key={s} size="sm" variant="outline" className="h-7 text-xs capitalize" disabled={isBulkUpdating}
              onClick={() => handleBulkStatusUpdate(s)}>
              {isBulkUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : s.replace('_', ' ')}
            </Button>
          ))}
          <Button size="sm" variant="ghost" className="h-7 ml-auto" onClick={() => setSelectedIds([])}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="border-border/60 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors">
                    {selectedIds.length === paginatedStudents.length && paginatedStudents.length > 0
                      ? <CheckSquare className="h-4 w-4 text-primary" />
                      : <Square className="h-4 w-4" />}
                  </button>
                </TableHead>
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
              {paginatedStudents.map((student) => (
                <TableRow key={student._id} className={`group ${selectedIds.includes(student._id) ? 'bg-primary/5' : ''}`}>
                  <TableCell className="w-10">
                    <button onClick={() => toggleSelect(student._id)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {selectedIds.includes(student._id)
                        ? <CheckSquare className="h-4 w-4 text-primary" />
                        : <Square className="h-4 w-4" />}
                    </button>
                  </TableCell>
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
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/students/${student._id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          View <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                      {canTransfer && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-xs gap-2 cursor-pointer"
                              onClick={() => { setTransferStudent(student); setTargetBatchId(''); }}
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                              Transfer to Another Batch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
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

          {/* Pagination */}
          {filteredStudents.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length} students
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) => p === '...'
                    ? <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                    : <Button
                        key={p}
                        variant={currentPage === p ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 w-7 p-0 text-xs"
                        onClick={() => setCurrentPage(p as number)}
                      >
                        {p}
                      </Button>
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Transfer Single Student Dialog ─────────────────── */}
      <Dialog open={!!transferStudent} onOpenChange={() => { setTransferStudent(null); setTargetBatchId(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Transfer Student
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Student info */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {transferStudent?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium">{transferStudent?.name}</p>
                <p className="text-xs text-muted-foreground">
                  Currently in: <span className="font-medium text-foreground">{transferStudent?.batch?.name || 'No batch'}</span>
                </p>
              </div>
            </div>

            {/* Target batch selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Transfer to Batch
              </label>
              <Select value={targetBatchId} onValueChange={setTargetBatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target batch…" />
                </SelectTrigger>
                <SelectContent>
                  {batches
                    .filter(b => b._id !== transferStudent?.batch?._id)
                    .map(b => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.name} <span className="text-muted-foreground">({b.code})</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {targetBatchId && (
              <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded px-3 py-2">
                ⚠️ <strong>{transferStudent?.name}</strong> will be moved from <strong>{transferStudent?.batch?.name}</strong> to <strong>{batches.find(b => b._id === targetBatchId)?.name}</strong>.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setTransferStudent(null); setTargetBatchId(''); }}>
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!targetBatchId || isTransferring}
            >
              {isTransferring
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Transferring…</>
                : <><ArrowRightLeft className="h-4 w-4 mr-2" />Confirm Transfer</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
