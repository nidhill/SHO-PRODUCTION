import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Loader2, Plus, Trash2, GraduationCap, Search,
  Users, UserPlus, Layers,
} from 'lucide-react';
import { batchService, studentService, schoolService } from '@/services/api';
import type { Batch, Student, School } from '@/types';
import { toast } from 'sonner';

const INITIAL_BATCH_FORM = {
  name: '',
  code: '',
  school: '',
  startDate: '',
  endDate: '',
  status: 'active' as 'active' | 'on_hold' | 'completed',
};

const INITIAL_STUDENT_FORM = {
  name: '',
  email: '',
  age: '',
  qualification: '',
  address: '',
  place: '',
  mobileNumber: '',
  parentGuardianNumber: '',
  careerDreamsGoals: '',
  batch: '',
  school: '',
};

export default function AcademicLeadManagement() {
  const [tab, setTab] = useState<'batches' | 'students'>('batches');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [batchSearch, setBatchSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // Create Batch
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [batchForm, setBatchForm] = useState(INITIAL_BATCH_FORM);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);

  // Create Student
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [studentForm, setStudentForm] = useState(INITIAL_STUDENT_FORM);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'batch' | 'student'; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [batchRes, studentRes, schoolRes] = await Promise.all([
        batchService.getAll(),
        studentService.getAll(),
        schoolService.getAll(),
      ]);
      setBatches(batchRes.data.batches || []);
      setStudents(studentRes.data.students || []);
      setSchools(schoolRes.data.schools || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentBatchChange = (batchId: string) => {
    const batch = batches.find(b => b._id === batchId);
    setStudentForm(f => ({
      ...f,
      batch: batchId,
      school: (batch?.school as any)?._id || batch?.school as any || f.school,
    }));
  };

  const handleCreateBatch = async () => {
    if (!batchForm.name || !batchForm.code || !batchForm.school || !batchForm.startDate) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsCreatingBatch(true);
    try {
      await batchService.create(batchForm);
      toast.success('Batch created successfully');
      setShowCreateBatch(false);
      setBatchForm(INITIAL_BATCH_FORM);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create batch');
    } finally {
      setIsCreatingBatch(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!studentForm.name || !studentForm.mobileNumber || !studentForm.batch) {
      toast.error('Name, mobile number, and batch are required');
      return;
    }
    setIsCreatingStudent(true);
    try {
      await studentService.create({
        ...studentForm,
        age: studentForm.age ? Number(studentForm.age) : undefined,
      });
      toast.success('Student created successfully');
      setShowCreateStudent(false);
      setStudentForm(INITIAL_STUDENT_FORM);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create student');
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'batch') {
        await batchService.delete(deleteTarget.id);
        toast.success('Batch deleted');
      } else {
        await studentService.delete(deleteTarget.id);
        toast.success('Student deleted');
      }
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBatches = batches.filter(b =>
    !batchSearch ||
    b.name.toLowerCase().includes(batchSearch.toLowerCase()) ||
    b.code.toLowerCase().includes(batchSearch.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    !studentSearch ||
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.mobileNumber?.includes(studentSearch)
  );

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
        <h1 className="text-2xl font-semibold tracking-tight">Academic Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and delete batches and students
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="border-border/60 animate-slide-up">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Batches</p>
              <p className="text-2xl font-bold">{batches.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Students</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'batches' | 'students')}>
        <TabsList className="mb-4">
          <TabsTrigger value="batches" className="gap-2 text-sm">
            <Users className="h-3.5 w-3.5" />
            Batches
            <span className="ml-1 text-[11px] font-semibold opacity-60">({batches.length})</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2 text-sm">
            <GraduationCap className="h-3.5 w-3.5" />
            Students
            <span className="ml-1 text-[11px] font-semibold opacity-60">({students.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Batches Tab ──────────────────────────────────────────────── */}
        <TabsContent value="batches">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search batches…"
                value={batchSearch}
                onChange={e => setBatchSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button size="sm" onClick={() => setShowCreateBatch(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" /> New Batch
            </Button>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Batch</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">School</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Students</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map(batch => (
                    <TableRow key={batch._id} className="group">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{batch.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{batch.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{batch.school?.name || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            batch.status === 'active' ? 'default' :
                            batch.status === 'on_hold' ? 'outline' : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {batch.status === 'on_hold' ? 'On Hold' :
                            batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium">{batch.totalStudents ?? 0}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          onClick={() => setDeleteTarget({ type: 'batch', id: batch._id, name: batch.name })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredBatches.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">No batches found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {batchSearch ? 'Try adjusting your search' : 'Create your first batch using the button above'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Students Tab ─────────────────────────────────────────────── */}
        <TabsContent value="students">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students…"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button size="sm" onClick={() => setShowCreateStudent(true)} className="gap-2 shrink-0">
              <UserPlus className="h-4 w-4" /> New Student
            </Button>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Student</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Batch</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Mobile</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(student => (
                    <TableRow key={student._id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-[11px] text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{student.batch?.name || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono">{student.mobileNumber}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.status === 'active' ? 'default' :
                            student.status === 'placed' ? 'secondary' :
                            student.status === 'revoked' ? 'destructive' : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {student.status === 'interview_required' ? 'Interview Req.' :
                            student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          onClick={() => setDeleteTarget({ type: 'student', id: student._id, name: student.name })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">No students found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {studentSearch ? 'Try adjusting your search' : 'Add a new student using the button above'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Create Batch Dialog ──────────────────────────────────────── */}
      <Dialog open={showCreateBatch} onOpenChange={(open) => { if (!open) { setShowCreateBatch(false); setBatchForm(INITIAL_BATCH_FORM); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create New Batch
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Batch Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Batch 2024-A"
                  value={batchForm.name}
                  onChange={e => setBatchForm(f => ({ ...f, name: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Code <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. B24A"
                  value={batchForm.code}
                  onChange={e => setBatchForm(f => ({ ...f, code: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                School <span className="text-destructive">*</span>
              </label>
              <Select value={batchForm.school} onValueChange={v => setBatchForm(f => ({ ...f, school: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select school…" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map(s => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Start Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={batchForm.startDate}
                  onChange={e => setBatchForm(f => ({ ...f, startDate: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">End Date</label>
                <Input
                  type="date"
                  value={batchForm.endDate}
                  onChange={e => setBatchForm(f => ({ ...f, endDate: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Status</label>
              <Select value={batchForm.status} onValueChange={v => setBatchForm(f => ({ ...f, status: v as any }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateBatch(false); setBatchForm(INITIAL_BATCH_FORM); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateBatch} disabled={isCreatingBatch}>
              {isCreatingBatch
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</>
                : 'Create Batch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Student Dialog ────────────────────────────────────── */}
      <Dialog open={showCreateStudent} onOpenChange={(open) => { if (!open) { setShowCreateStudent(false); setStudentForm(INITIAL_STUDENT_FORM); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Create New Student
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Student name"
                  value={studentForm.name}
                  onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={studentForm.email}
                  onChange={e => setStudentForm(f => ({ ...f, email: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Mobile Number <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Mobile number"
                  value={studentForm.mobileNumber}
                  onChange={e => setStudentForm(f => ({ ...f, mobileNumber: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Parent/Guardian Number
                </label>
                <Input
                  placeholder="Parent number"
                  value={studentForm.parentGuardianNumber}
                  onChange={e => setStudentForm(f => ({ ...f, parentGuardianNumber: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Age</label>
                <Input
                  type="number"
                  placeholder="Age"
                  value={studentForm.age}
                  onChange={e => setStudentForm(f => ({ ...f, age: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Qualification</label>
                <Input
                  placeholder="e.g. B.Tech"
                  value={studentForm.qualification}
                  onChange={e => setStudentForm(f => ({ ...f, qualification: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Address</label>
                <Input
                  placeholder="Address"
                  value={studentForm.address}
                  onChange={e => setStudentForm(f => ({ ...f, address: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Place</label>
                <Input
                  placeholder="Place"
                  value={studentForm.place}
                  onChange={e => setStudentForm(f => ({ ...f, place: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Assign to Batch <span className="text-destructive">*</span>
              </label>
              <Select value={studentForm.batch} onValueChange={handleStudentBatchChange}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select batch…" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map(b => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.name} <span className="text-muted-foreground">({b.code})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Career Dreams & Goals</label>
              <Input
                placeholder="e.g. Software Engineer at a product company"
                value={studentForm.careerDreamsGoals}
                onChange={e => setStudentForm(f => ({ ...f, careerDreamsGoals: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateStudent(false); setStudentForm(INITIAL_STUDENT_FORM); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateStudent} disabled={isCreatingStudent}>
              {isCreatingStudent
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</>
                : 'Create Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.type === 'batch' ? 'Batch' : 'Student'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              {deleteTarget?.type === 'batch' && ' This may affect associated students and records.'}
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting…</>
                : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
