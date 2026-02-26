import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    CalendarDays,
    Clock,
    Loader2,
    BookOpen,
    User,
    CheckCircle2,
    XCircle,
    Timer,
    CalendarCheck
} from 'lucide-react';
import { classPlannerService, batchService } from '@/services/api';
import type { ClassPlannerItem } from '@/services/mockApi';
import type { Batch } from '@/types';
import { toast } from 'sonner';

export default function ClassPlanner() {
            const [classes, setClasses] = useState<ClassPlannerItem[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [batchFilter, setBatchFilter] = useState<string>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [classResponse, batchResponse] = await Promise.all([
                classPlannerService.getAll(),
                batchService.getAll()
            ]);
            setClasses(classResponse.data.classes);
            setBatches(batchResponse.data.batches);
        } catch (error) {
            toast.error('Failed to load class planner');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredClasses = batchFilter === 'all'
        ? classes
        : classes.filter(c => c.batch._id === batchFilter);

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; label: string }> = {
            completed: { variant: 'default', icon: CheckCircle2, label: 'Completed' },
            scheduled: { variant: 'secondary', icon: CalendarCheck, label: 'Scheduled' },
            cancelled: { variant: 'destructive', icon: XCircle, label: 'Cancelled' },
            in_progress: { variant: 'outline', icon: Timer, label: 'In Progress' },
        };
        const c = config[status] || config.scheduled;
        const Icon = c.icon;
        return (
            <Badge variant={c.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {c.label}
            </Badge>
        );
    };

    const statusCounts = {
        total: filteredClasses.length,
        completed: filteredClasses.filter(c => c.status === 'completed').length,
        scheduled: filteredClasses.filter(c => c.status === 'scheduled').length,
        cancelled: filteredClasses.filter(c => c.status === 'cancelled').length,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading class planner...</p>
                </div>
            </div>
        );
    }

    return (
        

            
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Class Planner</h1>
                            <p className="text-muted-foreground mt-1">
                                Schedule and track class sessions
                            </p>
                        </div>
                        <Select value={batchFilter} onValueChange={setBatchFilter}>
                            <SelectTrigger className="w-[200px]">
                                <CalendarDays className="h-4 w-4 mr-2" />
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

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Classes', value: statusCounts.total, icon: CalendarDays, gradient: 'from-blue-500 to-indigo-600' },
                            { label: 'Completed', value: statusCounts.completed, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600' },
                            { label: 'Scheduled', value: statusCounts.scheduled, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
                            { label: 'Cancelled', value: statusCounts.cancelled, icon: XCircle, gradient: 'from-rose-500 to-red-600' },
                        ].map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                                        </div>
                                        <div className="text-3xl font-bold">{stat.value}</div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Class Schedule Table */}
                    <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <CardHeader>
                            <CardTitle className="text-lg">Class Schedule</CardTitle>
                            <CardDescription>View and manage upcoming and past class sessions</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Topic</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Mentor</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClasses.map((cls) => (
                                        <TableRow key={cls._id} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                        <CalendarDays className="h-4 w-4 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{new Date(cls.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                        <p className="text-xs text-muted-foreground">{cls.time}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium text-sm">{cls.subject}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">{cls.topic}</p>
                                                {cls.notes && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{cls.notes}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">{cls.batch.name}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="h-3 w-3 text-primary" />
                                                    </div>
                                                    <span className="text-sm">{cls.mentor.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {cls.duration} min
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(cls.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {filteredClasses.length === 0 && (
                        <div className="text-center py-12">
                            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No classes found</h3>
                            <p className="text-muted-foreground">
                                {batchFilter !== 'all' ? 'No classes scheduled for this batch' : 'No classes scheduled yet'}
                            </p>
                        </div>
                    )}
                </div>
            
    );
}
