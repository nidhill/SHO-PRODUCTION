import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, LogOut } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/batches': 'Batches',
    '/students': 'Students',
    '/school-management': 'Manage Schools',
    '/schools': 'Schools',
    '/attendance': 'Attendance',
    '/assignments': 'Assignments',
    '/feedback': 'Feedback',
    '/class-planner': 'Class Planner',
    '/users': 'Users',
    '/notifications': 'Notifications',
    '/analytics': 'Analytics',
    '/system-storage': 'System Storage',
    '/audit-logs': 'Audit Logs',
    '/settings': 'Settings & Profile',
};

function getPageTitle(pathname: string): string {
    for (const [key, label] of Object.entries(PAGE_TITLES)) {
        if (pathname.startsWith(key)) return label;
    }
    return 'SHO App';
}

export default function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const pageTitle = getPageTitle(location.pathname);

    useEffect(() => {
        document.title = `${pageTitle} | SHO`;
    }, [pageTitle]);

    return (
        <div className="h-screen w-full bg-background flex overflow-hidden">
            <Sidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />
            <main className="flex-1 transition-all duration-200 lg:ml-[90px] h-full flex flex-col overflow-hidden w-full relative">
                <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border/40 bg-background/95 backdrop-blur z-20 flex-shrink-0">
                    {/* Page Title */}
                    <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-sm font-semibold text-foreground truncate">{pageTitle}</h2>
                    </div>
                    <div className="flex items-center gap-3">
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
                        className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
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

