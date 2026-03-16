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

  Menu,
  CalendarDays,
  X,
  UserCog,
  ShieldAlert,
  Settings as SettingsIcon,
  HelpCircle,
  Building2,
  Database,
  FolderPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    { path: '/academic-management', label: 'Intake', icon: FolderPlus, roles: ['ssho', 'academic', 'pl', 'leadership', 'admin', 'ceo_haca'] },
  ];

  const managementNavItems = [
    { path: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['sho'] },
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
          "relative flex flex-col items-center justify-center gap-1.5 w-full h-[72px] transition-colors duration-200 group rounded-none",
          isActive
            ? "bg-[#F4F6FF] dark:bg-blue-900/10 text-[#0052FF]"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
        )}
      >
        {/* Active border indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#0052FF] dark:bg-blue-500 rounded-r-md" />
        )}

        <Icon className={cn(
          "h-[22px] w-[22px] flex-shrink-0 transition-transform group-hover:scale-110",
          isActive ? "text-[#0052FF] dark:text-blue-400" : ""
        )} strokeWidth={isActive ? 2.5 : 2} />

        <span className={cn(
          "text-[10px] font-medium tracking-wide text-center leading-tight px-1",
          isActive ? "font-semibold text-[#0052FF] dark:text-blue-400" : ""
        )}>
          {item.label}
        </span>
      </NavLink>
    );
  };

  const NavGroupSeparator = () => (
    <div className="w-8 h-px bg-slate-200 dark:bg-white/[0.08] mx-auto my-2" />
  );

  return (
    <TooltipProvider>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-sm border border-border h-9 w-9"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen z-40 py-4 flex flex-col items-center justify-between transition-transform duration-200 w-[90px]",
          "bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-white/[0.06]",
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header / Logo */}
        <div className="h-16 flex flex-col items-center justify-center w-full flex-shrink-0 mb-2">
          <div className="w-[42px] h-[42px] bg-[#0052FF] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <GraduationCap className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 w-full overflow-y-auto custom-scrollbar pb-4">
          <div className="flex flex-col w-full">
            {filterItems(mainNavItems).map((item) => (
              renderNavItem(item)
            ))}

            {filterItems(managementNavItems).length > 0 && (
              <>
                <NavGroupSeparator />
                {filterItems(managementNavItems).map((item) => (
                  renderNavItem(item)
                ))}
              </>
            )}

            {filterItems(otherNavItems).length > 0 && (
              <>
                <NavGroupSeparator />
                {filterItems(otherNavItems).map((item) => (
                  renderNavItem(item)
                ))}
              </>
            )}

            {/* Help item (static, unclickable for aesthetics or can be made real) */}
            <NavGroupSeparator />
            <div className="relative flex flex-col items-center justify-center gap-1.5 w-full h-[72px] text-slate-500 hover:text-slate-900 cursor-pointer transition-colors group">
              <HelpCircle className="h-[22px] w-[22px] flex-shrink-0 transition-transform group-hover:scale-110" strokeWidth={2} />
              <span className="text-[10px] font-medium tracking-wide">Help</span>
            </div>
          </div>
        </nav>

        {/* Removed Footer */}
      </aside>

      {/* Global style for custom slim scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
        /* Fallback for Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
      `}</style>
    </TooltipProvider>
  );
}
