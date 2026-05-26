import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

export default function Attendance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [view, setView] = useState('list'); // list | bulk
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState('sabbath');
  const [presentIds, setPresentIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/attendance/').then(r => setRecords(r.data.results || r.data));
    if (user?.is_staff) {
      api.get('/members/?status=active&page_size=200').then(r => {
        const list = r.data.results || r.data;
        setMembers(list);
        setPresentIds(new Set(list.map(m => m.id)));
      });
    }
  }, [user]);

  const toggleMember = id => {
    setPresentIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const submitBulk = async () => {
    setLoading(true);
    try {
      const r = await api.post('/attendance/bulk/', {
        date: bulkDate, service_type: serviceType, present_ids: [...presentIds]
      });
      toast.success(`Saved: ${r.data.present} members marked present.`);
      api.get('/attendance/').then(r => setRecords(r.data.results || r.data));
      setView('list');
    } catch {
      toast.error('Failed to save attendance.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'bulk') {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Bulk Attendance Entry</h2>
          <button onClick={() => setView('list')} className="btn btn-outline btn-sm">← Back</button>
        </div>
        <div className="card mb-4">
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Service Date</label>
                <input type="date" className="input" value={bulkDate} onChange={e => setBulkDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Service Type</label>
                <select className="select" value={serviceType} onChange={e => setServiceType(e.target.value)}>
                  <option value="sabbath">Sabbath Service</option>
                  <option value="midweek">Midweek Prayer</option>
                  <option value="youth">Youth Service</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="text-sm font-semibold">Active Members ({members.length})</span>
            <div className="flex gap-2">
              <button onClick={() => setPresentIds(new Set(members.map(m => m.id)))} className="btn btn-success btn-sm">Check All</button>
              <button onClick={() => setPresentIds(new Set())} className="btn btn-outline btn-sm">Uncheck All</button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {members.map(m => (
              <label key={m.id} className="flex items-center px-5 py-2.5 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={presentIds.has(m.id)}
                  onChange={() => toggleMember(m.id)}
                  className="w-4 h-4 mr-3 rounded border-gray-300 text-blue-800 cursor-pointer"
                />
                <span className="flex-1 font-medium text-sm">{m.full_name}</span>
                <span className="text-xs text-gray-400">{m.member_id}</span>
              </label>
            ))}
          </div>
          <div className="p-4 flex gap-3">
            <button onClick={submitBulk} disabled={loading} className="btn btn-success">
              {loading ? 'Saving…' : '💾 Save Attendance'}
            </button>
            <button onClick={() => setView('list')} className="btn btn-outline">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Attendance Records</h2>
        {user?.is_staff && (
          <button onClick={() => setView('bulk')} className="btn btn-success">📋 Bulk Attendance</button>
        )}
      </div>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Date</th>
                <th className="table-th">Member</th>
                <th className="table-th">Service</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length ? records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-td">{r.date}</td>
                  <td className="table-td font-medium">{r.member_name}</td>
                  <td className="table-td">{r.service_display}</td>
                  <td className="table-td">
                    <span className={`badge ${r.present ? 'badge-active' : 'badge-inactive'}`}>
                      {r.present ? 'Present' : 'Absent'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="table-td text-center py-8 text-gray-400">No attendance records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
