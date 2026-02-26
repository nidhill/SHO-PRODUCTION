import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { auditService } from '@/services/api';
import { Loader2, Search,  } from 'lucide-react';
import type { AuditLog } from '@/types';
import { toast } from 'sonner';

export default function AuditLogs() {
            const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const response = await auditService.getAll();
            setLogs(response.data.logs);
        } catch (error) {
            toast.error('Failed to load audit logs');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'bg-red-500/10 text-red-600 border-red-500/20';
        if (action.includes('CREATE')) return 'bg-green-500/10 text-green-600 border-green-500/20';
        if (action.includes('UPDATE')) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        if (action.includes('LOGIN')) return 'bg-violet-500/10 text-violet-600 border-violet-500/20';
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        

            
                <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Monitor system activity and user actions
                            </p>
                        </div>
                        {/* Stats Check - could add total logs count or last active time here */}
                    </div>

                    {/* Search */}
                    <Card className="mb-6 border-border/60 shadow-sm">
                        <CardContent className="p-0">
                            <div className="flex items-center px-4 py-3">
                                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                                <Input
                                    placeholder="Search logs by user, action, or details..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border-0 shadow-none focus-visible:ring-0 h-auto py-0"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logs Table */}
                    <Card className="border-border/60 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[180px]">Timestamp</TableHead>
                                        <TableHead className="w-[200px]">User</TableHead>
                                        <TableHead className="w-[150px]">Action</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead className="w-[120px] text-right">IP Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Loading logs...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No audit logs found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="text-xs font-medium text-muted-foreground">
                                                    {formatDate(log.timestamp)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                                            {log.userName.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium leading-none">{log.userName}</span>
                                                            <span className="text-[10px] text-muted-foreground mt-0.5 capitalize">{log.userRole}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`text-[10px] font-medium border ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {log.details}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground text-right font-mono">
                                                    {log.ip}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            
    );
}
