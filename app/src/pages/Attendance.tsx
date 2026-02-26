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
  Save
} from 'lucide-react';
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

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedBatch, selectedDate]);

  const fetchBatches = async () => {
    try {
      const response = await batchService.getAll();
      setBatches(response.data.batches);
      if (!batchParam && response.data.batches.length > 0) {
        setSelectedBatch(response.data.batches[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load batches');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await batchService.getStudents(selectedBatch);
      setStudents(response.data.students);

      const initialAttendance: Record<string, AttendanceRecord> = {};
      response.data.students.forEach((student: Student) => {
        initialAttendance[student._id] = {
          student,
          status: 'present',
          remarks: ''
        };
      });
      setAttendance(initialAttendance);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const response = await attendanceService.getByBatch(
        selectedBatch,
        selectedDate.toISOString()
      );

      if (response.data.attendance?.length > 0) {
        const existing = response.data.attendance[0];
        setExistingAttendance(existing);

        const updatedAttendance: Record<string, AttendanceRecord> = { ...attendance };
        existing.students.forEach((record: any) => {
          if (updatedAttendance[record.student._id]) {
            updatedAttendance[record.student._id] = {
              student: record.student,
              status: record.status,
              remarks: record.remarks || ''
            };
          }
        });
        setAttendance(updatedAttendance);
      } else {
        setExistingAttendance(null);
      }
    } catch (error) {
      console.error('Failed to fetch existing attendance');
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
      toast.success('Attendance saved successfully');
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

            {existingAttendance && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Attendance already marked for this date
              </div>
            )}
          </div>

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
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background">
                            <span className="font-medium">{student.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={attendance[student._id]?.status || 'present'}
                          onValueChange={(value: any) => handleStatusChange(student._id, value)}
                        >
                          <SelectTrigger className="w-32">
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
                        <input
                          type="text"
                          placeholder="Add remarks..."
                          value={attendance[student._id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
        </div>
      
  );
}
