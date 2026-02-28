import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { userService, batchService } from '@/services/api';
import { Loader2, Plus, Search, User as UserIcon, Mail, Phone, Lock, Trash2, GraduationCap, Layers } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/types';

export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [batches, setBatches] = useState<any[]>([]);
    const [batchSearch, setBatchSearch] = useState('');

    // New user form state
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: 'sho',
        phone: '',
        school: '',
        assignedBatches: [] as string[],
        password: 'password' // Default password
    });

    useEffect(() => {
        fetchUsers();
        fetchBatches();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await userService.getAll();
            setUsers(response.data.users);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const response = await batchService.getAll();
            setBatches(response.data.batches || []);
        } catch (error) {
            console.error('Failed to load batches');
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await userService.create(newUser);
            toast.success('User created successfully');
            setIsAddUserOpen(false);
            setNewUser({ name: '', email: '', role: 'sho', phone: '', school: '', assignedBatches: [], password: 'password' });
            fetchUsers();
        } catch (error) {
            toast.error('Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await userService.delete(userToDelete);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        } finally {
            setUserToDelete(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'leadership': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'sho': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'ssho': return 'bg-violet-500/10 text-violet-600 border-violet-500/20';
            case 'mentor': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
        }
    };

    return (



        <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage system users and their roles
                    </p>
                </div>

                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button className="font-medium shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-xl border-border/50">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Add New User</DialogTitle>
                            <DialogDescription>
                                Create a new user account. Default password is 'password'.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddUser} className="py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Basic Info */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                value={newUser.name}
                                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                                className="pl-9"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                className="pl-9"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                placeholder="9876543210"
                                                value={newUser.phone}
                                                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={newUser.role}
                                            onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sho">SHO (Student Happiness Officer)</SelectItem>
                                                <SelectItem value="ssho">SSHO (Senior SHO)</SelectItem>
                                                <SelectItem value="mentor">Mentor</SelectItem>
                                                <SelectItem value="leadership">Leadership (Admin)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="school">School</Label>
                                        <Select
                                            value={newUser.school}
                                            onValueChange={(value) => setNewUser({ ...newUser, school: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select school" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tech_school">Tech School</SelectItem>
                                                <SelectItem value="marketing_school">Marketing School</SelectItem>
                                                <SelectItem value="design_school">Design School</SelectItem>
                                                <SelectItem value="finance_school">Finance School</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Right Column: Assignments & Batches */}
                                <div className="space-y-4 flex flex-col h-full">
                                    <div className="space-y-2 flex-grow flex flex-col">
                                        <Label>Assign Batches</Label>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                placeholder="Search batches..."
                                                value={batchSearch}
                                                onChange={(e) => setBatchSearch(e.target.value)}
                                                className="pl-9 h-9 text-sm"
                                            />
                                        </div>
                                        <div className="flex-grow max-h-[220px] overflow-y-auto border rounded-xl p-2 space-y-1 bg-muted/20 custom-scrollbar">
                                            {batches.length === 0 ? (
                                                <p className="text-xs text-muted-foreground p-2 text-center mt-4">No batches available</p>
                                            ) : batches.filter(b => b.name?.toLowerCase().includes(batchSearch.toLowerCase()) || b.code?.toLowerCase().includes(batchSearch.toLowerCase())).length === 0 ? (
                                                <p className="text-xs text-muted-foreground p-2 text-center mt-4">No batches match "{batchSearch}"</p>
                                            ) : (
                                                batches.filter(b => b.name?.toLowerCase().includes(batchSearch.toLowerCase()) || b.code?.toLowerCase().includes(batchSearch.toLowerCase())).map((batch) => (
                                                    <label
                                                        key={batch._id}
                                                        className={`flex items-start gap-3 p-3 rounded-lg border border-transparent hover:bg-muted cursor-pointer transition-all ${newUser.assignedBatches.includes(batch._id) ? 'bg-primary/5 border-primary/20' : ''
                                                            }`}
                                                    >
                                                        <div className="mt-0.5">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-border w-4 h-4 accent-primary"
                                                                checked={newUser.assignedBatches.includes(batch._id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setNewUser({ ...newUser, assignedBatches: [...newUser.assignedBatches, batch._id] });
                                                                    } else {
                                                                        setNewUser({ ...newUser, assignedBatches: newUser.assignedBatches.filter(id => id !== batch._id) });
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <span className="text-sm font-medium truncate">{batch.name}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-mono bg-muted-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded">
                                                                    {batch.code}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                        {newUser.assignedBatches.length > 0 && (
                                            <div className="mt-2 flex items-center justify-between">
                                                <p className="text-xs font-medium text-primary">
                                                    {newUser.assignedBatches.length} batch{newUser.assignedBatches.length !== 1 ? 'es' : ''} selected
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setNewUser({ ...newUser, assignedBatches: [] })}
                                                >
                                                    Clear selection
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/40 border border-border/50 p-3 rounded-xl flex items-start gap-3 text-sm text-muted-foreground mt-6">
                                <div className="p-1.5 rounded-md bg-background shadow-sm border border-border/50">
                                    <Lock className="h-4 w-4 text-primary" />
                                </div>
                                <div className="mt-1">
                                    <p>New users are created with the default password <strong className="text-foreground font-mono bg-muted px-1 rounded">password</strong>.</p>
                                    <p className="text-xs mt-0.5 opacity-80">They will be required to change it upon first login.</p>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create User'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user account.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="md:col-span-2 border-border/60 shadow-sm">
                    <CardContent className="p-0">
                        <div className="flex items-center px-4 py-3">
                            <Search className="h-4 w-4 text-muted-foreground mr-2" />
                            <Input
                                placeholder="Search users by name, email or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-0 shadow-none focus-visible:ring-0 h-auto py-0"
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/60 shadow-sm bg-muted/20">
                    <CardContent className="p-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                        <span className="text-xl font-bold">{users.length}</span>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card className="border-border/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[250px]">User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>School</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading users...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{user.name}</p>
                                                    <p className="text-[11px] text-muted-foreground">ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {(user as any).school ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                                                    <GraduationCap className="h-3 w-3" />
                                                    {(user as any).school.replace('_', ' ').replace('_', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {user.email}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {user.phone || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                onClick={() => setUserToDelete(user.id)}
                                                disabled={currentUser?.id === user.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
