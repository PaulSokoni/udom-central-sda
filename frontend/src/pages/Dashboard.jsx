import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

function StatCard({ icon, value, label, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    pink: 'bg-pink-50 text-pink-700',
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value ?? '—'}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/').then(r => setStats(r.data));
  }, []);

  const STATUS_BADGE = {
    active: 'badge-active',
    inactive: 'badge-inactive',
    transferred: 'badge-transferred',
    deceased: 'badge-deceased',
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-7">
        <StatCard icon="👥" value={stats?.total_members} label="Total Members" color="blue" />
        <StatCard icon="✅" value={stats?.active_members} label="Active Members" color="green" />
        <StatCard icon="♂" value={stats?.male_count} label="Male Members" color="blue" />
        <StatCard icon="♀" value={stats?.female_count} label="Female Members" color="pink" />
        <StatCard icon="💧" value={stats?.this_month_baptisms} label="Baptisms This Month" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Members */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="font-semibold text-sm">Recent Registrations</h3>
            <Link to="/members" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Member ID</th>
                  <th className="table-th">Name</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Registered</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_members?.length ? stats.recent_members.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="table-td">
                      <Link to={`/members/${m.id}`} className="text-blue-800 font-semibold hover:underline">
                        {m.member_id}
                      </Link>
                    </td>
                    <td className="table-td">{m.first_name} {m.last_name}</td>
                    <td className="table-td">
                      <span className={`badge ${STATUS_BADGE[m.membership_status] || 'badge-inactive'}`}>
                        {m.membership_status}
                      </span>
                    </td>
                    <td className="table-td text-gray-400 text-xs">
                      {new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="table-td text-center text-gray-400 py-8">No members yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions (admin only) + Latest Report */}
        <div className="space-y-5">
          {(user?.is_staff || user?.role === 'pastor') && (
            <div className="card">
              <div className="card-header"><h3 className="font-semibold text-sm">Quick Actions</h3></div>
              <div className="card-body flex flex-col gap-2">
                <Link to="/members/new" className="btn btn-primary w-full justify-center">➕ Register Member</Link>
                <Link to="/attendance/bulk" className="btn btn-success w-full justify-center">📋 Bulk Attendance</Link>
                <Link to="/tithe/new" className="btn btn-warning w-full justify-center">💰 Record Tithe</Link>
                <Link to="/reports/new" className="btn btn-outline w-full justify-center">📊 Create Report</Link>
              </div>
            </div>
          )}

          {stats?.latest_report && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-sm">Latest Report</h3>
                <Link to={`/reports/${stats.latest_report.id}`} className="btn btn-outline btn-sm">View</Link>
              </div>
              <div className="card-body">
                <p className="font-semibold text-blue-900">{stats.latest_report.month_name} {stats.latest_report.year}</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-900">{stats.latest_report.total_members}</div>
                    <div className="text-xs text-gray-500">Members</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-green-700">{stats.latest_report.new_baptisms}</div>
                    <div className="text-xs text-gray-500">Baptisms</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
