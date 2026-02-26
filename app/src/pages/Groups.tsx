import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  UserCircle,
  Loader2,
  Plus,
  Search,
  Users,
  GraduationCap,
  MoreHorizontal,
  UserMinus
} from 'lucide-react';
import { groupService, batchService, studentService } from '@/services/api';
import type { Group, Batch, Student } from '@/types';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    batch: '',
    groupType: 'general'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [searchQuery, batchFilter, groups]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [groupsResponse, batchesResponse, studentsResponse] = await Promise.all([
        groupService.getAll(),
        batchService.getAll(),
        studentService.getAll()
      ]);
      setGroups(groupsResponse.data.groups);
      setFilteredGroups(groupsResponse.data.groups);
      setBatches(batchesResponse.data.batches);
      setStudents(studentsResponse.data.students);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  const filterGroups = () => {
    let filtered = groups;

    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (batchFilter !== 'all') {
      filtered = filtered.filter(group => group.batch?._id === batchFilter);
    }

    setFilteredGroups(filtered);
  };

  const handleCreateGroup = async () => {
    try {
      await groupService.create(newGroup);
      toast.success('Group created successfully');
      setIsCreateDialogOpen(false);
      setNewGroup({
        name: '',
        description: '',
        batch: '',
        groupType: 'general'
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create group');
    }
  };

  const handleAddMember = async (groupId: string, studentId: string) => {
    try {
      await groupService.addMember(groupId, studentId);
      toast.success('Member added successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (groupId: string, studentId: string) => {
    try {
      await groupService.removeMember(groupId, studentId);
      toast.success('Member removed successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const getGroupTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      study: 'default',
      project: 'secondary',
      discussion: 'outline',
      activity: 'destructive',
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
    <>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Groups</h1>
            <p className="text-muted-foreground mt-1">
              Manage student groups
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new group for students
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Group Name</Label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Enter group description"
                  />
                </div>

                <div>
                  <Label>Batch</Label>
                  <Select
                    value={newGroup.batch}
                    onValueChange={(value) => setNewGroup({ ...newGroup, batch: value })}
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
                  <Label>Group Type</Label>
                  <Select
                    value={newGroup.groupType}
                    onValueChange={(value: any) => setNewGroup({ ...newGroup, groupType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Study Group</SelectItem>
                      <SelectItem value="project">Project Group</SelectItem>
                      <SelectItem value="discussion">Discussion Group</SelectItem>
                      <SelectItem value="activity">Activity Group</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreateGroup} className="w-full">
                  Create Group
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
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger>
              <GraduationCap className="h-4 w-4 mr-2" />
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

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{group.batch?.name}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedGroup(group);
                        setIsViewDialogOpen(true);
                      }}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Group</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {group.description || 'No description'}
                </p>

                <div className="flex items-center justify-between">
                  {getGroupTypeBadge(group.groupType)}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{group.members?.length || 0} members</span>
                  </div>
                </div>

                <div className="flex -space-x-2">
                  {group.members?.slice(0, 5).map((member, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background"
                      title={member.student?.name}
                    >
                      <span className="text-xs font-medium">
                        {member.student?.name?.charAt(0)}
                      </span>
                    </div>
                  ))}
                  {(group.members?.length || 0) > 5 && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                      <span className="text-xs">+{group.members.length - 5}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedGroup(group);
                    setIsViewDialogOpen(true);
                  }}
                >
                  View Members
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No groups found</h3>
            <p className="text-muted-foreground">
              Create your first group to get started
            </p>
          </div>
        )}
      </div>
      {/* View Group Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              {selectedGroup?.batch?.name} • {selectedGroup?.members?.length} members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Add Member</Label>
              <Select
                onValueChange={(value) => selectedGroup && handleAddMember(selectedGroup._id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student to add" />
                </SelectTrigger>
                <SelectContent>
                  {students
                    .filter(s => !selectedGroup?.members?.some(m => m.student?._id === s._id))
                    .map(student => (
                      <SelectItem key={student._id} value={student._id}>{student.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Members</Label>
              <div className="space-y-2 mt-2">
                {selectedGroup?.members?.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.student?.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.student?.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectedGroup && handleRemoveMember(selectedGroup._id, member.student?._id || '')}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
