import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Loader2, Users, GraduationCap, UserCheck, UserPlus, ArrowRightLeft,
    Search, School, ShieldCheck, UserCog, X, Plus,
} from 'lucide-react';
import { batchService, userService } from '@/services/api';
import type { Batch } from '@/types';
import { toast } from 'sonner';

type StaffUser = { _id: string; name: string; email: string; role: string };
type ManageAction = 'sho' | 'ssho' | 'mentor' | 'transfer' | null;

export default function SchoolManagement() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [allUsers, setAllUsers] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
    const [action, setAction] = useState<ManageAction>(null);
    const [selectedUser, setSelectedUser] = useState('');
    const [targetBatch, setTargetBatch] = useState('');
    const [saving, setSaving] = useState(false);

    // Add New Mentor state
    const [addMentorOpen, setAddMentorOpen] = useState(false);
    const [newMentor, setNewMentor] = useState({ name: '', email: '', phone: '' });
    const [creatingMentor, setCreatingMentor] = useState(false);

    const handleCreateMentor = async () => {
        if (!newMentor.name || !newMentor.email) {
            toast.error('Name and email are required');
            return;
        }
        setCreatingMentor(true);
        try {
            const firstName = newMentor.name.trim().split(' ')[0];
            const password = `${firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()}@Haca2025`;
            await userService.create({
                name: newMentor.name.trim(),
                email: newMentor.email.trim().toLowerCase(),
                phone: newMentor.phone,
                role: 'mentor',
                password,
            });
            toast.success(`Mentor created! Password: ${password}`);
            setNewMentor({ name: '', email: '', phone: '' });
            setAddMentorOpen(false);
            fetchAll(); // refresh user list
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to create mentor');
        } finally {
            setCreatingMentor(false);
        }
    };

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const [bRes, uRes] = await Promise.all([
                batchService.getAll(),
                userService.getAll(),
            ]);
            setBatches(bRes.data.batches || []);
            setAllUsers(uRes.data.users || []);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filtered = batches.filter(b =>
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.code?.toLowerCase().includes(search.toLowerCase())
    );

    // Helpers
    const shos = allUsers.filter(u => u.role === 'sho');
    const sshos = allUsers.filter(u => u.role === 'ssho');
    const mentors = allUsers.filter(u => u.role === 'mentor');

    const openModal = (batch: Batch, act: ManageAction) => {
        setActiveBatch(batch);
        setAction(act);
        setSelectedUser('');
        setTargetBatch('');
    };
    const closeModal = () => { setActiveBatch(null); setAction(null); };

    const handleSave = async () => {
        if (!activeBatch) return;
        setSaving(true);
        try {
            switch (action) {
                case 'sho':
                    await batchService.assignSHO(activeBatch._id, selectedUser || null);
                    toast.success('SHO assigned successfully');
                    break;
                case 'ssho':
                    await batchService.assignSSHO(activeBatch._id, selectedUser || null);
                    toast.success('SSHO assigned successfully');
                    break;
                case 'mentor':
                    if (!selectedUser) { toast.error('Select a mentor'); setSaving(false); return; }
                    await batchService.addMentor(activeBatch._id, selectedUser);
                    toast.success('Mentor added');
                    break;
                case 'transfer':
                    if (!targetBatch) { toast.error('Select target batch'); setSaving(false); return; }
                    const res = await batchService.transferStudents(activeBatch._id, targetBatch);
                    toast.success(res.data.message || 'Transfer complete');
                    break;
            }
            closeModal();
            fetchAll();
        } catch {
            toast.error('Action failed');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveMentor = async (batchId: string, userId: string) => {
        try {
            await batchService.removeMentor(batchId, userId);
            toast.success('Mentor removed');
            fetchAll();
        } catch {
            toast.error('Failed to remove mentor');
        }
    };

    const modalTitle: Record<NonNullable<ManageAction>, string> = {
        sho: 'Assign SHO',
        ssho: 'Assign SSHO',
        mentor: 'Add Mentor',
        transfer: 'Transfer Students',
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    );

    return (
        <div className="p-4 lg:p-8 max-w-[1300px] mx-auto">
            {/* Header */}
            <div className="mb-6 animate-fade-in flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <School className="h-6 w-6 text-primary" /> School Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Assign SHOs, SSHOs, Mentors and transfer students across batches
                    </p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => setAddMentorOpen(true)}>
                    <Plus className="h-4 w-4" /> Add New Mentor
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search batches…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                />
            </div>

            {/* Batch Table */}
            <div className="space-y-3">
                {filtered.map(batch => {
                    const b = batch as any;
                    return (
                        <Card key={batch._id} className="border-border/60 animate-slide-up">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {batch.code?.slice(0, 2) || 'B'}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-semibold">{batch.name}</CardTitle>
                                            <p className="text-[11px] text-muted-foreground">{batch.code} · {batch.school?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant={batch.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                                            {batch.status}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px]">
                                            <GraduationCap className="h-3 w-3 mr-1" />{batch.totalStudents} students
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                                    {/* SHO */}
                                    <div className="rounded-lg border border-border/50 p-3 bg-muted/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                <UserCheck className="h-3 w-3" /> SHO
                                            </span>
                                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                                                onClick={() => openModal(batch, 'sho')}>
                                                <UserCog className="h-3 w-3 mr-1" /> Change
                                            </Button>
                                        </div>
                                        {b.assignedSHO ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                    {b.assignedSHO.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium">{b.assignedSHO.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{b.assignedSHO.email}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="outline" className="h-7 text-xs w-full border-dashed"
                                                onClick={() => openModal(batch, 'sho')}>
                                                <UserPlus className="h-3 w-3 mr-1" /> Assign SHO
                                            </Button>
                                        )}
                                    </div>

                                    {/* SSHO */}
                                    <div className="rounded-lg border border-border/50 p-3 bg-muted/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                <ShieldCheck className="h-3 w-3" /> SSHO
                                            </span>
                                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                                                onClick={() => openModal(batch, 'ssho')}>
                                                <UserCog className="h-3 w-3 mr-1" /> Change
                                            </Button>
                                        </div>
                                        {b.assignedSSHO ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-600">
                                                    {b.assignedSSHO.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium">{b.assignedSSHO.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{b.assignedSSHO.email}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="outline" className="h-7 text-xs w-full border-dashed"
                                                onClick={() => openModal(batch, 'ssho')}>
                                                <UserPlus className="h-3 w-3 mr-1" /> Assign SSHO
                                            </Button>
                                        )}
                                    </div>

                                    {/* Mentors */}
                                    <div className="rounded-lg border border-border/50 p-3 bg-muted/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                <Users className="h-3 w-3" /> Mentors
                                            </span>
                                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                                                onClick={() => openModal(batch, 'mentor')}>
                                                <UserPlus className="h-3 w-3 mr-1" /> Add
                                            </Button>
                                        </div>
                                        {b.assignedMentors?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {b.assignedMentors.map((m: StaffUser) => (
                                                    <span key={m._id} className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                                                        {m.name}
                                                        <button onClick={() => handleRemoveMentor(batch._id, m._id)}
                                                            className="hover:text-red-500 transition-colors ml-0.5">
                                                            <X className="h-2.5 w-2.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="outline" className="h-7 text-xs w-full border-dashed"
                                                onClick={() => openModal(batch, 'mentor')}>
                                                <UserPlus className="h-3 w-3 mr-1" /> Add Mentor
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Transfer CTA */}
                                {batch.totalStudents > 0 && (
                                    <div className="mt-3 flex justify-end">
                                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-muted-foreground"
                                            onClick={() => openModal(batch, 'transfer')}>
                                            <ArrowRightLeft className="h-3 w-3" />
                                            Transfer {batch.totalStudents} Students
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <School className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No batches found</p>
                </div>
            )}

            {/* ── Add New Mentor Dialog ─────────────────────────── */}
            <Dialog open={addMentorOpen} onOpenChange={setAddMentorOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" /> Add New Mentor
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Full Name *</label>
                            <Input
                                placeholder="e.g. Ahmed Ali"
                                value={newMentor.name}
                                onChange={e => setNewMentor(p => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Email *</label>
                            <Input
                                placeholder="mentor@example.com"
                                type="email"
                                value={newMentor.email}
                                onChange={e => setNewMentor(p => ({ ...p, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Phone</label>
                            <Input
                                placeholder="+91 XXXXX XXXXX"
                                value={newMentor.phone}
                                onChange={e => setNewMentor(p => ({ ...p, phone: e.target.value }))}
                            />
                        </div>
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-400">
                            🔑 Default password will be: <strong>{newMentor.name ? `${newMentor.name.trim().split(' ')[0].charAt(0).toUpperCase() + newMentor.name.trim().split(' ')[0].slice(1).toLowerCase()}@Haca2025` : 'FirstName@Haca2025'}</strong>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddMentorOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateMentor} disabled={creatingMentor || !newMentor.name || !newMentor.email}>
                            {creatingMentor ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : <><UserPlus className="h-4 w-4 mr-2" />Create Mentor</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Batch Assignment Modal ─────────────────────────── */}
            <Dialog open={!!activeBatch && !!action} onOpenChange={closeModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{action ? modalTitle[action] : ''}</DialogTitle>
                    </DialogHeader>

                    <div className="py-2 space-y-3">
                        {/* Batch info */}
                        <div className="rounded-lg bg-muted/50 p-3 text-sm">
                            <p className="font-medium">{activeBatch?.name}</p>
                            <p className="text-xs text-muted-foreground">{activeBatch?.code} · {(activeBatch as any)?.school?.name}</p>
                        </div>

                        {/* Assign SHO */}
                        {action === 'sho' && (
                            <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1">Select SHO</label>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger><SelectValue placeholder="Choose SHO…" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">— Remove SHO —</SelectItem>
                                        {shos.map(u => (
                                            <SelectItem key={u._id} value={u._id}>{u.name} · {u.email}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Assign SSHO */}
                        {action === 'ssho' && (
                            <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1">Select SSHO</label>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger><SelectValue placeholder="Choose SSHO…" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">— Remove SSHO —</SelectItem>
                                        {sshos.map(u => (
                                            <SelectItem key={u._id} value={u._id}>{u.name} · {u.email}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Add Mentor */}
                        {action === 'mentor' && (
                            <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1">Select Mentor</label>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger><SelectValue placeholder="Choose mentor…" /></SelectTrigger>
                                    <SelectContent>
                                        {mentors.length === 0
                                            ? <SelectItem value="_none" disabled>No mentors available</SelectItem>
                                            : mentors.map(u => (
                                                <SelectItem key={u._id} value={u._id}>{u.name} · {u.email}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Transfer */}
                        {action === 'transfer' && (
                            <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1">Transfer to Batch</label>
                                <Select value={targetBatch} onValueChange={setTargetBatch}>
                                    <SelectTrigger><SelectValue placeholder="Select target batch…" /></SelectTrigger>
                                    <SelectContent>
                                        {batches.filter(b => b._id !== activeBatch?._id).map(b => (
                                            <SelectItem key={b._id} value={b._id}>
                                                {b.name} ({b.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-2">
                                    ⚠️ All <strong>{activeBatch?.totalStudents}</strong> students will be moved to the selected batch.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeModal}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || (action === 'transfer' && !targetBatch)}
                        >
                            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
