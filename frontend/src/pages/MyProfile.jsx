import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function MyProfile() {
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [prayerCount, setPrayerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.member_pk) { setLoading(false); return; }
    Promise.all([
      api.get(`/members/${user.member_pk}/`),
      api.get(`/attendance/?member=${user.member_pk}`),
      api.get(`/tithe/?member=${user.member_pk}`),
      api.get('/prayer-requests/'),
    ]).then(([mRes, aRes, cRes, pRes]) => {
      setMember(mRes.data);
      setAttendance((aRes.data.results || aRes.data).slice(0, 10));
      setContributions((cRes.data.results || cRes.data).slice(0, 8));
      const prayers = pRes.data.results || pRes.data;
      setPrayerCount(prayers.length);
    }).catch(() => toast.error('Failed to load profile'))
    .finally(() => setLoading(false));
  }, [user?.member_pk]);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading your profile…</div>;

  if (!user?.member_pk) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">👤</div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">No Member Profile Linked</h2>
        <p className="text-gray-500 text-sm">Your user account is not yet linked to a member record. Please contact the church administrator.</p>
      </div>
    );
  }

  if (!member) return <div className="text-center py-16 text-gray-400">Profile not found.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">My Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="space-y-4">
          <div className="card p-6 text-center">
            {member.photo ? (
              <img src={`http://localhost:8002${member.photo}`} alt="Profile"
                className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-blue-100" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-900 text-white flex items-center justify-center text-4xl font-bold mx-auto mb-3">
                {member.first_name?.[0]}
              </div>
            )}
            <h2 className="font-bold text-lg">{member.full_name}</h2>
            <p className="text-blue-800 font-semibold text-sm">{member.member_id}</p>
            <div className="mt-2">
              <span className={`badge ${STATUS_BADGE[member.membership_status] || 'badge-inactive'}`}>
                {member.status_display}
              </span>
            </div>
            {member.department_name && (
              <p className="text-xs text-gray-500 mt-2">📂 {member.department_name}</p>
            )}
          </div>

          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold">My Activity</h3></div>
            <div className="card-body grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-blue-900">{attendance.length}</div>
                <div className="text-xs text-gray-500">Attendance</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-green-700">{contributions.length}</div>
                <div className="text-xs text-gray-500">Contributions</div>
              </div>
              <div className="col-span-2 text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-700">{prayerCount}</div>
                <div className="text-xs text-gray-500">Prayer Requests</div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/events" className="btn btn-outline btn-sm w-full justify-center">📅 View Events & Schedule</Link>
              <Link to="/announcements" className="btn btn-outline btn-sm w-full justify-center">📢 Announcements</Link>
              <Link to="/prayer-requests" className="btn btn-outline btn-sm w-full justify-center">🙏 Prayer Requests</Link>
              <Link to="/doctrines" className="btn btn-outline btn-sm w-full justify-center">📜 Church Doctrines</Link>
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
              <InfoRow label="Member Since" value={member.membership_date} />
              <InfoRow label="Baptism Date" value={member.baptism_date} />
              <InfoRow label="Department" value={member.department_name} />
              <InfoRow label="Tithe Paying" value={member.is_tithe_paying ? 'Yes' : 'No'} />
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold">Emergency Contact</h3></div>
            <div className="card-body grid grid-cols-2 gap-4">
              <InfoRow label="Contact Name" value={member.emergency_contact_name} />
              <InfoRow label="Contact Phone" value={member.emergency_contact_phone} />
            </div>
          </div>

          {attendance.length > 0 && (
            <div className="card">
              <div className="card-header"><h3 className="text-sm font-semibold">My Attendance (Recent)</h3></div>
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
                        <td className="table-td">{a.service_display || a.service_type}</td>
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
              <div className="card-header"><h3 className="text-sm font-semibold">My Contributions (Recent)</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-th">Date</th>
                      <th className="table-th">Category</th>
                      <th className="table-th">Amount (TZS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="table-td">{c.date}</td>
                        <td className="table-td">{c.category_display}</td>
                        <td className="table-td font-semibold text-green-700">{Number(c.amount).toLocaleString()}</td>
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
