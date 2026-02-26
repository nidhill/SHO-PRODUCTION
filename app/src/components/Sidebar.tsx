import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  MessageSquare,
  Bell,
  UserCircle,
  School,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  CalendarDays,
  X,
  UserCog,
  ShieldAlert,
  Settings as SettingsIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const mainNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [] },
    { path: '/batches', label: 'Batches', icon: Users, roles: [] },
    { path: '/students', label: 'Students', icon: GraduationCap, roles: [] },
    { path: '/schools', label: 'Schools', icon: School, roles: ['leadership', 'head_academics', 'ceo_haca', 'sho_team_lead', 'ssho', 'academic', 'pl'] },
  ];

  const managementNavItems = [
    { path: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['sho'] },
    { path: '/assignments', label: 'Assignments', icon: ClipboardList, roles: [] },
    { path: '/feedback', label: 'Feedback', icon: MessageSquare, roles: [] },
    { path: '/class-planner', label: 'Class Planner', icon: CalendarDays, roles: [] },
    { path: '/users', label: 'Users', icon: UserCog, roles: ['leadership', 'ceo_haca', 'head_academics'] },
  ];

  const otherNavItems = [
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['sho', 'ssho', 'academic', 'pl', 'leadership', 'head_academics', 'ceo_haca', 'sho_team_lead'] },
    { path: '/groups', label: 'Groups', icon: UserCircle, roles: [] },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: [] },
    { path: '/audit-logs', label: 'Audit Logs', icon: ShieldAlert, roles: ['leadership', 'ceo_haca'] },
    { path: '/settings', label: 'Settings', icon: SettingsIcon, roles: [] },
  ];

  const filterItems = (items: typeof mainNavItems) =>
    items.filter(item => item.roles.length === 0 || hasRole(item.roles));

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      sho: 'SHO',
      ssho: 'SSHO',
      academic: 'Academic',
      pl: 'Program Lead',
      mentor: 'Mentor',
      leadership: 'Leadership',
      head_academics: 'Head Academics',
      ceo_haca: 'CEO HACA',
      sho_team_lead: 'SHO Lead'
    };
    return labels[role] || role;
  };

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

    const content = (
      <NavLink
        to={item.path}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]",
          isCollapsed && "justify-center px-2"
        )}
      >
        <Icon className={cn(
          "h-[18px] w-[18px] flex-shrink-0",
          isActive ? "text-blue-400" : ""
        )} />
        {!isCollapsed && <span>{item.label}</span>}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const NavGroup = ({ label, items }: { label: string; items: typeof mainNavItems }) => {
    const filtered = filterItems(items);
    if (filtered.length === 0) return null;

    return (
      <div className="space-y-0.5">
        {!isCollapsed && (
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1.5">
            {label}
          </p>
        )}
        {isCollapsed && <div className="h-px bg-white/[0.06] mx-2 my-2" />}
        {filtered.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    );
  };

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
          "fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-200",
          "bg-[hsl(225,30%,8%)] border-r border-white/[0.06]",
          isCollapsed ? 'w-[72px]' : 'w-60',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-white/[0.06] flex-shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <div className="leading-none">
                <span className="font-semibold text-white text-sm">SHO App</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Management Platform</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] h-7 w-7"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
          <NavGroup label="Overview" items={mainNavItems} />
          <NavGroup label="Management" items={managementNavItems} />
          <NavGroup label="More" items={otherNavItems} />
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.06] p-2 space-y-1 flex-shrink-0">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-2.5 text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] rounded-lg h-8 text-[13px]",
              isCollapsed && "justify-center"
            )}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {!isCollapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </Button>

          {/* User */}
          {!isCollapsed && (
            <div className="px-2 py-2 rounded-lg bg-white/[0.03]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500">{getRoleLabel(user?.role || '')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] rounded-lg h-8 text-[13px]",
              isCollapsed && "justify-center px-2"
            )}
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Sign out</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
