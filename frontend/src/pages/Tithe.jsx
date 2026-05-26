import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

export default function Tithe() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ grand_total: 0, by_category: [] });
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    member: '', date: new Date().toISOString().split('T')[0],
    category: 'tithe', amount: '', receipt_number: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (year) params.set('year', year);
    api.get(`/tithe/?${params}`).then(r => setRecords(r.data.results || r.data));
    api.get(`/tithe/summary/?${params}`).then(r => setSummary(r.data));
  };

  useEffect(() => { load(); }, [month, year]);
  useEffect(() => {
    if (user?.is_staff) api.get('/members/?status=active&page_size=500').then(r => setMembers(r.data.results || r.data));
  }, [user]);

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/tithe/', form);
      toast.success('Contribution recorded.');
      setShowForm(false);
      setForm(f => ({ ...f, member: '', amount: '', receipt_number: '', notes: '' }));
      load();
    } catch { toast.error('Failed to save.'); }
    finally { setSaving(false); }
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Tithe & Offerings</h2>
        {user?.is_staff && (
          <button onClick={() => setShowForm(s => !s)} className="btn btn-primary">
            {showForm ? '✕ Close' : '➕ Record Contribution'}
          </button>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="card p-4 text-center">
          <div className="text-xs text-gray-500 uppercase mb-1">Total</div>
          <div className="text-xl font-bold text-green-700">TZS {Number(summary.grand_total).toLocaleString()}</div>
        </div>
        {summary.by_category?.map(c => (
          <div key={c.category} className="card p-4 text-center">
            <div className="text-xs text-gray-500 uppercase mb-1">{c.category}</div>
            <div className="font-bold text-blue-900">{Number(c.total).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card mb-5">
          <div className="card-header"><h3 className="font-semibold text-sm">Record Contribution</h3></div>
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
                <label className="label">Date *</label>
                <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Category *</label>
                <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="tithe">Tithe</option>
                  <option value="offering">Regular Offering</option>
                  <option value="thanksgiving">Thanksgiving</option>
                  <option value="building">Building Fund</option>
                  <option value="missions">Missions</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Amount (TZS) *</label>
                <input type="number" className="input" value={form.amount} min="0" step="0.01"
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Receipt Number</label>
                <input className="input" value={form.receipt_number} onChange={e => setForm(f => ({ ...f, receipt_number: e.target.value }))} />
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

      {/* Filter & Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-sm">Contributions</h3>
          <div className="flex gap-2">
            <select className="select w-28" value={month} onChange={e => setMonth(e.target.value)}>
              <option value="">All Months</option>
              {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select className="select w-24" value={year} onChange={e => setYear(e.target.value)}>
              {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Date</th>
                <th className="table-th">Member</th>
                <th className="table-th">Category</th>
                <th className="table-th">Amount (TZS)</th>
                <th className="table-th">Receipt #</th>
                <th className="table-th">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {records.length ? records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-td">{r.date}</td>
                  <td className="table-td font-medium">{r.member_name}</td>
                  <td className="table-td">
                    <span className="badge bg-blue-50 text-blue-800">{r.category_display}</span>
                  </td>
                  <td className="table-td font-semibold text-green-700">{Number(r.amount).toLocaleString()}</td>
                  <td className="table-td text-gray-400">{r.receipt_number || '—'}</td>
                  <td className="table-td text-gray-400 text-xs">{r.recorded_by || '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="table-td text-center py-8 text-gray-400">No contributions recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
