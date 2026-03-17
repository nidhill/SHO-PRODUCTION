import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  UserCog,
  Check,
  X,
  UserPlus,
  UserMinus,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { batchService, userService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Batch } from '@/types';
import { toast } from 'sonner';

const MANAGER_ROLES = ['ssho', 'academic', 'pl', 'ceo_haca', 'admin', 'leadership'];

export default function Batches() {
  const { hasRole, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const canManage = hasRole(MANAGER_ROLES);
  const canCreateMentor = hasRole(['ssho', 'academic', 'pl', 'leadership', 'admin', 'ceo_haca']);

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

  // Change SHO state
  const [changeSHOBatch, setChangeSHOBatch] = useState<Batch | null>(null);
  const [shoUsers, setShoUsers] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [selectedSHOId, setSelectedSHOId] = useState('');
  const [isChangingSHO, setIsChangingSHO] = useState(false);
  const [isLoadingSHOUsers, setIsLoadingSHOUsers] = useState(false);

  // Manage Mentors state
  const [mentorBatch, setMentorBatch] = useState<Batch | null>(null);
  const [availableMentors, setAvailableMentors] = useState<{ _id: string; name: string; email: string; school: string }[]>([]);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const [removingMentorId, setRemovingMentorId] = useState<string | null>(null);
  const [addingMentorId, setAddingMentorId] = useState<string | null>(null);

  // Create new mentor inline form
  const [showCreateMentor, setShowCreateMentor] = useState(false);
  const [newMentor, setNewMentor] = useState({ name: '', email: '', phone: '', subject: '' });
  const [isCreatingMentor, setIsCreatingMentor] = useState(false);

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

  // ── Change SHO Handlers ───────────────────────────────
  const openChangeSHO = async (batch: Batch) => {
    setChangeSHOBatch(batch);
    setSelectedSHOId((batch.assignedSHO as any)?._id || batch.assignedSHO?.id || '');
    setIsLoadingSHOUsers(true);
    try {
      const res = await userService.getAll();
      const allUsers: any[] = res.data.users || [];
      // Filter SHO role and same school name
      const schoolName = batch.school?.name || '';
      const filtered = allUsers.filter(
        u => u.role === 'sho' && u.school === schoolName
      );
      setShoUsers(filtered);
    } catch {
      toast.error('Failed to load SHO users');
    } finally {
      setIsLoadingSHOUsers(false);
    }
  };

  const handleChangeSHO = async () => {
    if (!changeSHOBatch) return;
    setIsChangingSHO(true);
    try {
      await batchService.assignSHO(changeSHOBatch._id, selectedSHOId === 'none' || !selectedSHOId ? null : selectedSHOId);
      toast.success('SHO updated successfully');
      setChangeSHOBatch(null);
      fetchBatches();
    } catch {
      toast.error('Failed to update SHO');
    } finally {
      setIsChangingSHO(false);
    }
  };

  // ── Manage Mentors Handlers ───────────────────────────
  const openManageMentors = async (batch: Batch) => {
    setMentorBatch(batch);
    setIsLoadingMentors(true);
    try {
      const res = await userService.getAll();
      const allUsers: any[] = res.data.users || [];
      const schoolName = batch.school?.name || '';
      const mentors = allUsers.filter(u => u.role === 'mentor' && u.school === schoolName);
      setAvailableMentors(mentors);
    } catch {
      toast.error('Failed to load mentors');
    } finally {
      setIsLoadingMentors(false);
    }
  };

  const handleAddMentor = async (userId: string) => {
    if (!mentorBatch) return;
    setAddingMentorId(userId);
    try {
      await batchService.addMentor(mentorBatch._id, userId);
      toast.success('Mentor added');
      // Optimistically update local mentorBatch
      const user = availableMentors.find(u => u._id === userId);
      if (user) {
        setMentorBatch(prev => prev ? {
          ...prev,
          assignedMentors: [...(prev.assignedMentors || []), user as any]
        } : prev);
      }
      fetchBatches();
    } catch {
      toast.error('Failed to add mentor');
    } finally {
      setAddingMentorId(null);
    }
  };

  const handleRemoveMentor = async (userId: string) => {
    if (!mentorBatch) return;
    setRemovingMentorId(userId);
    try {
      await batchService.removeMentor(mentorBatch._id, userId);
      toast.success('Mentor removed');
      setMentorBatch(prev => prev ? {
        ...prev,
        assignedMentors: (prev.assignedMentors || []).filter((m: any) => m._id !== userId)
      } : prev);
      fetchBatches();
    } catch {
      toast.error('Failed to remove mentor');
    } finally {
      setRemovingMentorId(null);
    }
  };

  const handleCreateMentor = async () => {
    if (!mentorBatch || !newMentor.name || !newMentor.email) return;
    setIsCreatingMentor(true);
    try {
      const schoolName = mentorBatch.school?.name || (currentUser as any)?.school || '';
      const res = await userService.create({
        name: newMentor.name,
        email: newMentor.email,
        phone: newMentor.phone,
        subject: newMentor.subject,
        role: 'mentor',
        school: schoolName,
        password: 'password',
      });
      const createdUser = res.data.user;
      // Assign to batch immediately
      await batchService.addMentor(mentorBatch._id, createdUser.id || createdUser._id);
      toast.success(`Mentor "${newMentor.name}" created and assigned`);
      setNewMentor({ name: '', email: '', phone: '', subject: '' });
      setShowCreateMentor(false);
      // Refresh available mentors list & batch
      const usersRes = await userService.getAll();
      const allUsers: any[] = usersRes.data.users || [];
      const schoolMentors = allUsers.filter(u => u.role === 'mentor' && u.school === schoolName);
      setAvailableMentors(schoolMentors);
      setMentorBatch(prev => prev ? {
        ...prev,
        assignedMentors: [...(prev.assignedMentors || []), { _id: createdUser.id || createdUser._id, name: createdUser.name, email: createdUser.email } as any]
      } : prev);
      fetchBatches();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create mentor');
    } finally {
      setIsCreatingMentor(false);
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
          <Card
            key={batch._id}
            className="border-border/60 hover:border-primary/40 hover:shadow-sm transition-all group cursor-pointer"
            onClick={() => navigate(`/batches/${batch._id}`)}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                    {batch.code?.slice(0, 2) || 'B'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold truncate">{batch.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{batch.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
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
                        <DropdownMenuItem onClick={() => openChangeSHO(batch)}>
                          <UserCog className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          Change SHO
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openManageMentors(batch)}>
                          <UserPlus className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          Manage Mentors
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
                {batch.assignedMentors && batch.assignedMentors.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <UserPlus className="h-3 w-3" />
                    Mentors: <span className="font-medium text-foreground/80">{batch.assignedMentors.map((m: any) => m.name).join(', ')}</span>
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

              {/* Footer: start date + view indicator */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  {batch.startDate ? new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No start date'}
                </span>
                <span className="text-[10px] text-primary font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                  View students <ChevronRight className="h-3 w-3" />
                </span>
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

      {/* ── Change SHO Dialog ───────────────────────────── */}
      <Dialog open={!!changeSHOBatch} onOpenChange={() => setChangeSHOBatch(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <UserCog className="h-4 w-4 text-primary" /> Change SHO
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Batch info card */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 p-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                {changeSHOBatch?.code?.slice(0, 2) || 'B'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{changeSHOBatch?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                  <School className="h-2.5 w-2.5" /> {changeSHOBatch?.school?.name}
                </p>
              </div>
            </div>

            {/* SHO picker */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                SHOs in {changeSHOBatch?.school?.name}
              </p>
              {isLoadingSHOUsers ? (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-6">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
                  {/* Remove SHO option */}
                  <button
                    onClick={() => setSelectedSHOId('none')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                      selectedSHOId === 'none' || !selectedSHOId
                        ? 'border-destructive/40 bg-destructive/5 ring-1 ring-destructive/20'
                        : 'border-border/50 hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Remove SHO</span>
                  </button>

                  {shoUsers.map(u => {
                    const initials = u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                    const isSelected = selectedSHOId === u._id;
                    const isCurrent = (changeSHOBatch?.assignedSHO as any)?._id === u._id;
                    return (
                      <button
                        key={u._id}
                        onClick={() => setSelectedSHOId(u._id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border/50 hover:border-border hover:bg-muted/40'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/70'
                        }`}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">{u.name}</p>
                            {isCurrent && (
                              <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full shrink-0">current</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}

                  {shoUsers.length === 0 && (
                    <div className="text-center py-6">
                      <Users className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-xs text-muted-foreground">No SHOs found for this school</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-1">
            <Button variant="outline" size="sm" onClick={() => setChangeSHOBatch(null)}>Cancel</Button>
            <Button size="sm" onClick={handleChangeSHO} disabled={isChangingSHO || isLoadingSHOUsers}>
              {isChangingSHO
                ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Saving…</>
                : <><UserCog className="h-3.5 w-3.5 mr-2" />Update SHO</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Manage Mentors Dialog ───────────────────────── */}
      <Dialog open={!!mentorBatch} onOpenChange={() => setMentorBatch(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4 text-primary" /> Manage Mentors
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Batch info */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 p-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                {mentorBatch?.code?.slice(0, 2) || 'B'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{mentorBatch?.name}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <School className="h-2.5 w-2.5" /> {mentorBatch?.school?.name}
                </p>
              </div>
            </div>

            {/* Current mentors */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Assigned Mentors ({mentorBatch?.assignedMentors?.length || 0})
              </p>
              {mentorBatch?.assignedMentors && mentorBatch.assignedMentors.length > 0 ? (
                <div className="space-y-1.5">
                  {mentorBatch.assignedMentors.map((m: any) => {
                    const initials = m.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <div key={m._id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => handleRemoveMentor(m._id)}
                          disabled={removingMentorId === m._id}
                        >
                          {removingMentorId === m._id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <UserMinus className="h-3 w-3" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-2">No mentors assigned yet</p>
              )}
            </div>

            {/* Available mentors to add */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Add from {mentorBatch?.school?.name}
              </p>
              {isLoadingMentors ? (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : (() => {
                const assignedIds = new Set((mentorBatch?.assignedMentors || []).map((m: any) => m._id));
                const unassigned = availableMentors.filter(u => !assignedIds.has(u._id));
                return unassigned.length > 0 ? (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
                    {unassigned.map(u => {
                      const initials = u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                      return (
                        <div key={u._id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-foreground/70 shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{u.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                            onClick={() => handleAddMentor(u._id)}
                            disabled={addingMentorId === u._id}
                          >
                            {addingMentorId === u._id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <UserPlus className="h-3 w-3" />}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">
                      {availableMentors.length === 0 ? 'No mentors found for this school' : 'All mentors already assigned'}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Create new mentor form */}
            {canCreateMentor && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Create New Mentor
                  </p>
                  <button
                    onClick={() => { setShowCreateMentor(v => !v); setNewMentor({ name: '', email: '', phone: '', subject: '' }); }}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    {showCreateMentor ? <><X className="h-3 w-3" /> Cancel</> : <><UserPlus className="h-3 w-3" /> Add New</>}
                  </button>
                </div>

                {showCreateMentor && (
                  <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Full Name *</label>
                      <Input
                        placeholder="Mentor name"
                        value={newMentor.name}
                        onChange={e => setNewMentor(m => ({ ...m, name: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Email *</label>
                      <Input
                        type="email"
                        placeholder="mentor@example.com"
                        value={newMentor.email}
                        onChange={e => setNewMentor(m => ({ ...m, email: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Phone</label>
                      <Input
                        placeholder="9876543210"
                        value={newMentor.phone}
                        onChange={e => setNewMentor(m => ({ ...m, phone: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Subject</label>
                      <Input
                        placeholder="e.g. Mathematics, English…"
                        value={newMentor.subject}
                        onChange={e => setNewMentor(m => ({ ...m, subject: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Default password: <span className="font-mono font-semibold text-foreground/70">password</span> · School: <span className="font-medium text-foreground/70">{mentorBatch?.school?.name}</span>
                    </p>
                    <Button
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={handleCreateMentor}
                      disabled={isCreatingMentor || !newMentor.name || !newMentor.email}
                    >
                      {isCreatingMentor
                        ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Creating…</>
                        : <><UserPlus className="h-3.5 w-3.5 mr-2" />Create & Assign to Batch</>}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-1">
            <Button size="sm" variant="outline" onClick={() => { setMentorBatch(null); setShowCreateMentor(false); setNewMentor({ name: '', email: '', phone: '', subject: '' }); }}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
