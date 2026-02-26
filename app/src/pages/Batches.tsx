import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Filter
} from 'lucide-react';
import { batchService } from '@/services/api';
import type { Batch } from '@/types';
import { toast } from 'sonner';

export default function Batches() {
      const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Batch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {filteredBatches.map((batch) => (
              <Card key={batch._id} className="border-border/60 hover:border-border transition-colors group">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                        {batch.code?.slice(0, 2) || 'B'}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{batch.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{batch.code}</p>
                      </div>
                    </div>
                    <Badge
                      variant={batch.status === 'active' ? 'default' : batch.status === 'completed' ? 'secondary' : 'outline'}
                      className="text-[10px] font-medium"
                    >
                      {batch.status}
                    </Badge>
                  </div>

                  {/* School */}
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-4">
                    <School className="h-3 w-3" />
                    {batch.school?.name || 'No school assigned'}
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
        </div>
      
  );
}
