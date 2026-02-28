import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CalendarCheck,
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Search,
  CheckSquare
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { attendanceService, batchService } from '@/services/api';
import type { Batch, Student } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
  student: Student;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks: string;
}

export default function Attendance() {
  const [searchParams] = useSearchParams();
  const batchParam = searchParams.get('batch');

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>(batchParam || '');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await batchService.getAll();
        setBatches(response.data.batches);
        if (!batchParam && response.data.batches.length > 0) {
          setSelectedBatch(response.data.batches[0]._id);
        }
      } catch (error) {
        toast.error('Failed to load batches');
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadBatchData();
    }
  }, [selectedBatch, selectedDate]);

  const loadBatchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Students
      const studentRes = await batchService.getStudents(selectedBatch);
      const fetchedStudents = studentRes.data.students || [];
      setStudents(fetchedStudents);

      // Create defaults
      const initialAttendance: Record<string, AttendanceRecord> = {};
      fetchedStudents.forEach((student: Student) => {
        initialAttendance[student._id] = {
          student,
          status: 'present',
          remarks: ''
        };
      });

      // 2. Fetch Existing Attendance for Today
      const attendanceRes = await attendanceService.getByBatch(
        selectedBatch,
        selectedDate.toISOString()
      );

      let savedAttendance = null;
      if (attendanceRes.data.attendance?.length > 0) {
        savedAttendance = attendanceRes.data.attendance[0];
        setExistingAttendance(savedAttendance);
        setIsEditing(false);

        // Merge saved data over defaults
        savedAttendance.students.forEach((record: any) => {
          if (initialAttendance[record.student._id]) {
            initialAttendance[record.student._id] = {
              student: record.student,
              status: record.status,
              remarks: record.remarks || ''
            };
          }
        });
      } else {
        setExistingAttendance(null);
        setIsEditing(true);
      }

      // Lock in state securely
      setAttendance(initialAttendance);

      // 3. Fetch History (last 5 records)
      const historyRes = await attendanceService.getByBatch(selectedBatch);
      if (historyRes.data.attendance) {
        // Sort descending by date and take top 5
        const sorted = historyRes.data.attendance.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(sorted.slice(0, 5));
      }

    } catch (error) {
      toast.error('Failed to load batch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleBulkMark = (status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendance(prev => {
      const next = { ...prev };
      // Only apply to the currently filtered students to allow "bulk marking a subset"
      filteredStudents.forEach(student => {
        if (next[student._id]) {
          next[student._id] = {
            ...next[student._id],
            status
          };
        }
      });
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const attendanceData = {
        batch: selectedBatch,
        date: selectedDate.toISOString(),
        students: Object.values(attendance).map(record => ({
          student: record.student._id,
          status: record.status,
          remarks: record.remarks
        }))
      };

      await attendanceService.mark(attendanceData);

      // Show big central success dialog instead of toast
      setShowSuccessDialog(true);

      // Refresh to update the existing attendance and recent history bar
      loadBatchData();
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = {
    present: Object.values(attendance).filter(a => a.status === 'present').length,
    absent: Object.values(attendance).filter(a => a.status === 'absent').length,
    late: Object.values(attendance).filter(a => a.status === 'late').length,
    excused: Object.values(attendance).filter(a => a.status === 'excused').length,
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'absent': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'late': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'excused': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return '';
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Mark and track student attendance
          </p>
        </div>

        {isEditing && (
          <Button onClick={handleSave} disabled={isSaving || !selectedBatch}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Attendance
              </>
            )}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger>
            <CalendarCheck className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select Batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.map(batch => (
              <SelectItem key={batch._id} value={batch._id}>{batch.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Already Marked Banner */}
      {existingAttendance && !isEditing && (
        <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-lg p-5 flex items-center gap-4">
          <div className="bg-green-500/20 p-2.5 rounded-full flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 tracking-tight">Attendance Already Marked!</h3>
            <p className="text-sm text-green-600/90 mt-0.5">
              This batch's attendance has already been securely logged for <span className="font-semibold">{format(selectedDate, 'MMMM do, yyyy')}</span>. It cannot be modified.
            </p>
          </div>
        </div>
      )}

      {/* Recent History Bar */}
      {history.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Recent History for this Batch
          </h3>
          <div className="flex flex-wrap gap-3">
            {history.map((record) => (
              <div
                key={record._id}
                onClick={() => setSelectedDate(new Date(record.date))}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer transition-colors shadow-sm",
                  format(selectedDate, 'yyyy-MM-dd') === format(new Date(record.date), 'yyyy-MM-dd')
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-muted"
                )}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{format(new Date(record.date), 'MMM d')}</span>
                <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-semibold", format(selectedDate, 'yyyy-MM-dd') === format(new Date(record.date), 'yyyy-MM-dd') ? "border-transparent bg-secondary text-secondary-foreground" : "")}>
                  {record.attendancePercentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Excused</p>
                <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">Student Roster</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              {filteredStudents.length > 0 && isEditing && (
                <Select disabled={!isEditing} onValueChange={(val: any) => handleBulkMark(val)} value="">
                  <SelectTrigger disabled={!isEditing} className="w-full sm:w-44 h-9 font-medium bg-primary/5 text-primary border-primary/20">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Mark All As..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">All Present</SelectItem>
                    <SelectItem value="absent">All Absent</SelectItem>
                    <SelectItem value="late">All Late</SelectItem>
                    <SelectItem value="excused">All Excused</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">Student Details</TableHead>
                  <TableHead className="w-[200px]">Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 && students.length > 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No students match your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm leading-tight">{student.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 tracking-tight">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          disabled={!isEditing}
                          value={attendance[student._id]?.status || 'present'}
                          onValueChange={(value: any) => handleStatusChange(student._id, value)}
                        >
                          <SelectTrigger disabled={!isEditing} className={cn("w-[140px] h-9 border disabled:opacity-80", getStatusColor(attendance[student._id]?.status || 'present'))}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          disabled={!isEditing}
                          type="text"
                          placeholder="Add optional remarks..."
                          value={attendance[student._id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          className="h-9 w-full sm:w-[300px] border-border/50 bg-background focus-visible:ring-1 focus-visible:ring-primary/30 disabled:opacity-80 disabled:select-none"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {students.length === 0 && (
        <div className="text-center py-12">
          <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No students found</h3>
          <p className="text-muted-foreground">
            Select a batch to view students
          </p>
        </div>
      )}

      {/* Central Screen Success Message */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Attendance Saved!</DialogTitle>
            <DialogDescription className="text-base mt-2">
              You have successfully logged attendance for <strong className="text-foreground">{batches.find(b => b._id === selectedBatch)?.name}</strong> on <strong className="text-foreground">{format(selectedDate, 'MMMM do, yyyy')}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 sm:justify-center w-full">
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full sm:w-3/4">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
