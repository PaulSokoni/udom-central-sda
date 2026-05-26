import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ROLE_BADGE = {
  pastor: { label: 'Pastor', cls: 'bg-yellow-500 text-white' },   // highest — gold
  admin: { label: 'Admin', cls: 'bg-amber-600 text-white' },
  elder: { label: 'Elder', cls: 'bg-indigo-500 text-white' },
  secretary: { label: 'Secretary', cls: 'bg-blue-500 text-white' },
  treasurer: { label: 'Treasurer', cls: 'bg-green-600 text-white' },
  leader: { label: 'Leader', cls: 'bg-teal-500 text-white' },
  member: { label: 'Member', cls: 'bg-gray-400 text-white' },
};

function buildNav(user) {
  if (!user) return [];
  const role = user.role || 'member';
  const isSuper = user.is_staff || role === 'pastor'; // Pastor = highest privilege
  const isAdmin = user.is_staff;
  const canManageMembers = isSuper || role === 'secretary';
  const canViewFinance = isSuper || role === 'treasurer';
  const canViewReports = isSuper || ['secretary', 'elder'].includes(role);

  return [
    {
      section: 'Main',
      items: [
        { to: '/', icon: '🏠', label: 'Dashboard' },
        { to: '/my-profile', icon: '👤', label: 'My Profile' },
      ],
    },
    {
      section: 'Members',
      items: [
        { to: '/members', icon: '👥', label: 'All Members' },
        canManageMembers && { to: '/members/new', icon: '➕', label: 'Register Member' },
        { to: '/groups', icon: '🏘️', label: 'Depts, Groups & Choirs' },
        isSuper && { to: '/role-management', icon: '🔑', label: 'Assign Roles' },
      ].filter(Boolean),
    },
    {
      section: 'Events & Programs',
      items: [{ to: '/events', icon: '📅', label: 'Events & Programs' }],
    },
    {
      section: 'Spiritual Records',
      items: [
        { to: '/attendance', icon: '📋', label: 'Attendance' },
        { to: '/tithe', icon: '💰', label: 'Tithe & Offerings' },
        { to: '/bible-study', icon: '📖', label: 'Bible Study' },
        { to: '/baptisms', icon: '💧', label: 'Baptisms' },
      ],
    },
    {
      section: 'Communication',
      items: [
        { to: '/announcements', icon: '📢', label: 'Announcements' },
        { to: '/prayer-requests', icon: '🙏', label: 'Prayer Requests' },
      ],
    },
    canViewFinance && {
      section: 'Finance',
      items: [{ to: '/finance', icon: '💳', label: 'Financial Records' }],
    },
    canViewReports && {
      section: 'Reports',
      items: [{ to: '/reports', icon: '📊', label: 'Monthly Reports' }],
    },
    {
      section: 'Church Info',
      items: [
        { to: '/doctrines', icon: '📜', label: 'Doctrines & Beliefs' },
        { to: '/location', icon: '📍', label: 'Live Locations' },
      ],
    },
  ].filter(Boolean);
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = buildNav(user);
  const effectiveRole = user?.role === 'pastor' ? 'pastor' : (user?.is_staff ? 'admin' : (user?.role || 'member'));
  const badge = ROLE_BADGE[effectiveRole] || ROLE_BADGE.member;

  return (
    <div className="flex min-h-screen"
      style={{ backgroundImage: 'url(/udom.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 text-white flex flex-col z-50"
        style={{ background: 'rgba(10, 30, 70, 0.88)', backdropFilter: 'blur(4px)' }}>

        {/* Brand */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/sda.jpeg" alt="SDA Logo" className="w-12 h-12 rounded-full object-cover border-2 border-white/30 shadow" />
            <img src="/pcm.jpeg" alt="PCM Logo" className="w-12 h-12 rounded-full object-cover border-2 border-white/30 shadow" />
          </div>
          <div className="text-center">
            <div className="font-bold text-sm leading-tight">UDOM Central SDA Church</div>
            <div className="text-xs text-blue-300 mt-1 uppercase tracking-wide">Seventh-day Adventist</div>
          </div>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(({ section, items }) => (
            <div key={section}>
              <div className="px-5 py-2 text-xs text-blue-400 uppercase tracking-widest mt-2">{section}</div>
              {items.map(({ to, icon, label }) => {
                const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                return (
                  <Link key={to} to={to}
                    className={`flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors ${
                      active ? 'bg-white/15 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-base w-5 text-center">{icon}</span>
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

      </aside>

      {/* Main content */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 px-7 h-16 flex items-center justify-between shadow-sm"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-3">
            <img src="/sda.jpeg" alt="SDA" className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm" />
            <img src="/pcm.jpeg" alt="PCM" className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm" />
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-blue-900">UDOM Central SDA Church</div>
              <div className="text-xs text-gray-400">Church Management System</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.username}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
          </div>
        </header>

        <main className="flex-1 p-7"
          style={{ background: 'rgba(240, 244, 255, 0.82)', backdropFilter: 'blur(2px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
