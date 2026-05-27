import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ icon, value, label, sub, color }) {
  const styles = {
    blue:   { bg: 'from-blue-600 to-blue-800',   icon: 'bg-blue-500/30' },
    green:  { bg: 'from-emerald-500 to-emerald-700', icon: 'bg-emerald-400/30' },
    indigo: { bg: 'from-indigo-500 to-indigo-700', icon: 'bg-indigo-400/30' },
    pink:   { bg: 'from-pink-500 to-rose-600',   icon: 'bg-pink-400/30' },
    amber:  { bg: 'from-amber-500 to-orange-600', icon: 'bg-amber-400/30' },
    teal:   { bg: 'from-teal-500 to-teal-700',   icon: 'bg-teal-400/30' },
  };
  const s = styles[color] || styles.blue;
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${s.bg} p-5 text-white shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-extrabold mt-1">{value ?? '—'}</p>
          {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${s.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon, label, desc, color }) {
  const colors = {
    blue:  'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    green: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50',
    amber: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50',
    indigo:'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50',
    pink:  'border-pink-200 hover:border-pink-400 hover:bg-pink-50',
    teal:  'border-teal-200 hover:border-teal-400 hover:bg-teal-50',
  };
  return (
    <Link to={to} className={`flex items-center gap-3 p-4 rounded-xl border-2 bg-white transition-all ${colors[color] || colors.blue}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        <p className="text-gray-400 text-xs">{desc}</p>
      </div>
    </Link>
  );
}

const STATUS_BADGE = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-500',
  transferred: 'bg-blue-100 text-blue-600',
  deceased: 'bg-red-100 text-red-500',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const isAdmin = user?.is_staff || user?.role === 'pastor';

  useEffect(() => {
    api.get('/dashboard/').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">

      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-blue-200 text-sm font-medium">{today}</p>
          <h1 className="text-2xl font-extrabold mt-0.5">
            {greeting()}, {user?.full_name?.split(' ')[0] || user?.username} 👋
          </h1>
          <p className="text-blue-300 text-sm mt-1">UDOM Central SDA Church — Management System</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-xl text-sm font-medium">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon="👥" value={stats?.total_members}   label="Total Members"      color="blue"   />
        <StatCard icon="✅" value={stats?.active_members}  label="Active Members"     color="green"  />
        <StatCard icon="🙋" value={stats?.male_count}      label="Brothers"           color="indigo" />
        <StatCard icon="🙋‍♀️" value={stats?.female_count}  label="Sisters"            color="pink"   />
        <StatCard icon="💧" value={stats?.this_month_baptisms} label="Baptisms / Month" color="teal" />
        <StatCard icon="📊" value={stats?.latest_report?.total_members ?? '—'} label="Last Report" sub={stats?.latest_report ? `${stats.latest_report.month_name} ${stats.latest_report.year}` : ''} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent members */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Recent Registrations</h3>
            <Link to="/members" className="text-sm text-blue-700 font-medium hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">ID</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats?.recent_members?.length ? stats.recent_members.map(m => (
                  <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-3">
                      <Link to={`/members/${m.id}`} className="text-blue-700 font-bold text-sm hover:underline">
                        {m.member_id}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-700 text-sm font-medium">{m.first_name} {m.last_name}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[m.membership_status] || 'bg-gray-100 text-gray-500'}`}>
                        {m.membership_status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-300 text-sm">
                      No members registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Latest report */}
          {stats?.latest_report && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm">Latest Report</h3>
                <Link to={`/reports/${stats.latest_report.id}`} className="text-xs text-blue-700 font-medium hover:underline">View →</Link>
              </div>
              <div className="p-5">
                <p className="font-bold text-blue-900 text-base">{stats.latest_report.month_name} {stats.latest_report.year}</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { label: 'Members', value: stats.latest_report.total_members, color: 'text-blue-700' },
                    { label: 'Baptisms', value: stats.latest_report.new_baptisms, color: 'text-emerald-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className={`text-2xl font-extrabold ${color}`}>{value ?? '—'}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          {isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm">Quick Actions</h3>
              </div>
              <div className="p-4 grid grid-cols-1 gap-2">
                <QuickLink to="/members/new"     icon="➕" label="Register Member"  desc="Add a new church member"   color="blue"  />
                <QuickLink to="/attendance/bulk" icon="📋" label="Bulk Attendance"  desc="Mark Sabbath attendance"    color="green" />
                <QuickLink to="/tithe/new"       icon="💰" label="Record Tithe"     desc="Log tithe contribution"     color="amber" />
                <QuickLink to="/reports/new"     icon="📊" label="Create Report"    desc="Monthly church report"      color="indigo"/>
                <QuickLink to="/events"          icon="📅" label="View Events"      desc="Upcoming church events"     color="teal"  />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
