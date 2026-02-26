import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Shield, Moon, Sun, Monitor, Loader2 } from 'lucide-react';
import { authService } from '@/services/api';

export default function Settings() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setIsUpdating(true);
        try {
            await authService.updatePassword({ currentPassword, newPassword });
            toast.success('Password updated! A verification email has been sent.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setIsUpdating(false);
        }
    };

    const getRoleLabel = (role?: string) => {
        if (!role) return 'User';
        const labels: Record<string, string> = {
            sho: 'Student Happiness Officer',
            ssho: 'Senior SHO',
            academic: 'Academic',
            pl: 'Program Lead',
            mentor: 'Mentor',
            leadership: 'Leadership',
            head_academics: 'Head of Academics',
            ceo_haca: 'CEO of HACA',
            sho_team_lead: 'SHO Team Lead'
        };
        return labels[role] || role;
    };

    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            <div className="mb-8 animate-fade-in">
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Profile Card */}
                <Card className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            <CardTitle>Profile Information</CardTitle>
                        </div>
                        <CardDescription>
                            Your personal account details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={user?.name || ''} readOnly className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" value={user?.email || ''} readOnly className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input id="role" value={getRoleLabel(user?.role)} readOnly className="bg-muted/50" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription>
                            Update your password to keep your account secure.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={!currentPassword || !newPassword || !confirmPassword || isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Preferences Card */}
                <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-violet-500" />
                            <CardTitle>Preferences</CardTitle>
                        </div>
                        <CardDescription>
                            Customize your application experience.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-base">Appearance</Label>
                                <p className="text-sm text-muted-foreground">
                                    Toggle between light and dark mode.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
                                {theme === 'light' ? (
                                    <>
                                        <Moon className="w-4 h-4" />
                                        Dark Mode
                                    </>
                                ) : (
                                    <>
                                        <Sun className="w-4 h-4" />
                                        Light Mode
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
