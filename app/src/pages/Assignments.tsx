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
  MoreHorizontal
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
import { useAuth } from '@/contexts/AuthContext';

export default function Assignments() {
  const { hasRole } = useAuth();
  const isMentor = hasRole(['mentor']);
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
      toast.error('Failed to load projects');
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
      toast.success('Project created successfully');
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
      toast.error('Failed to create project');
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

  return (
    

      
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Track and manage student projects
              </p>
            </div>
            {isMentor && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new project for a batch
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
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
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

          {/* Projects List */}
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const stats = getSubmissionStats(assignment);
              return (
                <Card key={assignment._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{assignment.title}</h3>
                          {getStatusBadge(assignment.status)}
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {assignment.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            <span>{assignment.batch?.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Due: {format(new Date(assignment.dueDate), 'PPP')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{assignment.totalMarks} marks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Submissions</p>
                          <p className="text-lg font-semibold">{stats.submissions}/{stats.totalStudents}</p>
                        </div>
                        <div className="w-24">
                          <Progress value={stats.percentage} className="h-2" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
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
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground">
                {isMentor ? 'Create your first project to get started' : 'No projects have been assigned yet'}
              </p>
            </div>
          )}
        </div>
      
  );
}
