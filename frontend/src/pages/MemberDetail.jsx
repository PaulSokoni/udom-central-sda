import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  active: 'badge-active', inactive: 'badge-inactive',
  transferred: 'badge-transferred', deceased: 'badge-deceased',
};

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="font-medium text-sm mt-0.5">{value || '—'}</div>
    </div>
  );
}

export default function MemberDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    api.get(`/members/${id}/`).then(r => setMember(r.data));
    api.get(`/tithe/?member=${id}`).then(r => setContributions((r.data.results || r.data).slice(0, 8)));
    api.get(`/attendance/?member=${id}`).then(r => setAttendance((r.data.results || r.data).slice(0, 8)));
  }, [id]);

  const deleteMember = async () => {
    if (!confirm(`Delete ${member?.full_name}? This cannot be undone.`)) return;
    await api.delete(`/members/${id}/`);
    toast.success('Member deleted.');
    navigate('/members');
  };

  if (!member) return <div className="text-center py-16 text-gray-400">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <Link to="/members" className="btn btn-outline btn-sm">← Back to Members</Link>
        {user?.is_staff && (
          <div className="flex gap-2">
            <Link to={`/members/${id}/edit`} className="btn btn-warning btn-sm">✏️ Edit</Link>
            <button onClick={deleteMember} className="btn btn-danger btn-sm">🗑 Delete</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-900 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-3">
              {member.first_name?.[0]}
            </div>
            <h2 className="font-bold text-lg">{member.full_name}</h2>
            <p className="text-blue-800 font-semibold text-sm">{member.member_id}</p>
            <div className="mt-2">
              <span className={`badge ${STATUS_BADGE[member.membership_status]}`}>{member.status_display}</span>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold">Quick Stats</h3></div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-900">{attendance.length}</div>
                  <div className="text-xs text-gray-500">Attendance</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-green-700">{contributions.length}</div>
                  <div className="text-xs text-gray-500">Contributions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold">Personal Information</h3></div>
            <div className="card-body grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="Gender" value={member.gender_display} />
              <InfoRow label="Age" value={member.age ? `${member.age} years` : null} />
              <InfoRow label="Date of Birth" value={member.date_of_birth} />
              <InfoRow label="Marital Status" value={member.marital_status} />
              <InfoRow label="Phone" value={member.phone} />
              <InfoRow label="Email" value={member.email} />
              <div className="col-span-2 md:col-span-3">
                <InfoRow label="Address" value={member.address} />
              </div>
              <InfoRow label="Occupation" value={member.occupation} />
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold">Membership Details</h3></div>
            <div className="card-body grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="Baptism Date" value={member.baptism_date} />
              <InfoRow label="Membership Date" value={member.membership_date} />
              <InfoRow label="Department" value={member.department_name} />
              <InfoRow label="Tithe Paying" value={member.is_tithe_paying ? 'Yes' : 'No'} />
              <InfoRow label="Registered By" value={member.registered_by} />
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">System Login</div>
                {member.has_account
                  ? <span className="badge badge-active mt-1">✓ {member.account_username}</span>
                  : <span className="badge badge-inactive mt-1">No account</span>
                }
              </div>
            </div>
          </div>

          {attendance.length > 0 && (
            <div className="card">
              <div className="card-header"><h3 className="text-sm font-semibold">Recent Attendance</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-th">Date</th>
                      <th className="table-th">Service</th>
                      <th className="table-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="table-td">{a.date}</td>
                        <td className="table-td">{a.service_display}</td>
                        <td className="table-td">
                          <span className={`badge ${a.present ? 'badge-active' : 'badge-inactive'}`}>
                            {a.present ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {contributions.length > 0 && (
            <div className="card">
              <div className="card-header"><h3 className="text-sm font-semibold">Recent Contributions</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-th">Date</th>
                      <th className="table-th">Category</th>
                      <th className="table-th">Amount (TZS)</th>
                      <th className="table-th">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="table-td">{c.date}</td>
                        <td className="table-td">{c.category_display}</td>
                        <td className="table-td font-semibold text-green-700">{Number(c.amount).toLocaleString()}</td>
                        <td className="table-td text-gray-400">{c.receipt_number || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
