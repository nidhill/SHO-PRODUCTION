import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  GraduationCap,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Users,
  Shield,
  BookOpen,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot Password state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setIsForgotOpen(false);
      setForgotEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const quickLogin = async (loginEmail: string) => {
    setEmail(loginEmail);
    setPassword('password');
    setError('');
    setIsLoading(true);
    try {
      await login(loginEmail, 'password');
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch {
      setError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { label: 'SHO', email: 'sho@demo.com', icon: Users },
    { label: 'SSHO', email: 'ssho@demo.com', icon: Shield },
    { label: 'Mentor', email: 'mentor@demo.com', icon: BookOpen },
    { label: 'Admin', email: 'leadership@demo.com', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ==================== LEFT PANEL ==================== */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"
          alt="Students learning"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(225,30%,6%)]/80 via-[hsl(225,30%,6%)]/60 to-[hsl(225,30%,6%)]/90" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">SHO APP</span>
          </div>

          {/* Headline */}
          <div className="max-w-md -mt-10">
            <h1 className="text-[3.2rem] font-extrabold text-white leading-[1.08] tracking-tight">
              Empowering
              <br />
              students through
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500">
                structured
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500">
                growth.
              </span>
            </h1>
            <p className="text-[15px] text-white/50 mt-5 leading-relaxed max-w-sm">
              The all-in-one ecosystem for academic excellence.
              <br />
              Experience a new standard of institutional management.
            </p>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/20 font-medium">
            © 2024 SHO App · Powered by HACA
          </p>
        </div>
      </div>

      {/* ==================== RIGHT PANEL ==================== */}
      <div className="flex-1 flex items-center justify-center bg-[hsl(225,28%,7%)] relative overflow-hidden">
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 w-full max-w-[420px] px-6">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">SHO APP</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-sm text-white/40 mt-1.5">
              Please enter your details to sign in.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5 border-red-500/30 bg-red-500/10">
              <AlertDescription className="text-sm text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white/70">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/[0.06] transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-white/70">
                  Password
                </Label>
                <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="text-xs text-blue-500 hover:text-blue-400 font-semibold transition-colors"
                      tabIndex={-1}
                    >
                      Forgot password?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-[hsl(225,28%,10%)] border-white/10 text-white">
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription className="text-white/60">
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleForgotPassword} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email" className="text-white/80">Email address</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="name@institution.edu"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isForgotLoading || !forgotEmail}
                        className="w-full bg-blue-600 hover:bg-blue-500"
                      >
                        {isForgotLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending link...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
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

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Access */}
          <div className="mt-10">
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.15em] mb-4">
              Quick Access Login
            </p>

            <div className="grid grid-cols-4 gap-2.5">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.label}
                    className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl border border-dashed border-white/[0.12] hover:border-blue-500/40 hover:bg-white/[0.03] transition-all duration-200 group cursor-pointer"
                    onClick={() => !isLoading && quickLogin(role.email)}
                    disabled={isLoading}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500/10 transition-colors duration-200">
                      <Icon className="h-4.5 w-4.5 text-white/40 group-hover:text-blue-400 transition-colors duration-200" />
                    </div>
                    <span className="text-xs font-semibold text-white/50 group-hover:text-white/80 transition-colors duration-200">
                      {role.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center mt-10 text-xs text-white/30">
            New to SHO App?{' '}
            <button className="text-blue-500 hover:text-blue-400 font-semibold underline underline-offset-2 transition-colors">
              Contact Administration.
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
