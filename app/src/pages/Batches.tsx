import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Users,
  TrendingUp,
  GraduationCap,
  Star,
  CalendarCheck,
  ClipboardList,
  School,
  Filter,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowRightLeft,
} from 'lucide-react';
import { batchService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Batch } from '@/types';
import { toast } from 'sonner';

const MANAGER_ROLES = ['ssho', 'academic', 'pl', 'ceo_haca', 'admin', 'leadership'];

export default function Batches() {
  const { hasRole } = useAuth();
  const canManage = hasRole(MANAGER_ROLES);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit state
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', status: 'active', startDate: '', endDate: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteBatch, setDeleteBatch] = useState<Batch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Transfer state
  const [transferBatch, setTransferBatch] = useState<Batch | null>(null);
  const [targetBatchId, setTargetBatchId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const response = await batchService.getAll();
      setBatches(response.data.batches || []);
    } catch {
      toast.error('Failed to load batches');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = !searchQuery ||
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.school?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: batches.length,
    active: batches.filter(b => b.status === 'active').length,
    completed: batches.filter(b => b.status === 'completed').length,
    totalStudents: batches.reduce((acc, b) => acc + (b.totalStudents || 0), 0),
  };

  // ── Edit Handlers ─────────────────────────────────────
  const openEdit = (batch: Batch) => {
    setEditBatch(batch);
    setEditForm({
      name: batch.name,
      code: batch.code,
      status: batch.status,
      startDate: batch.startDate ? batch.startDate.slice(0, 10) : '',
      endDate: batch.endDate ? batch.endDate.slice(0, 10) : '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editBatch) return;
    setIsSaving(true);
    try {
      await batchService.update(editBatch._id, editForm);
      toast.success('Batch updated successfully');
      setEditBatch(null);
      fetchBatches();
    } catch {
      toast.error('Failed to update batch');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete Handler ────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteBatch) return;
    setIsDeleting(true);
    try {
      await batchService.delete(deleteBatch._id);
      toast.success('Batch deleted');
      setDeleteBatch(null);
      fetchBatches();
    } catch {
      toast.error('Failed to delete batch');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Transfer Handler ──────────────────────────────────
  const handleTransfer = async () => {
    if (!transferBatch || !targetBatchId) return;
    setIsTransferring(true);
    try {
      const res = await batchService.transferStudents(transferBatch._id, targetBatchId);
      toast.success(res.data.message || 'Transfer complete');
      setTransferBatch(null);
      setTargetBatchId('');
      fetchBatches();
    } catch {
      toast.error('Failed to transfer students');
    } finally {
      setIsTransferring(false);
    }
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
        <h1 className="text-2xl font-semibold tracking-tight">Batches</h1>
        <p className="text-sm text-muted-foreground mt-1">Your assigned batches</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Active', value: stats.active, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Completed', value: stats.completed, icon: CalendarCheck, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Students', value: stats.totalStudents, icon: GraduationCap, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
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
                placeholder="Search by name, code, or school…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Batch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {filteredBatches.map((batch) => (
          <Card key={batch._id} className="border-border/60 hover:border-border transition-colors group">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                    {batch.code?.slice(0, 2) || 'B'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{batch.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{batch.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant={batch.status === 'active' ? 'default' : batch.status === 'completed' ? 'secondary' : 'outline'}
                    className="text-[10px] font-medium"
                  >
                    {batch.status}
                  </Badge>

                  {/* Actions Menu — only for managers */}
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openEdit(batch)}>
                          <Pencil className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          Edit Batch
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => { setTransferBatch(batch); setTargetBatchId(''); }}
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          Transfer Students
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteBatch(batch)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete Batch
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* School + Staff */}
              <div className="flex flex-col gap-1 text-[11px] text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <School className="h-3 w-3" />
                  {batch.school?.name || 'No school assigned'}
                </span>
                {batch.assignedSHO && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    SHO: <span className="font-medium text-foreground/80">{batch.assignedSHO.name}</span>
                  </span>
                )}
                {(batch as any).assignedSSHO && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    SSHO: <span className="font-medium text-foreground/80">{(batch as any).assignedSSHO.name}</span>
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <GraduationCap className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium">Students</span>
                  </div>
                  <p className="text-lg font-semibold">{batch.totalStudents}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium">Feedback</span>
                  </div>
                  <p className="text-lg font-semibold">{batch.averageFeedbackScore?.toFixed(1) || '—'}/5</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      <CalendarCheck className="h-2.5 w-2.5" /> Attendance
                    </span>
                    <span className="text-[10px] font-semibold tabular-nums">{batch.averageAttendance?.toFixed(0) || 0}%</span>
                  </div>
                  <Progress value={batch.averageAttendance || 0} className="h-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      <ClipboardList className="h-2.5 w-2.5" /> Assignments
                    </span>
                    <span className="text-[10px] font-semibold tabular-nums">{batch.assignmentCompletionRate?.toFixed(0) || 0}%</span>
                  </div>
                  <Progress value={batch.assignmentCompletionRate || 0} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBatches.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No batches found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* ── Edit Dialog ─────────────────────────────────── */}
      <Dialog open={!!editBatch} onOpenChange={() => setEditBatch(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Batch Name</label>
              <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Code</label>
              <Input value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
                <Input type="date" value={editForm.startDate} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
                <Input type="date" value={editForm.endDate} onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBatch(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ──────────────────────────────── */}
      <AlertDialog open={!!deleteBatch} onOpenChange={() => setDeleteBatch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteBatch?.name}</strong> and remove it from the dashboard.
              Students inside it will not be deleted, but they will be unassigned from this batch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Transfer Dialog ─────────────────────────────── */}
      <Dialog open={!!transferBatch} onOpenChange={() => { setTransferBatch(null); setTargetBatchId(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Transfer Students
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium">{transferBatch?.name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {transferBatch?.totalStudents} students will be transferred
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Transfer to Batch</label>
              <Select value={targetBatchId} onValueChange={setTargetBatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target batch…" />
                </SelectTrigger>
                <SelectContent>
                  {batches
                    .filter(b => b._id !== transferBatch?._id)
                    .map(b => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.name} <span className="text-muted-foreground text-xs ml-1">({b.code})</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ All students in <strong>{transferBatch?.name}</strong> will be moved to the selected batch.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTransferBatch(null); setTargetBatchId(''); }}>
              Cancel
            </Button>
            <Button onClick={handleTransfer} disabled={!targetBatchId || isTransferring}>
              {isTransferring
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Transferring…</>
                : <><ArrowRightLeft className="h-4 w-4 mr-2" />Transfer All Students</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
