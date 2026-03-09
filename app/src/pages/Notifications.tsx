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
  Bell,
  Loader2,
  Plus,
  Search,
  Send,
  User,
  Calendar,
  AlertCircle,
  Info,
  MoreHorizontal
} from 'lucide-react';
import { notificationService, batchService, studentService } from '@/services/api';
import type { Notification, Batch, Student } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Notifications() {
      const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'broadcast',
    priority: 'medium',
    recipients: {
      allStudents: false,
      batches: [] as string[],
      students: [] as string[],
      groups: [] as string[]
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [searchQuery, priorityFilter, notifications]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [notificationsResponse, batchesResponse, studentsResponse] = await Promise.all([
        notificationService.getAll(),
        batchService.getAll(),
        studentService.getAll()
      ]);
      setNotifications(notificationsResponse.data.notifications);
      setFilteredNotifications(notificationsResponse.data.notifications);
      setBatches(batchesResponse.data.batches);
      setStudents(studentsResponse.data.students);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(notification => notification.priority === priorityFilter);
    }

    setFilteredNotifications(filtered);
  };

  const handleCreateNotification = async () => {
    try {
      await notificationService.create(newNotification);
      toast.success('Notification sent successfully');
      setIsCreateDialogOpen(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'broadcast',
        priority: 'medium',
        recipients: {
          allStudents: false,
          batches: [],
          students: [],
          groups: []
        }
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      urgent: 'destructive'
    };
    const icons: Record<string, React.ReactNode> = {
      low: <Info className="h-3 w-3" />,
      medium: <Info className="h-3 w-3" />,
      high: <AlertCircle className="h-3 w-3" />,
      urgent: <AlertCircle className="h-3 w-3" />
    };
    return (
      <Badge variant={variants[priority] || 'default'} className="flex items-center gap-1">
        {icons[priority]}
        {priority}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      broadcast: 'default',
      individual: 'secondary',
      batch: 'outline',
      group: 'secondary'
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
              <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground mt-1">
                Send and manage notifications
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Send Notification</DialogTitle>
                  <DialogDescription>
                    Create and send a new notification
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                      placeholder="Notification title"
                    />
                  </div>

                  <div>
                    <Label>Message</Label>
                    <Textarea
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                      placeholder="Enter your message"
                    />
                  </div>

                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="broadcast">Broadcast (All Students)</SelectItem>
                        <SelectItem value="batch">Specific Batches</SelectItem>
                        <SelectItem value="individual">Specific Students</SelectItem>
                        <SelectItem value="group">Groups</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newNotification.priority}
                      onValueChange={(value: any) => setNewNotification({ ...newNotification, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newNotification.type === 'batch' && (
                    <div>
                      <Label>Select Batches</Label>
                      <Select
                        onValueChange={(value) => setNewNotification({
                          ...newNotification,
                          recipients: { ...newNotification.recipients, batches: [...newNotification.recipients.batches, value] }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {batches.map(batch => (
                            <SelectItem key={batch._id} value={batch._id}>{batch.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newNotification.type === 'individual' && (
                    <div>
                      <Label>Select Students</Label>
                      <Select
                        onValueChange={(value) => setNewNotification({
                          ...newNotification,
                          recipients: { ...newNotification.recipients, students: [...newNotification.recipients.students, value] }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem key={student._id} value={student._id}>{student.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button onClick={handleCreateNotification} className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
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
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <Bell className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card key={notification._id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{notification.title}</h3>
                        {getPriorityBadge(notification.priority)}
                        {getTypeBadge(notification.type)}
                      </div>
                      <p className="text-muted-foreground mb-3">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>By: {notification.sentBy?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(notification.sentAt || ''), 'PPP')}</span>
                        </div>
                        {notification.recipients?.allStudents && (
                          <Badge variant="secondary">All Students</Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>View Read Status</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No notifications found</h3>
              <p className="text-muted-foreground">
                Send your first notification to get started
              </p>
            </div>
          )}
        </div>
      
  );
}
