import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  MessageSquare,
  Loader2,
  Plus,
  Star,
  Search,
  User,
  Users,
  MoreHorizontal
} from 'lucide-react';
import { feedbackService, studentService, batchService } from '@/services/api';
import type { FeedbackItem, Student, Batch } from '@/types';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Feedback() {
      const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    type: 'student',
    student: '',
    batch: '',
    ratings: {
      overall: 5,
      communication: 5,
      punctuality: 5,
      understanding: 5,
      participation: 5
    },
    comments: '',
    areasOfImprovement: '',
    strengths: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterFeedback();
  }, [searchQuery, typeFilter, feedback]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [feedbackResponse, studentsResponse, batchesResponse] = await Promise.all([
        feedbackService.getAll(),
        studentService.getAll(),
        batchService.getAll()
      ]);
      setFeedback(feedbackResponse.data.feedback);
      setFilteredFeedback(feedbackResponse.data.feedback);
      setStudents(studentsResponse.data.students);
      setBatches(batchesResponse.data.batches);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const filterFeedback = () => {
    let filtered = feedback;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.comments.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batch?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    setFilteredFeedback(filtered);
  };

  const handleCreateFeedback = async () => {
    try {
      await feedbackService.create({
        ...newFeedback,
        areasOfImprovement: newFeedback.areasOfImprovement.split(',').map(s => s.trim()).filter(Boolean),
        strengths: newFeedback.strengths.split(',').map(s => s.trim()).filter(Boolean)
      });
      toast.success('Feedback created successfully');
      setIsCreateDialogOpen(false);
      setNewFeedback({
        type: 'student',
        student: '',
        batch: '',
        ratings: {
          overall: 5,
          communication: 5,
          punctuality: 5,
          understanding: 5,
          participation: 5
        },
        comments: '',
        areasOfImprovement: '',
        strengths: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create feedback');
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      student: 'default',
      batch: 'secondary',
      session: 'outline',
      mentor: 'destructive',
      general: 'secondary'
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
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
              <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track feedback
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Feedback</DialogTitle>
                  <DialogDescription>
                    Provide feedback for students or batches
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newFeedback.type}
                      onValueChange={(value: any) => setNewFeedback({ ...newFeedback, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="batch">Batch</SelectItem>
                        <SelectItem value="session">Session</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newFeedback.type === 'student' && (
                    <div>
                      <Label>Student</Label>
                      <Select
                        value={newFeedback.student}
                        onValueChange={(value) => setNewFeedback({ ...newFeedback, student: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem key={student._id} value={student._id}>{student.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(newFeedback.type === 'batch' || newFeedback.type === 'session') && (
                    <div>
                      <Label>Batch</Label>
                      <Select
                        value={newFeedback.batch}
                        onValueChange={(value) => setNewFeedback({ ...newFeedback, batch: value })}
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
                  )}

                  <div className="space-y-2">
                    <Label>Ratings</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Overall</Label>
                        <Select
                          value={newFeedback.ratings.overall.toString()}
                          onValueChange={(value) => setNewFeedback({
                            ...newFeedback,
                            ratings: { ...newFeedback.ratings, overall: parseInt(value) }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(n => (
                              <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Communication</Label>
                        <Select
                          value={newFeedback.ratings.communication.toString()}
                          onValueChange={(value) => setNewFeedback({
                            ...newFeedback,
                            ratings: { ...newFeedback.ratings, communication: parseInt(value) }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(n => (
                              <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Comments</Label>
                    <Textarea
                      value={newFeedback.comments}
                      onChange={(e) => setNewFeedback({ ...newFeedback, comments: e.target.value })}
                      placeholder="Enter your feedback comments"
                    />
                  </div>

                  <div>
                    <Label>Areas of Improvement (comma separated)</Label>
                    <Input
                      value={newFeedback.areasOfImprovement}
                      onChange={(e) => setNewFeedback({ ...newFeedback, areasOfImprovement: e.target.value })}
                      placeholder="e.g., Communication, Punctuality"
                    />
                  </div>

                  <div>
                    <Label>Strengths (comma separated)</Label>
                    <Input
                      value={newFeedback.strengths}
                      onChange={(e) => setNewFeedback({ ...newFeedback, strengths: e.target.value })}
                      placeholder="e.g., Leadership, Problem Solving"
                    />
                  </div>

                  <Button onClick={handleCreateFeedback} className="w-full">
                    Submit Feedback
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <MessageSquare className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="batch">Batch</SelectItem>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card key={item._id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeBadge(item.type)}
                        {item.student && (
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-4 w-4" />
                            <span>{item.student.name}</span>
                          </div>
                        )}
                        {item.batch && (
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-4 w-4" />
                            <span>{item.batch.name}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{item.comments}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>Overall: {item.ratings?.overall}/5</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>By: {item.givenBy?.name}</span>
                        </div>
                      </div>
                      {item.areasOfImprovement?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-1">Areas of Improvement:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.areasOfImprovement.map((area, idx) => (
                              <Badge key={idx} variant="outline">{area}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.strengths?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">Strengths:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.strengths.map((strength, idx) => (
                              <Badge key={idx} variant="secondary">{strength}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Feedback</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFeedback.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No feedback found</h3>
              <p className="text-muted-foreground">
                Add your first feedback to get started
              </p>
            </div>
          )}
        </div>
      
  );
}
