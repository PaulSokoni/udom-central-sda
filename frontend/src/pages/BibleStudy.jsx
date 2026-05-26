import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

export default function BibleStudy() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({
    member: '', month: now.getMonth() + 1, year: now.getFullYear(),
    sabbath_school_attendance: 0, personal_study_days: 0,
    completed_lesson: false, outreach_count: 0, notes: '',
  });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/bible-study/').then(r => setRecords(r.data.results || r.data));
  useEffect(() => {
    load();
    if (user?.is_staff) api.get('/members/?status=active&page_size=500').then(r => setMembers(r.data.results || r.data));
  }, [user]);

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/bible-study/', form);
      toast.success('Bible study record saved.');
      setShowForm(false);
      load();
    } catch { toast.error('Failed to save.'); }
    finally { setSaving(false); }
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Bible Study Records</h2>
        {user?.is_staff && (
          <button onClick={() => setShowForm(s => !s)} className="btn btn-primary">
            {showForm ? '✕ Close' : '➕ Add Record'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-5">
          <div className="card-header"><h3 className="font-semibold text-sm">Bible Study Record</h3></div>
          <form onSubmit={submit} className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Member *</label>
                <select className="select" value={form.member} onChange={e => setForm(f => ({ ...f, member: e.target.value }))} required>
                  <option value="">— Select Member —</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Month</label>
                <select className="select" value={form.month} onChange={e => setForm(f => ({ ...f, month: +e.target.value }))}>
                  {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <select className="select" value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))}>
                  {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Sabbath School Attendance</label>
                <input type="number" className="input" min="0" max="5" value={form.sabbath_school_attendance}
                  onChange={e => setForm(f => ({ ...f, sabbath_school_attendance: +e.target.value }))} />
              </div>
              <div>
                <label className="label">Personal Study Days</label>
                <input type="number" className="input" min="0" max="31" value={form.personal_study_days}
                  onChange={e => setForm(f => ({ ...f, personal_study_days: +e.target.value }))} />
              </div>
              <div>
                <label className="label">Outreach Contacts</label>
                <input type="number" className="input" min="0" value={form.outreach_count}
                  onChange={e => setForm(f => ({ ...f, outreach_count: +e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Notes</label>
                <input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="lesson" checked={form.completed_lesson}
                  onChange={e => setForm(f => ({ ...f, completed_lesson: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-800 cursor-pointer" />
                <label htmlFor="lesson" className="label mb-0 cursor-pointer">Completed Lesson</label>
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
                <th className="table-th">Member</th>
                <th className="table-th">Month/Year</th>
                <th className="table-th">SS Attendance</th>
                <th className="table-th">Study Days</th>
                <th className="table-th">Lesson Done</th>
                <th className="table-th">Outreach</th>
              </tr>
            </thead>
            <tbody>
              {records.length ? records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{r.member_name}</td>
                  <td className="table-td">{MONTHS[r.month-1]} {r.year}</td>
                  <td className="table-td text-center">{r.sabbath_school_attendance}</td>
                  <td className="table-td text-center">{r.personal_study_days}</td>
                  <td className="table-td text-center">
                    <span className={`badge ${r.completed_lesson ? 'badge-active' : 'badge-inactive'}`}>
                      {r.completed_lesson ? '✓ Yes' : 'No'}
                    </span>
                  </td>
                  <td className="table-td text-center">{r.outreach_count}</td>
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
