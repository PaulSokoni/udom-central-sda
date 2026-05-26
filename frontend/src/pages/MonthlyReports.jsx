import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];

function ReportDetail({ id }) {
  const [report, setReport] = useState(null);
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get(`/monthly-reports/${id}/`).then(r => {
      setReport(r.data);
      setForm(r.data);
    });
  }, [id]);

  const autoGenerate = async () => {
    setGenerating(true);
    try {
      const r = await api.post('/monthly-reports/auto_generate/', { month: report.month, year: report.year });
      setReport(r.data.report);
      setForm(r.data.report);
      toast.success('Report auto-generated from recorded data.');
    } catch { toast.error('Auto-generation failed.'); }
    finally { setGenerating(false); }
  };

  const save = async e => {
    e.preventDefault();
    try {
      const r = await api.patch(`/monthly-reports/${id}/`, form);
      setReport(r.data);
      setEditing(false);
      toast.success('Report updated.');
    } catch { toast.error('Failed to save.'); }
  };

  if (!report) return <div className="text-center py-16 text-gray-400">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <Link to="/reports" className="btn btn-outline btn-sm">← Back to Reports</Link>
        {user?.is_staff && (
          <div className="flex gap-2">
            <button onClick={autoGenerate} disabled={generating} className="btn btn-success btn-sm">
              {generating ? 'Generating…' : '⚡ Auto-Generate'}
            </button>
            <button onClick={() => setEditing(e => !e)} className="btn btn-warning btn-sm">
              {editing ? '✕ Cancel' : '✏️ Edit'}
            </button>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-5">
        Monthly Spiritual Report — {report.month_name} {report.year}
        {report.is_finalized && <span className="ml-3 badge badge-active text-sm">Finalized</span>}
      </h2>

      {editing ? (
        <form onSubmit={save} className="space-y-4">
          {[
            { title: 'Membership Statistics', fields: [
              ['total_members','Total Members','number'],['active_members','Active Members','number'],
              ['new_baptisms','New Baptisms','number'],['transfers_in','Transfers In','number'],
              ['transfers_out','Transfers Out','number'],['deceased','Deceased','number'],
            ]},
            { title: 'Attendance', fields: [
              ['avg_sabbath_attendance','Avg Sabbath Attendance','number'],
              ['avg_midweek_attendance','Avg Midweek Attendance','number'],
            ]},
            { title: 'Financial', fields: [
              ['total_tithe','Total Tithe (TZS)','number'],
              ['total_offering','Total Offering (TZS)','number'],
              ['total_contributions','Total Contributions (TZS)','number'],
            ]},
            { title: 'Spiritual Activities', fields: [
              ['bible_study_participants','Bible Study Participants','number'],
              ['outreach_contacts','Outreach Contacts','number'],
            ]},
          ].map(({ title, fields }) => (
            <div key={title} className="card">
              <div className="card-header"><h3 className="font-semibold text-sm">{title}</h3></div>
              <div className="card-body grid grid-cols-2 md:grid-cols-3 gap-4">
                {fields.map(([k, l, t]) => (
                  <div key={k}>
                    <label className="label">{l}</label>
                    <input type={t} className="input" value={form[k] ?? ''} min="0"
                      onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="card">
            <div className="card-header"><h3 className="font-semibold text-sm">Narrative</h3></div>
            <div className="card-body grid grid-cols-1 gap-4">
              {[['highlights','Highlights'],['challenges','Challenges'],['prayer_requests','Prayer Requests']].map(([k,l]) => (
                <div key={k}>
                  <label className="label">{l}</label>
                  <textarea className="input resize-none" rows={3} value={form[k] ?? ''}
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="fin" checked={form.is_finalized || false}
                  onChange={e => setForm(f => ({ ...f, is_finalized: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-800 cursor-pointer" />
                <label htmlFor="fin" className="text-sm text-gray-700 cursor-pointer">Mark as Finalized</label>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary">💾 Save Report</button>
            <button type="button" onClick={() => setEditing(false)} className="btn btn-outline">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Members', value: report.total_members, color: 'text-blue-900' },
              { label: 'Active Members', value: report.active_members, color: 'text-green-700' },
              { label: 'New Baptisms', value: report.new_baptisms, color: 'text-teal-700' },
              { label: 'Transfers In', value: report.transfers_in, color: 'text-blue-600' },
              { label: 'Transfers Out', value: report.transfers_out, color: 'text-amber-600' },
              { label: 'Deceased', value: report.deceased, color: 'text-purple-700' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card">
              <div className="card-header"><h3 className="font-semibold text-sm">Attendance</h3></div>
              <div className="card-body grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-blue-900">{report.avg_sabbath_attendance}</div>
                  <div className="text-xs text-gray-500">Avg Sabbath</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-blue-900">{report.avg_midweek_attendance}</div>
                  <div className="text-xs text-gray-500">Avg Midweek</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h3 className="font-semibold text-sm">Financial Overview</h3></div>
              <div className="card-body space-y-2">
                {[['Tithe', report.total_tithe], ['Offering', report.total_offering], ['Total', report.total_contributions]].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{l}</span>
                    <span className={`font-semibold ${l === 'Total' ? 'text-green-700 text-base' : 'text-sm'}`}>
                      TZS {Number(v).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card">
              <div className="card-header"><h3 className="font-semibold text-sm">Spiritual Activities</h3></div>
              <div className="card-body grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-blue-900">{report.bible_study_participants}</div>
                  <div className="text-xs text-gray-500">Bible Study Participants</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-blue-900">{report.outreach_contacts}</div>
                  <div className="text-xs text-gray-500">Outreach Contacts</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h3 className="font-semibold text-sm">Prepared By</h3></div>
              <div className="card-body">
                <p className="font-medium">{report.prepared_by}</p>
                <p className="text-sm text-gray-400 mt-1">{report.prepared_date}</p>
              </div>
            </div>
          </div>

          {(report.highlights || report.challenges || report.prayer_requests) && (
            <div className="card">
              <div className="card-header"><h3 className="font-semibold text-sm">Narrative</h3></div>
              <div className="card-body space-y-4">
                {report.highlights && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Highlights</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.highlights}</p>
                  </div>
                )}
                {report.challenges && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Challenges</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.challenges}</p>
                  </div>
                )}
                {report.prayer_requests && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Prayer Requests</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.prayer_requests}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ReportDetail_Page() {
  const { id } = useParams();
  return <ReportDetail id={id} />;
}

export function ReportCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const now = new Date();
  const [form, setForm] = useState({
    month: now.getMonth() + 1, year: now.getFullYear(), prepared_by: user?.full_name || user?.username || '',
    total_members: 0, active_members: 0, new_baptisms: 0, transfers_in: 0, transfers_out: 0, deceased: 0,
    avg_sabbath_attendance: 0, avg_midweek_attendance: 0,
    total_tithe: 0, total_offering: 0, total_contributions: 0,
    bible_study_participants: 0, outreach_contacts: 0,
    highlights: '', challenges: '', prayer_requests: '', is_finalized: false,
  });
  const [saving, setSaving] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.post('/monthly-reports/', form);
      toast.success('Report created.');
      navigate(`/reports/${r.data.id}`);
    } catch { toast.error('Failed. Check if a report for this month already exists.'); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Create Monthly Report</h2>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">← Back</button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-sm">Report Period</h3></div>
          <div className="card-body grid grid-cols-3 gap-4">
            <div>
              <label className="label">Month *</label>
              <select className="select" value={form.month} onChange={e => set('month', +e.target.value)}>
                {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year *</label>
              <select className="select" value={form.year} onChange={e => set('year', +e.target.value)}>
                {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Prepared By</label>
              <input className="input" value={form.prepared_by} onChange={e => set('prepared_by', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-sm">Statistics</h3></div>
          <div className="card-body grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ['total_members','Total Members'],['active_members','Active Members'],['new_baptisms','New Baptisms'],
              ['transfers_in','Transfers In'],['transfers_out','Transfers Out'],['deceased','Deceased'],
              ['avg_sabbath_attendance','Avg Sabbath Attendance'],['avg_midweek_attendance','Avg Midweek Attendance'],
              ['bible_study_participants','Bible Study Participants'],['outreach_contacts','Outreach Contacts'],
            ].map(([k, l]) => (
              <div key={k}>
                <label className="label">{l}</label>
                <input type="number" min="0" className="input" value={form[k]} onChange={e => set(k, +e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-sm">Financial</h3></div>
          <div className="card-body grid grid-cols-3 gap-4">
            {[['total_tithe','Total Tithe'],['total_offering','Total Offering'],['total_contributions','Total Contributions']].map(([k,l]) => (
              <div key={k}>
                <label className="label">{l} (TZS)</label>
                <input type="number" min="0" step="0.01" className="input" value={form[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-sm">Narrative</h3></div>
          <div className="card-body space-y-4">
            {[['highlights','Highlights'],['challenges','Challenges'],['prayer_requests','Prayer Requests']].map(([k,l]) => (
              <div key={k}>
                <label className="label">{l}</label>
                <textarea className="input resize-none" rows={3} value={form[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
            {saving ? 'Saving…' : '💾 Create Report'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline btn-lg">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default function ReportList() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/monthly-reports/').then(r => setReports(r.data.results || r.data));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Monthly Spiritual Reports</h2>
        {user?.is_staff && (
          <Link to="/reports/new" className="btn btn-primary">➕ Create Report</Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.length ? reports.map(r => (
          <div key={r.id} className="card hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => navigate(`/reports/${r.id}`)}>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-blue-900">{r.month_name} {r.year}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Prepared by {r.prepared_by}</p>
                </div>
                {r.is_finalized && <span className="badge badge-active">Finalized</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-900">{r.total_members}</div>
                  <div className="text-xs text-gray-500">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-700">{r.new_baptisms}</div>
                  <div className="text-xs text-gray-500">Baptisms</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-amber-700">{Number(r.total_contributions).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">TZS</div>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-3 text-center py-16 text-gray-400">No reports yet.</div>
        )}
      </div>
    </div>
  );
}

