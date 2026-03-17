import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, LogOut, Menu } from 'lucide-react';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/batches': 'Batches',
  '/students': 'Students',
  '/school-management': 'Manage Schools',
  '/schools': 'Schools',
  '/attendance': 'Attendance',
  '/assignments': 'Tasks',
  '/feedback': 'Feedback',
  '/class-planner': 'Class Planner',
  '/users': 'Users',
  '/notifications': 'Inbox',
  '/analytics': 'Analytics',
  '/system-storage': 'System Storage',
  '/audit-logs': 'Audit Logs',
  '/academic-management': 'Academic Management',
  '/settings': 'Settings',
};

const ROLE_LABELS: Record<string, string> = {
  sho: 'SHO',
  ssho: 'Senior SHO',
  academic: 'Academic Lead',
  mentor: 'Mentor',
  leadership: 'Leadership',
  admin: 'Administrator',
  ceo_haca: 'CEO',
  pl: 'Project Lead',
};

export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const pageTitle =
    Object.entries(ROUTE_TITLES).find(
      ([path]) => location.pathname === path || location.pathname.startsWith(`${path}/`)
    )?.[1] ?? 'SHO';

  useEffect(() => {
    document.title = `${pageTitle} | SHO`;
  }, [pageTitle]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden">
      <Sidebar
        isCollapsed={false}
        setIsCollapsed={() => {}}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main className="flex-1 lg:ml-[90px] h-full flex flex-col overflow-hidden w-full relative">
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border/50 bg-background/95 backdrop-blur-md z-20 flex-shrink-0">

          {/* Left: mobile toggle + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-[15px] font-semibold tracking-tight text-foreground font-heading leading-none">
              {pageTitle}
            </h1>
          </div>

          {/* Right: theme + user + logout */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors overflow-hidden"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <Sun
                className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
                  theme === 'light' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
              <Moon
                className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
                  theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                }`}
              />
            </button>

            {/* User profile */}
            <Link
              to="/settings"
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-lg hover:bg-muted transition-colors ml-1"
              title="Profile & Settings"
            >
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-[11px] font-bold text-white leading-none">{initials}</span>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full" />
              </div>
              <div className="hidden sm:block leading-none">
                <p className="text-[13px] font-semibold text-foreground leading-none">
                  {user?.name?.split(' ')[0]}
                </p>
                <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                  {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
                </p>
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
