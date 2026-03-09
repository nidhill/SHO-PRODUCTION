import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    User, Shield, Moon, Sun, Loader2, Phone, Mail, Pencil,
    Calendar, Clock, GraduationCap, Bell, BellOff, Activity,
    CheckCircle2, AlertCircle, School, Users, BookOpen,
} from 'lucide-react';
import { authService, batchService, studentService } from '@/services/api';
import type { Batch, Student } from '@/types';

// ─── helpers ──────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
    sho: 'Student Happiness Officer',
    ssho: 'Senior SHO',
    academic: 'Academic Lead',
    mentor: 'Mentor',
    leadership: 'Leadership',
    admin: 'Administrator',
    ceo_haca: 'CEO / HACA',
    pl: 'Project Lead',
};

const ROLE_COLORS: Record<string, string> = {
    sho: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    ssho: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    academic: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    mentor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    leadership: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
    admin: 'bg-red-500/15 text-red-600 dark:text-red-400',
    ceo_haca: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    pl: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
};

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500'];

function Avatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;
    const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'md' ? 'w-12 h-12 text-base' : 'w-8 h-8 text-xs';
    return (
        <div className={`${sizeClass} ${AVATAR_COLORS[colorIdx]} rounded-2xl flex items-center justify-center text-white font-bold shadow-lg`}>
            {initials}
        </div>
    );
}

function NotifToggle({ label, desc, storageKey }: { label: string; desc: string; storageKey: string }) {
    const [on, setOn] = useState(() => localStorage.getItem(storageKey) !== 'false');
    const toggle = (v: boolean) => { setOn(v); localStorage.setItem(storageKey, String(v)); };
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <Switch checked={on} onCheckedChange={toggle} />
        </div>
    );
}

