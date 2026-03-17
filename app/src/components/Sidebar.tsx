import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  MessageSquare,
  Bell,
  School,
  BarChart3,
  CalendarDays,
  UserCog,
  ShieldAlert,
  Settings as SettingsIcon,
  HelpCircle,
  Building2,
  Database,
  FolderPlus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const { hasRole } = useAuth();
  const location = useLocation();

  const mainNavItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard, roles: [] },
    { path: '/batches', label: 'Batches', icon: Users, roles: [] },
    { path: '/students', label: 'Students', icon: GraduationCap, roles: [] },
    { path: '/school-management', label: 'Manage', icon: Building2, roles: ['ssho', 'academic', 'pl', 'leadership', 'admin', 'ceo_haca'] },
    { path: '/schools', label: 'Schools', icon: School, roles: ['leadership', 'admin', 'ssho', 'academic', 'ceo_haca', 'pl'] },
    { path: '/academic-management', label: 'New Intake', icon: FolderPlus, roles: ['ssho', 'academic', 'pl', 'leadership', 'admin', 'ceo_haca'] },
  ];

  const managementNavItems = [
    { path: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['sho', 'ssho', 'academic', 'pl', 'leadership', 'admin', 'ceo_haca'] },
    { path: '/assignments', label: 'Tasks', icon: ClipboardList, roles: [] },
    { path: '/feedback', label: 'Feedback', icon: MessageSquare, roles: [] },
    { path: '/class-planner', label: 'Planner', icon: CalendarDays, roles: [] },
    { path: '/users', label: 'Users', icon: UserCog, roles: ['leadership', 'admin', 'ceo_haca'] },
  ];

  const otherNavItems = [
    { path: '/notifications', label: 'Inbox', icon: Bell, roles: ['sho', 'ssho', 'academic', 'leadership', 'admin', 'mentor', 'ceo_haca', 'pl'] },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: [] },
    { path: '/system-storage', label: 'System', icon: Database, roles: ['leadership', 'admin', 'ceo_haca'] },
    { path: '/audit-logs', label: 'Logs', icon: ShieldAlert, roles: ['leadership', 'admin', 'ceo_haca'] },
    { path: '/settings', label: 'Settings', icon: SettingsIcon, roles: [] },
  ];

  const filterItems = (items: typeof mainNavItems) =>
    items.filter(item => item.roles.length === 0 || hasRole(item.roles));

  const renderNavItem = (item: typeof mainNavItems[0]) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          'relative flex flex-col items-center justify-center gap-1.5 w-full h-[68px] transition-all duration-200 group',
          isActive
            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
        )}
      >
        {/* Active left border */}
        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-blue-600 dark:bg-blue-400 rounded-r-full" />
        )}

        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
          isActive
            ? 'bg-blue-600 dark:bg-blue-500 shadow-md shadow-blue-600/25'
            : 'bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-white/[0.05]'
        )}>
          <Icon
            className={cn(
              'h-[18px] w-[18px] flex-shrink-0 transition-all',
              isActive ? 'text-white' : ''
            )}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </div>

        <span className={cn(
          'text-[10px] font-medium tracking-wide text-center leading-none',
          isActive ? 'font-semibold text-blue-600 dark:text-blue-400' : ''
        )}>
          {item.label}
        </span>
      </NavLink>
    );
  };

  const Divider = () => (
    <div className="mx-auto my-1.5 w-7 h-px bg-slate-200 dark:bg-white/[0.07]" />
  );

  return (
    <TooltipProvider>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-50 flex flex-col items-center transition-transform duration-250 w-[86px]',
          'bg-white dark:bg-[#070d1a] border-r border-slate-200/80 dark:border-white/[0.05]',
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className="h-14 flex flex-col items-center justify-center w-full flex-shrink-0 border-b border-slate-200/60 dark:border-white/[0.04] mb-1">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-3 right-2 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 w-full overflow-y-auto pb-4 pt-1" style={{ scrollbarWidth: 'none' }}>
          <div className="flex flex-col w-full">
            {filterItems(mainNavItems).map(renderNavItem)}

            {filterItems(managementNavItems).length > 0 && (
              <>
                <Divider />
                {filterItems(managementNavItems).map(renderNavItem)}
              </>
            )}

            {filterItems(otherNavItems).length > 0 && (
              <>
                <Divider />
                {filterItems(otherNavItems).map(renderNavItem)}
              </>
            )}

            <Divider />
            <div className="relative flex flex-col items-center justify-center gap-1.5 w-full h-[68px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-white/[0.05] transition-colors">
                <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-medium">Help</span>
            </div>
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
