import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ROLE_BADGE = {
  pastor:    { label: 'Pastor',    cls: 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' },
  admin:     { label: 'Admin',     cls: 'bg-orange-400/20 text-orange-300 border border-orange-400/30' },
  elder:     { label: 'Elder',     cls: 'bg-indigo-400/20 text-indigo-300 border border-indigo-400/30' },
  secretary: { label: 'Secretary', cls: 'bg-blue-400/20 text-blue-300 border border-blue-400/30' },
  treasurer: { label: 'Treasurer', cls: 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' },
  leader:    { label: 'Leader',    cls: 'bg-teal-400/20 text-teal-300 border border-teal-400/30' },
  member:    { label: 'Member',    cls: 'bg-white/10 text-white/60 border border-white/10' },
};

function buildNav(user) {
  if (!user) return [];
  const role = user.role || 'member';
  const isSuper = user.is_staff || role === 'pastor';
  const canManageMembers = isSuper || role === 'secretary';
  const canViewFinance = isSuper || role === 'treasurer';
  const canViewReports = isSuper || ['secretary', 'elder'].includes(role);

  return [
    {
      section: 'Main',
      items: [
        { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
        { to: '/my-profile', icon: '◎', label: 'My Profile' },
      ],
    },
    {
      section: 'Congregation',
      items: [
        { to: '/members', icon: '◈', label: 'All Members' },
        canManageMembers && { to: '/members/new', icon: '⊕', label: 'Register Member' },
        { to: '/groups', icon: '⬡', label: 'Depts & Groups' },
        isSuper && { to: '/role-management', icon: '◆', label: 'Assign Roles' },
      ].filter(Boolean),
    },
    {
      section: 'Programs',
      items: [
        { to: '/events', icon: '◷', label: 'Events & Programs' },
        { to: '/attendance', icon: '◻', label: 'Attendance' },
        { to: '/bible-study', icon: '◈', label: 'Bible Study' },
        { to: '/baptisms', icon: '◉', label: 'Baptisms' },
      ],
    },
    {
      section: 'Communication',
      items: [
        { to: '/announcements', icon: '◎', label: 'Announcements' },
        { to: '/prayer-requests', icon: '✦', label: 'Prayer Requests' },
      ],
    },
    canViewFinance && {
      section: 'Finance',
      items: [
        { to: '/tithe', icon: '◈', label: 'Tithe & Offerings' },
        { to: '/finance', icon: '◆', label: 'Financial Records' },
      ],
    },
    canViewReports && {
      section: 'Reports',
      items: [{ to: '/reports', icon: '◫', label: 'Monthly Reports' }],
    },
    {
      section: 'Info',
      items: [
        { to: '/doctrines', icon: '◉', label: 'Doctrines & Beliefs' },
        { to: '/location', icon: '◎', label: 'Live Locations' },
      ],
    },
  ].filter(Boolean);
}

function NavItem({ to, icon, label, onClick }) {
  const location = useLocation();
  const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
  return (
    <Link to={to} onClick={onClick}
      className={`nav-item ${active ? 'nav-item-active' : 'nav-item-idle'}`}>
      <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
    </Link>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const navGroups = buildNav(user);
  const effectiveRole = user?.role === 'pastor' ? 'pastor' : (user?.is_staff ? 'admin' : (user?.role || 'member'));
  const badge = ROLE_BADGE[effectiveRole] || ROLE_BADGE.member;
  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : (user?.username?.[0] || '?').toUpperCase();

  // Close sidebar on route change (mobile)
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Prevent body scroll when mobile sidebar open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const Sidebar = ({ onClose }) => (
    <aside className="flex flex-col h-full w-64 bg-gradient-to-b from-[#0a1e4a] to-[#0d2660] text-white">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex -space-x-2">
            <img src="/sda.jpeg" alt="SDA" className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-lg" />
            <img src="/pcm.jpeg" alt="PCM" className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-lg" />
          </div>
          {onClose && (
            <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              ✕
            </button>
          )}
        </div>
        <div className="font-bold text-sm text-white leading-tight">UDOM Central SDA</div>
        <div className="text-xs text-blue-300/70 mt-0.5 uppercase tracking-widest">Church Mgt System</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
        {navGroups.map(({ section, items }) => (
          <div key={section} className="mb-1">
            <p className="px-6 pt-4 pb-1.5 text-[10px] font-semibold text-blue-400/60 uppercase tracking-[0.15em]">
              {section}
            </p>
            {items.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.full_name || user?.username}</p>
            <p className="text-[11px] text-white/40 truncate">{user?.username}</p>
          </div>
          <button onClick={handleLogout} title="Sign out"
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-300 transition-colors flex-shrink-0">
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* Drawer — all screen sizes */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 flex flex-col h-full shadow-2xl">
            <Sidebar onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4 shadow-sm z-30">
          {/* Hamburger — always visible */}
          <button onClick={() => setOpen(true)}
            className="flex flex-col gap-1.5 p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="w-5 h-0.5 bg-gray-700 rounded" />
            <span className="w-5 h-0.5 bg-gray-700 rounded" />
            <span className="w-4 h-0.5 bg-gray-700 rounded" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/sda.jpeg" alt="" className="w-8 h-8 rounded-full object-cover" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-blue-900 leading-tight">UDOM Central SDA Church</p>
              <p className="text-xs text-gray-400">Management System</p>
            </div>
            <span className="sm:hidden font-bold text-blue-900 text-sm">UDOM Central</span>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-700 leading-tight">{user?.full_name || user?.username}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors">
              <span className="hidden sm:inline">Sign out</span>
              <span>⏻</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
