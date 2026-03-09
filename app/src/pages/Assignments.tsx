import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ClipboardList,
  Loader2,
  Plus,
  Calendar,
  FileText,
  Search,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { assignmentService, batchService } from '@/services/api';
import type { Assignment, Batch } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Assignments() {
      const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    batch: '',
    dueDate: '',
    totalMarks: 100
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchQuery, batchFilter, assignments]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assignmentsResponse, batchesResponse] = await Promise.all([
        assignmentService.getAll(),
        batchService.getAll()
      ]);
      setAssignments(assignmentsResponse.data.assignments);
      setFilteredAssignments(assignmentsResponse.data.assignments);
      setBatches(batchesResponse.data.batches);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    if (searchQuery) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (batchFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.batch?._id === batchFilter);
    }

    setFilteredAssignments(filtered);
  };

  const handleCreateAssignment = async () => {
    try {
      await assignmentService.create(newAssignment);
      toast.success('Assignment created successfully');
      setIsCreateDialogOpen(false);
      setNewAssignment({
        title: '',
        description: '',
        batch: '',
        dueDate: '',
        totalMarks: 100
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      closed: 'secondary',
      draft: 'outline'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getSubmissionStats = (assignment: Assignment) => {
    const totalStudents = assignment.batch?.totalStudents || 0;
    const submissions = assignment.submissions?.length || 0;
    const percentage = totalStudents > 0 ? (submissions / totalStudents) * 100 : 0;
    return { submissions, totalStudents, percentage };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => a.status === 'active').length;
  const closedAssignments = assignments.filter(a => a.status === 'closed').length;

  return (
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track assignments
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new assignment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      placeholder="Assignment title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      placeholder="Assignment description"
                    />
                  </div>
                  <div>
                    <Label>Batch</Label>
                    <Select
                      value={newAssignment.batch}
                      onValueChange={(value) => setNewAssignment({ ...newAssignment, batch: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map(batch => (
                          <SelectItem key={batch._id} value={batch._id}>{batch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="datetime-local"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Total Marks</Label>
                    <Input
                      type="number"
                      value={newAssignment.totalMarks}
                      onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: parseInt(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleCreateAssignment} className="w-full">
                    Create Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger>
                <ClipboardList className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map(batch => (
                  <SelectItem key={batch._id} value={batch._id}>{batch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats Row */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground mr-1">Showing:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
              {totalAssignments} total
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {activeAssignments} active
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              {closedAssignments} closed
            </span>
          </div>

          {/* Assignments List */}
          <div className="space-y-3">
            {filteredAssignments.map((assignment, index) => {
              const stats = getSubmissionStats(assignment);
              const isOverdue = assignment.status !== 'closed' && new Date(assignment.dueDate) < new Date();
              const borderClass = assignment.status === 'active' ? 'border-l-blue-500' : 'border-l-border';
              return (
                <Card
                  key={assignment._id}
                  className={`animate-slide-up border-l-4 ${borderClass} hover:shadow-sm transition-shadow`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <h3 className="text-base font-semibold leading-snug truncate">{assignment.title}</h3>
                          {getStatusBadge(assignment.status)}
                        </div>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {assignment.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ClipboardList className="h-3.5 w-3.5" />
                            <span>{assignment.batch?.name}</span>
                          </div>
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {isOverdue
                              ? <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Overdue &middot; {format(new Date(assignment.dueDate), 'PPP')}</span>
                              : <span>Due: {format(new Date(assignment.dueDate), 'PPP')}</span>
                            }
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            <span>{assignment.totalMarks} marks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 md:flex-shrink-0">
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">Submissions</span>
                            <span className="text-xs font-semibold">{stats.submissions}/{stats.totalStudents}</span>
                          </div>
                          <Progress value={stats.percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1 text-right">{stats.percentage.toFixed(0)}%</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>View Submissions</DropdownMenuItem>
                            <DropdownMenuItem>Edit Assignment</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAssignments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-8 rounded-xl border border-dashed border-border text-center">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium mb-1">No assignments found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Create your first assignment to get started
              </p>
            </div>
          )}
        </div>
  );
}
