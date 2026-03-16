import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, LogOut } from 'lucide-react';

export default function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let title = 'SHO App';

        if (path.startsWith('/dashboard')) title = 'Home | SHO';
        else if (path.startsWith('/batches')) title = 'Batches | SHO';
        else if (path.startsWith('/students')) title = 'Students | SHO';
        else if (path.startsWith('/school-management')) title = 'Manage Schools | SHO';
        else if (path.startsWith('/schools')) title = 'Schools | SHO';
        else if (path.startsWith('/attendance')) title = 'Attendance | SHO';
        else if (path.startsWith('/assignments')) title = 'Tasks | SHO';
        else if (path.startsWith('/feedback')) title = 'Feedback | SHO';
        else if (path.startsWith('/class-planner')) title = 'Planner | SHO';
        else if (path.startsWith('/users')) title = 'Users | SHO';
        else if (path.startsWith('/notifications')) title = 'Inbox | SHO';
        else if (path.startsWith('/analytics')) title = 'Analytics | SHO';
        else if (path.startsWith('/system-storage')) title = 'System Storage | SHO';
        else if (path.startsWith('/audit-logs')) title = 'Audit Logs | SHO';
        else if (path.startsWith('/academic-management')) title = 'Academic Management | SHO';
        else if (path.startsWith('/settings')) title = 'Settings | SHO';

        document.title = title;
    }, [location]);

    return (
        <div className="h-screen w-full bg-background flex overflow-hidden">
            <Sidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />
            <main className="flex-1 transition-all duration-200 lg:ml-[90px] h-full flex flex-col overflow-hidden w-full relative">
                <header className="h-16 flex items-center justify-end px-4 lg:px-8 border-b border-border/40 bg-background/95 backdrop-blur z-20 flex-shrink-0 gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="relative w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors overflow-hidden"
                        title="Toggle theme"
                    >
                        <Sun className={`absolute h-5 w-5 transition-all duration-500 ease-in-out ${theme === 'light' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
                        <Moon className={`absolute h-5 w-5 transition-all duration-500 ease-in-out ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
                    </button>

                    {/* User Profile Avatar */}
                    <Link
                        to="/settings"
                        className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center relative group hover:scale-105 transition-transform"
                        title="Profile Settings"
                    >
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                        <div className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-green-500 border border-white dark:border-background rounded-full"></div>
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors ml-1"
                        title="Sign out"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto w-full relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

