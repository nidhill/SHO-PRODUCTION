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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [editFeedback, setEditFeedback] = useState<any>({
    ratings: { overall: 5, communication: 5, punctuality: 5, understanding: 5, participation: 5 },
    comments: '',
    areasOfImprovement: '',
    strengths: ''
  });
  const [newFeedback, setNewFeedback] = useState({
    type: 'student',
    student: '',
    batch: '',
    formLink: '',
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
      if (!newFeedback.formLink?.trim()) {
        toast.error('Google Form Link is required');
        return;
      }
      if (newFeedback.type === 'student' && !newFeedback.student) {
        toast.error('Please select a student');
        return;
      }
      if (newFeedback.type === 'batch' && !newFeedback.batch) {
        toast.error('Please select a batch');
        return;
      }

      await feedbackService.sendForm({
        targetType: newFeedback.type,
        targetId: newFeedback.type === 'student' ? newFeedback.student : newFeedback.batch,
        formLink: newFeedback.formLink
      });

      toast.success('Feedback request sent successfully');
      setIsCreateDialogOpen(false);
      setNewFeedback({
        type: 'student',
        student: '',
        batch: '',
        formLink: '',
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
      toast.error('Failed to send feedback request');
    }
  };

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;
    try {
      if (!editFeedback.comments.trim()) {
        toast.error('Comments are required');
        return;
      }

      const payload: any = {
        ratings: editFeedback.ratings,
        comments: editFeedback.comments,
        areasOfImprovement: editFeedback.areasOfImprovement.split(',').map((s: string) => s.trim()).filter(Boolean),
        strengths: editFeedback.strengths.split(',').map((s: string) => s.trim()).filter(Boolean)
      };

      await feedbackService.update(selectedFeedback._id, payload);
      toast.success('Feedback updated successfully');
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update feedback');
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      student: 'default',
      batch: 'secondary',
      session: 'outline',
      mentor: 'destructive',
      general: 'secondary',
      google_form: 'default'
    };
    const labels: Record<string, string> = {
      google_form: 'Google Form'
    };
    return <Badge variant={variants[type] || 'default'}>{labels[type] || type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
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

              {newFeedback.type === 'batch' && (
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

              <div>
                <Label>Google Form Link</Label>
                <Input
                  value={newFeedback.formLink}
                  onChange={(e) => setNewFeedback({ ...newFeedback, formLink: e.target.value })}
                  placeholder="https://forms.gle/..."
                />
              </div>

              <Button onClick={handleCreateFeedback} className="w-full">
                Send Feedback Request
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

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground border border-border/50">
          <MessageSquare className="h-3 w-3" /> {feedback.length} Total
        </span>
        {feedback.filter(f => f.type === 'student').length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-medium">
            <User className="h-3 w-3" /> {feedback.filter(f => f.type === 'student').length} Student
          </span>
        )}
        {feedback.filter(f => f.type === 'batch').length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-medium">
            <Users className="h-3 w-3" /> {feedback.filter(f => f.type === 'batch').length} Batch
          </span>
        )}
        {feedback.filter(f => f.type === 'google_form').length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30 text-xs font-medium">
            <MessageSquare className="h-3 w-3" /> {feedback.filter(f => f.type === 'google_form').length} Forms
          </span>
        )}
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredFeedback.map((item, idx) => (
          <Card key={item._id} className="border-l-4 border-l-violet-500/60 animate-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {getTypeBadge(item.type)}
                        {item.student && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" /> {item.student.name}
                          </span>
                        )}
                        {item.batch && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" /> {item.batch.name}
                          </span>
                        )}
                        {item.type !== 'google_form' && item.ratings?.overall && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <Star className="h-3 w-3 fill-current" /> {item.ratings.overall}/5
                          </span>
                        )}
                      </div>

                      {item.type === 'google_form' ? (
                        <div>
                          {item.comments && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.comments}</p>}
                          {item.formLink && (
                            <div className="bg-muted/60 px-3 py-2 flex items-center gap-2 rounded-lg mb-2">
                              <MessageSquare className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <a href={item.formLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate">
                                {item.formLink}
                              </a>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" /> By: {item.givenBy?.name}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.comments}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                            <User className="h-3 w-3" /> By: {item.givenBy?.name}
                          </p>
                          {item.strengths?.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Strengths:</span>
                              {item.strengths.map((s, i) => <Badge key={i} variant="secondary" className="text-[10px]">{s}</Badge>)}
                            </div>
                          )}
                          {item.areasOfImprovement?.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Improve:</span>
                              {item.areasOfImprovement.map((a, i) => <Badge key={i} variant="outline" className="text-[10px]">{a}</Badge>)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedFeedback(item);
                          setIsViewDialogOpen(true);
                        }}>View Details</DropdownMenuItem>
                        {item.type !== 'google_form' && (
                          <DropdownMenuItem onClick={() => {
                            setSelectedFeedback(item);
                            setEditFeedback({
                              ratings: item.ratings || { overall: 5, communication: 5, punctuality: 5, understanding: 5, participation: 5 },
                              comments: item.comments || '',
                              areasOfImprovement: item.areasOfImprovement?.join(', ') || '',
                              strengths: item.strengths?.join(', ') || ''
                            });
                            setIsEditDialogOpen(true);
                          }}>Edit Feedback</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFeedback.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium mb-1">No feedback found</h3>
          <p className="text-xs text-muted-foreground">Add your first feedback to get started</p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>Read-only view of the feedback</DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4 mt-2">
              {selectedFeedback.type === 'google_form' ? (
                <>
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <Badge className="mt-1 block w-fit">Google Form</Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Form Link</Label>
                    <div className="mt-1 bg-muted p-3 rounded-md">
                      <a href={selectedFeedback.formLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline break-all">
                        {selectedFeedback.formLink}
                      </a>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Dispatched By</Label>
                    <p className="mt-1 text-sm">{selectedFeedback.givenBy?.name}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-muted-foreground">Comments</Label>
                    <p className="mt-1 text-sm">{selectedFeedback.comments}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Overall Rating</Label>
                    <p className="mt-1 text-sm">{selectedFeedback.ratings?.overall}/5</p>
                  </div>
                  {selectedFeedback.areasOfImprovement?.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Areas of Improvement</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedFeedback.areasOfImprovement.map((area, idx) => (
                          <Badge key={idx} variant="outline">{area}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedFeedback.strengths?.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Strengths</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedFeedback.strengths.map((str, idx) => (
                          <Badge key={idx} variant="secondary">{str}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Feedback</DialogTitle>
            <DialogDescription>Update the existing feedback record</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Ratings</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Overall</Label>
                  <Select
                    value={editFeedback.ratings.overall.toString()}
                    onValueChange={(value) => setEditFeedback({
                      ...editFeedback,
                      ratings: { ...editFeedback.ratings, overall: parseInt(value) }
                    })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    value={editFeedback.ratings.communication.toString()}
                    onValueChange={(value) => setEditFeedback({
                      ...editFeedback,
                      ratings: { ...editFeedback.ratings, communication: parseInt(value) }
                    })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                value={editFeedback.comments}
                onChange={(e) => setEditFeedback({ ...editFeedback, comments: e.target.value })}
                placeholder="Enter your feedback comments"
              />
            </div>

            <div>
              <Label>Areas of Improvement (comma separated)</Label>
              <Input
                value={editFeedback.areasOfImprovement}
                onChange={(e) => setEditFeedback({ ...editFeedback, areasOfImprovement: e.target.value })}
                placeholder="e.g., Communication, Punctuality"
              />
            </div>

            <div>
              <Label>Strengths (comma separated)</Label>
              <Input
                value={editFeedback.strengths}
                onChange={(e) => setEditFeedback({ ...editFeedback, strengths: e.target.value })}
                placeholder="e.g., Leadership, Problem Solving"
              />
            </div>

            <Button onClick={handleUpdateFeedback} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
}
