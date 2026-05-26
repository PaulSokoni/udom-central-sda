import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';

const ROLES = [
  { value: 'pastor', label: 'Pastor', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'admin', label: 'Administrator', color: 'bg-orange-100 text-orange-800' },
  { value: 'elder', label: 'Church Elder', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'secretary', label: 'Church Secretary', color: 'bg-blue-100 text-blue-800' },
  { value: 'treasurer', label: 'Treasurer', color: 'bg-green-100 text-green-800' },
  { value: 'leader', label: 'Dept / Group Leader', color: 'bg-amber-100 text-amber-800' },
  { value: 'member', label: 'Regular Member', color: 'bg-gray-100 text-gray-700' },
];

const ROLE_COLOR = Object.fromEntries(ROLES.map(r => [r.value, r.color]));

export default function RoleManagement() {
  const { user: currentUser } = useAuth();
  const isPastor = currentUser?.role === 'pastor';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/user-roles/');
      setUsers(r.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (userId, role) => {
    setSaving(userId);
    try {
      await api.patch(`/user-roles/${userId}/`, { role });
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role, role_display: ROLES.find(r => r.value === role)?.label } : u));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally { setSaving(null); }
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    setDeleting(userId);
    try {
      await api.delete(`/user-roles/${userId}/`);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      toast.success(`User "${username}" deleted`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    } finally { setDeleting(null); }
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold">User Role Management</h2>
        <p className="text-sm text-gray-500 mt-1">Assign roles to system users to control their access and permissions.</p>
      </div>

      {/* Role legend */}
      <div className="card p-4 mb-5">
        <h3 className="text-sm font-semibold mb-3">Role Permissions Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {[
            { role: 'pastor', desc: 'Highest privilege — full system access, manage all roles including admin, finance, prayer, reports, and all records.' },
            { role: 'admin', desc: 'Full system access — register members, all records, all reports. Cannot outrank pastor.' },
            { role: 'secretary', desc: 'Register members, view all data, create reports. No finance or prayer access.' },
            { role: 'elder', desc: 'View all prayer requests, members, and attendance.' },
            { role: 'treasurer', desc: 'Full access to financial records — income, expenses, pledges.' },
            { role: 'leader', desc: 'View members, attendance. Standard church access.' },
            { role: 'member', desc: 'Own profile, events, announcements, prayer requests (own only).' },
          ].map(({ role, desc }) => (
            <div key={role} className={`p-2 rounded-lg ${ROLE_COLOR[role] || 'bg-gray-50'}`}>
              <span className="font-semibold">{ROLES.find(r => r.value === role)?.label}</span>
              <p className="mt-0.5 opacity-80">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-sm">System Users ({users.length})</h3>
          <input
            className="input py-1.5 text-sm w-48"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">User</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Current Role</th>
                  <th className="table-th">Change Role</th>
                  {isPastor && <th className="table-th">Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={isPastor ? 5 : 4} className="table-td text-center text-gray-400 py-8">No users found.</td></tr>
                )}
                {filtered.map(u => (
                  <tr key={u.user_id} className="hover:bg-gray-50">
                    <td className="table-td">
                      <div className="font-semibold text-sm">{u.full_name}</div>
                      <div className="text-xs text-gray-400">@{u.username}</div>
                      {u.is_staff && <span className="text-xs text-amber-600 font-medium">Django Admin</span>}
                    </td>
                    <td className="table-td text-sm text-gray-500">{u.email || '—'}</td>
                    <td className="table-td">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[u.role === 'pastor' ? 'pastor' : (u.is_staff ? 'admin' : u.role)] || ROLE_COLOR.member}`}>
                        {u.role_display}
                      </span>
                    </td>
                    <td className="table-td">
                      {u.is_staff ? (
                        <span className="text-xs text-gray-400 italic">Role set by Django admin status</span>
                      ) : (u.role === 'admin' && !isPastor) ? (
                        <span className="text-xs text-amber-600 font-medium">Pastor only 🔒</span>
                      ) : (
                        <select
                          className="input py-1 text-sm w-44"
                          value={u.role}
                          disabled={saving === u.user_id}
                          onChange={e => updateRole(u.user_id, e.target.value)}
                        >
                          {ROLES.filter(r => isPastor || r.value !== 'admin').map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    {isPastor && (
                      <td className="table-td">
                        {u.user_id === currentUser?.id ? (
                          <span className="text-xs text-gray-300 italic">—</span>
                        ) : (
                          <button
                            className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-40"
                            disabled={deleting === u.user_id}
                            onClick={() => deleteUser(u.user_id, u.username)}
                          >
                            {deleting === u.user_id ? 'Deleting…' : 'Delete'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
