import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  baptism: 'bg-green-100 text-green-800',
  transfer_in: 'bg-blue-100 text-blue-800',
  transfer_out: 'bg-amber-100 text-amber-800',
  reclaimed: 'bg-teal-100 text-teal-800',
  deceased: 'bg-purple-100 text-purple-800',
  missing: 'bg-gray-100 text-gray-600',
};

export default function Baptisms() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    member: '', record_type: 'baptism', date: new Date().toISOString().split('T')[0],
    officiating_pastor: '', transfer_church: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/baptisms/').then(r => setRecords(r.data.results || r.data));
  useEffect(() => {
    load();
    if (user?.is_staff) api.get('/members/?page_size=500').then(r => setMembers(r.data.results || r.data));
  }, [user]);

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/baptisms/', form);
      toast.success('Record saved.');
      setShowForm(false);
      load();
    } catch { toast.error('Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Baptisms & Membership Changes</h2>
        {user?.is_staff && (
          <button onClick={() => setShowForm(s => !s)} className="btn btn-primary">
            {showForm ? '✕ Close' : '➕ Add Record'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-5">
          <div className="card-header"><h3 className="font-semibold text-sm">New Record</h3></div>
          <form onSubmit={submit} className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Member *</label>
                <select className="select" value={form.member} onChange={e => setForm(f => ({ ...f, member: e.target.value }))} required>
                  <option value="">— Select Member —</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name} ({m.member_id})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Record Type *</label>
                <select className="select" value={form.record_type} onChange={e => setForm(f => ({ ...f, record_type: e.target.value }))}>
                  <option value="baptism">Baptism</option>
                  <option value="transfer_in">Transfer In</option>
                  <option value="transfer_out">Transfer Out</option>
                  <option value="reclaimed">Reclaimed</option>
                  <option value="deceased">Deceased</option>
                  <option value="missing">Missing</option>
                </select>
              </div>
              <div>
                <label className="label">Date *</label>
                <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Officiating Pastor</label>
                <input className="input" value={form.officiating_pastor} onChange={e => setForm(f => ({ ...f, officiating_pastor: e.target.value }))} />
              </div>
              <div>
                <label className="label">Transfer Church</label>
                <input className="input" value={form.transfer_church} onChange={e => setForm(f => ({ ...f, transfer_church: e.target.value }))}
                  placeholder="For transfers only" />
              </div>
              <div>
                <label className="label">Notes</label>
                <input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : '💾 Save'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Date</th>
                <th className="table-th">Member</th>
                <th className="table-th">Type</th>
                <th className="table-th">Pastor</th>
                <th className="table-th">Transfer Church</th>
                <th className="table-th">Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.length ? records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-td">{r.date}</td>
                  <td className="table-td font-medium">{r.member_name}</td>
                  <td className="table-td">
                    <span className={`badge ${TYPE_COLORS[r.record_type] || ''}`}>{r.record_type_display}</span>
                  </td>
                  <td className="table-td text-gray-500">{r.officiating_pastor || '—'}</td>
                  <td className="table-td text-gray-500">{r.transfer_church || '—'}</td>
                  <td className="table-td text-gray-400 text-xs">{r.notes || '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="table-td text-center py-8 text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