// ─── Main Component ────────────────────────────────────
export default function Settings() {
    const { user, login } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // ── Edit Profile state
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editPhone, setEditPhone] = useState(user?.phone || '');
    const [isSaving, setIsSaving] = useState(false);

    // ── Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // ── Data
    const [batches, setBatches] = useState<Batch[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [bRes, sRes] = await Promise.all([
                    batchService.getAll(),
                    studentService.getAll(),
                ]);
                setBatches(bRes.data.batches || []);
                setStudents(sRes.data.students || []);
            } catch { /* silent */ }
            finally { setLoadingData(false); }
        })();
    }, []);

    // Profile completion %
    const profileFields = [
        { label: 'Name', done: !!user?.name },
        { label: 'Email', done: !!user?.email },
        { label: 'Phone', done: !!user?.phone },
        { label: 'Role', done: !!user?.role },
    ];
    const completion = Math.round((profileFields.filter(f => f.done).length / profileFields.length) * 100);

    // Assigned batches for this user
    const myBatches = batches.filter(b => {
        const bid = b._id;
        return (user as any)?.assignedBatches?.some((ab: any) => (ab._id || ab) === bid || String(ab._id || ab) === String(bid));
    });

    // My students (in my batches)
    const myStudents = students.filter(s =>
        myBatches.some(b => String(b._id) === String(s.batch?._id))
    );

    // Login history from localStorage
    const loginHistory: { time: string; label: string }[] = (() => {
        try { return JSON.parse(localStorage.getItem('loginHistory') || '[]'); } catch { return []; }
    })();

    // Save login time on mount
    useEffect(() => {
        const now = new Date().toISOString();
        const prev = (() => { try { return JSON.parse(localStorage.getItem('loginHistory') || '[]'); } catch { return []; } })();
        const updated = [{ time: now, label: 'Current session' }, ...prev.slice(0, 4)];
        localStorage.setItem('loginHistory', JSON.stringify(updated));
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await authService.updateProfile({ name: editName, phone: editPhone });
            toast.success('Profile updated ✅');
            setEditMode(false);
            // Refresh user in context (reload page data)
            window.location.reload();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update profile');
        } finally { setIsSaving(false); }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
        setIsUpdating(true);
        try {
            await authService.updatePassword({ currentPassword, newPassword });
            toast.success('Password updated ✅');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update password');
        } finally { setIsUpdating(false); }
    };

    // ── Render ─────────────────────────────────
    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
                <h1 className="text-2xl font-semibold tracking-tight">Settings & Profile</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your account, preferences, and information.</p>
            </div>

            <div className="grid gap-6">

                {/* ── Profile Card ───────────────────────────────── */}
                <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.04s' }}>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-5">
                            <Avatar name={user?.name || 'U'} size="lg" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between flex-wrap gap-2">
                                    <div>
                                        <h2 className="text-xl font-bold">{user?.name}</h2>
                                        <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                                        <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[user?.role || ''] || 'bg-muted text-muted-foreground'}`}>
                                            {ROLE_LABELS[user?.role || ''] || user?.role}
                                        </span>
                                    </div>
                                    {!editMode && (
                                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditName(user?.name || ''); setEditPhone(user?.phone || ''); setEditMode(true); }}>
                                            <Pencil className="h-3.5 w-3.5" /> Edit Profile
                                        </Button>
                                    )}
                                </div>

                                {/* Profile Completion */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground font-medium">Profile Completion</span>
                                        <span className="font-semibold">{completion}%</span>
                                    </div>
                                    <Progress value={completion} className="h-1.5" />
                                    <div className="flex gap-3 mt-2 flex-wrap">
                                        {profileFields.map(f => (
                                            <span key={f.label} className={`text-[11px] flex items-center gap-1 ${f.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                                {f.done ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                                {f.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Edit form */}
                                {editMode && (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs mb-1 block">Full Name</Label>
                                            <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your full name" />
                                        </div>
                                        <div>
                                            <Label className="text-xs mb-1 block">Phone Number</Label>
                                            <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                                        </div>
                                        <div className="sm:col-span-2 flex gap-2">
                                            <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                                                {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : 'Save Changes'}
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Account Info ───────────────────────────────── */}
                <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.07s' }}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-base">Account Information</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { icon: Mail, label: 'Email', value: user?.email, color: 'text-blue-500 bg-blue-500/10' },
                                { icon: Phone, label: 'Phone', value: user?.phone || '—', color: 'text-emerald-500 bg-emerald-500/10' },
                                { icon: Shield, label: 'Role', value: ROLE_LABELS[user?.role || ''] || user?.role, color: 'text-violet-500 bg-violet-500/10' },
                            ].map(item => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{item.label}</p>
                                            <p className="text-sm font-medium truncate max-w-[160px]">{item.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* ── My Assigned Batches ────────────────────────── */}
                {(user?.role === 'sho' || user?.role === 'ssho' || user?.role === 'mentor') && (
                    <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.10s' }}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-amber-500" />
                                <CardTitle className="text-base">My Assigned Batches</CardTitle>
                                <Badge variant="secondary" className="text-xs">{myBatches.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingData ? (
                                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                            ) : myBatches.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {myBatches.map(b => (
                                        <div key={b._id} className="flex items-center gap-3 p-3 border border-border/60 rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {b.code?.slice(0, 2) || 'B'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{b.name}</p>
                                                <p className="text-[11px] text-muted-foreground">{b.code} · {(b as any).school?.name || b.school}</p>
                                            </div>
                                            <Badge variant={b.status === 'active' ? 'default' : 'secondary'} className="ml-auto text-[10px]">
                                                {b.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-6">No batches assigned yet</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── My Students ────────────────────────────────── */}
                {(user?.role === 'sho' || user?.role === 'mentor') && (
                    <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.13s' }}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-500" />
                                <CardTitle className="text-base">My Students</CardTitle>
                                <Badge variant="secondary" className="text-xs">{myStudents.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingData ? (
                                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                            ) : myStudents.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {myStudents.map(s => (
                                        <div key={s._id} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                                            <div className="w-7 h-7 rounded-md bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                                {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{s.name}</p>
                                                <p className="text-[11px] text-muted-foreground truncate">{s.batch?.name}</p>
                                            </div>
                                            <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                                                {s.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-6">No students found</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── Activity Summary ───────────────────────────── */}
                <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.16s' }}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-emerald-500" />
                            <CardTitle className="text-base">Activity Summary</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Batches', value: myBatches.length || batches.length, icon: GraduationCap, color: 'text-blue-500 bg-blue-500/10' },
                                { label: 'Students', value: myStudents.length || students.length, icon: Users, color: 'text-indigo-500 bg-indigo-500/10' },
                                { label: 'Active Batches', value: (myBatches.length ? myBatches : batches).filter(b => b.status === 'active').length, icon: Activity, color: 'text-emerald-500 bg-emerald-500/10' },
                                { label: 'Active Students', value: (myStudents.length ? myStudents : students).filter(s => s.status === 'active').length, icon: CheckCircle2, color: 'text-amber-500 bg-amber-500/10' },
                            ].map(stat => {
                                const Icon = stat.icon;
                                return (
                                    <div key={stat.label} className="bg-muted/30 rounded-xl p-4 text-center">
                                        <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Notifications ──────────────────────────────── */}
                <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.19s' }}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-pink-500" />
                            <CardTitle className="text-base">Notification Preferences</CardTitle>
                        </div>
                        <CardDescription>Choose what notifications you want to receive.</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/50">
                        <NotifToggle storageKey="notif_new_student" label="New Student Enrolled" desc="Get notified when a new student joins your batch" />
                        <NotifToggle storageKey="notif_attendance" label="Attendance Reminders" desc="Daily reminder to mark attendance" />
                        <NotifToggle storageKey="notif_assignment" label="Assignment Updates" desc="When new tasks or assignments are added" />
                        <NotifToggle storageKey="notif_feedback" label="Feedback Alerts" desc="When feedback is submitted for your students" />
                    </CardContent>
                </Card>

                {/* ── Login History ──────────────────────────────── */}
                <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.22s' }}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            <CardTitle className="text-base">Login History</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {loginHistory.slice(0, 5).map((entry, i) => (
                                <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{i === 0 ? 'Current session' : 'Previous login'}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {new Date(entry.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                    {i === 0 && <Badge variant="default" className="text-[10px]">Active</Badge>}
                                </div>
                            ))}
                            {loginHistory.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No login history recorded</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Security ───────────────────────────────────── */}
                <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.25s' }}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            <CardTitle className="text-base">Security — Change Password</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                                </div>
                            </div>
                            <Button type="submit" disabled={!currentPassword || !newPassword || !confirmPassword || isUpdating}>
                                {isUpdating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating…</> : 'Update Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* ── Preferences ────────────────────────────────── */}
                <Card className="animate-slide-up border-border/60" style={{ animationDelay: '0.28s' }}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            {theme === 'light' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-500" />}
                            <CardTitle className="text-base">Appearance</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                            <div>
                                <p className="text-sm font-medium">Theme Mode</p>
                                <p className="text-xs text-muted-foreground">Currently: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
                                {theme === 'light' ? <><Moon className="w-4 h-4" />Dark Mode</> : <><Sun className="w-4 h-4" />Light Mode</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
