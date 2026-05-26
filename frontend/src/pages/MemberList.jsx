import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

const STATUS_BADGE = {
  active: 'badge-active', inactive: 'badge-inactive',
  transferred: 'badge-transferred', deceased: 'badge-deceased',
};

export default function MemberList() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (gender) params.set('gender', gender);
    api.get(`/members/?${params}`).then(r => {
      setMembers(r.data.results || r.data);
      setCount(r.data.count || 0);
    }).finally(() => setLoading(false));
  }, [search, status, gender, page]);

  const totalPages = Math.ceil(count / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Church Members <span className="text-gray-400 font-normal text-base">({count})</span></h2>
        {user?.is_staff && (
          <Link to="/members/new" className="btn btn-primary">➕ Register New Member</Link>
        )}
      </div>

      <div className="card mb-5">
        <div className="card-body">
          <div className="flex flex-wrap gap-3">
            <input
              className="input flex-1 min-w-48"
              placeholder="Search by name, member ID, or phone…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <select className="select w-36" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="transferred">Transferred</option>
              <option value="deceased">Deceased</option>
            </select>
            <select className="select w-28" value={gender} onChange={e => { setGender(e.target.value); setPage(1); }}>
              <option value="">All Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Member ID</th>
                <th className="table-th">Name</th>
                <th className="table-th">Gender</th>
                <th className="table-th">Phone</th>
                <th className="table-th">Department</th>
                <th className="table-th">Status</th>
                <th className="table-th">Login</th>
                <th className="table-th">Joined</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="table-td text-center py-8 text-gray-400">Loading…</td></tr>
              ) : members.length ? members.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="table-td font-semibold">{m.member_id}</td>
                  <td className="table-td">
                    <Link to={`/members/${m.id}`} className="text-blue-800 hover:underline font-medium">
                      {m.full_name}
                    </Link>
                  </td>
                  <td className="table-td">
                    <span className={`badge ${m.gender === 'M' ? 'badge-male' : 'badge-female'}`}>
                      {m.gender_display}
                    </span>
                  </td>
                  <td className="table-td text-gray-500">{m.phone || '—'}</td>
                  <td className="table-td text-gray-500">{m.department_name || '—'}</td>
                  <td className="table-td">
                    <span className={`badge ${STATUS_BADGE[m.membership_status]}`}>{m.status_display}</span>
                  </td>
                  <td className="table-td">
                    {m.has_account
                      ? <span className="badge badge-active">✓ Yes</span>
                      : <span className="text-gray-300 text-xs">—</span>
                    }
                  </td>
                  <td className="table-td text-gray-400 text-xs">
                    {new Date(m.membership_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="table-td">
                    <div className="flex gap-1">
                      <Link to={`/members/${m.id}`} className="btn btn-outline btn-sm">View</Link>
                      {user?.is_staff && (
                        <Link to={`/members/${m.id}/edit`} className="btn btn-warning btn-sm">Edit</Link>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="table-td text-center py-8 text-gray-400">No members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-outline btn-sm">Prev</button>
            <span className="px-3 py-1 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-outline btn-sm">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
