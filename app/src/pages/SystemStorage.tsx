import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Loader2,
    Database,
    Server,
    HardDrive,
    Users
} from 'lucide-react';
import { systemService } from '@/services/api';
import { toast } from 'sonner';

export default function SystemStorage() {
    const [isLoading, setIsLoading] = useState(true);
    const [systemInfo, setSystemInfo] = useState<any>(null);

    useEffect(() => {
        fetchSystemStats();
    }, []);

    const fetchSystemStats = async () => {
        try {
            setIsLoading(true);
            const res = await systemService.getStorageStats();
            setSystemInfo(res.data.storage);
        } catch (error) {
            toast.error('Failed to load system storage stats');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">System Storage</h1>
                <p className="text-muted-foreground mt-1">
                    Live MongoDB utilization and performance metrics
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Live Database Storage
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {systemInfo ? (
                        <div className="space-y-8">
                            {/* Storage Progress */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-lg">Storage Usage</span>
                                    <span className="text-muted-foreground font-medium">
                                        {(systemInfo.storageSizeBytes / (1024 * 1024)).toFixed(2)} MB / {(systemInfo.maxCapacityBytes / (1024 * 1024)).toFixed(0)} MB
                                    </span>
                                </div>
                                <Progress value={Number(systemInfo.usedPercentage)} className="h-3 bg-slate-200 dark:bg-slate-800" />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>0%</span>
                                    <span>{systemInfo.usedPercentage}% Used</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Database Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                                <div className="p-4 bg-muted/50 rounded-lg flex flex-col gap-1 border border-border/50">
                                    <Server className="h-5 w-5 text-blue-500 mb-1" />
                                    <span className="text-sm font-medium text-muted-foreground">Database Name</span>
                                    <span className="text-xl font-bold">{systemInfo.dbName}</span>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg flex flex-col gap-1 border border-border/50">
                                    <HardDrive className="h-5 w-5 text-purple-500 mb-1" />
                                    <span className="text-sm font-medium text-muted-foreground">Collections</span>
                                    <span className="text-xl font-bold">{systemInfo.collections}</span>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg flex flex-col gap-1 border border-border/50">
                                    <Users className="h-5 w-5 text-amber-500 mb-1" />
                                    <span className="text-sm font-medium text-muted-foreground">Total Documents</span>
                                    <span className="text-xl font-bold">{systemInfo.objects.toLocaleString()}</span>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg flex flex-col gap-1 border border-border/50">
                                    <Database className="h-5 w-5 text-green-500 mb-1" />
                                    <span className="text-sm font-medium text-muted-foreground">Index Size</span>
                                    <span className="text-xl font-bold">{(systemInfo.indexSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <p>No storage metrics available.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
