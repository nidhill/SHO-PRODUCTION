import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/api';

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(token, password);
            toast.success('Password reset successfully! You can now log in.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(225,28%,7%)] relative overflow-hidden px-6">
            {/* Subtle pattern */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)`,
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative z-10 w-full max-w-[420px] bg-white/[0.02] border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">SHO APP</span>
                </div>

                <div className="mb-8">
                    <h2 className="text-[28px] font-bold text-white tracking-tight">Create New Password</h2>
                    <p className="text-sm text-white/40 mt-1.5">
                        Please enter your new password below.
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-5 border-red-500/30 bg-red-500/10">
                        <AlertDescription className="text-sm text-red-400">{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-white/70">
                            New Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-12 text-sm pr-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-blue-500/50 focus:bg-white/[0.06] transition-all duration-200"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/70">
                            Confirm New Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-blue-500/50 focus:bg-white/[0.06] transition-all duration-200"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 transition-all duration-300 mt-4"
                        disabled={isLoading || !password || !confirmPassword}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            <>
                                Reset Password
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>

                <p className="text-center mt-8 text-xs text-white/40">
                    Remember your password?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-blue-500 hover:text-blue-400 font-semibold underline underline-offset-2 transition-colors"
                    >
                        Back to login
                    </button>
                </p>
            </div>
        </div>
    );
}
