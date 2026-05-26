import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

const EMPTY_FORM = { number: '', title: '', summary: '', full_explanation: '', scripture_references: '' };

export default function Doctrines() {
  const { user } = useAuth();
  const [doctrines, setDoctrines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/doctrines/');
      setDoctrines(r.data.results || r.data);
    } catch { toast.error('Failed to load doctrines'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openForm = (d = null) => {
    if (d) {
      setEditing(d.id);
      setForm({ number: d.number, title: d.title, summary: d.summary, full_explanation: d.full_explanation || '', scripture_references: d.scripture_references || '' });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setShowForm(true);
  };

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) {
        await api.patch(`/doctrines/${editing}/`, form);
        toast.success('Updated');
      } else {
        await api.post('/doctrines/', form);
        toast.success('Doctrine added');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm('Delete this doctrine?')) return;
    try {
      await api.delete(`/doctrines/${id}/`);
      toast.success('Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold">Church Doctrines & Beliefs</h2>
          <p className="text-sm text-gray-500 mt-0.5">Seventh-day Adventist Fundamental Beliefs</p>
        </div>
        {user?.is_staff && (
          <button className="btn btn-primary" onClick={() => openForm()}>+ Add Doctrine</button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <div className="space-y-3">
          {doctrines.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No doctrines added yet.
              {user?.is_staff && <span> Click "+ Add Doctrine" to begin.</span>}
            </div>
          )}
          {doctrines.map(d => (
            <div key={d.id} className="card overflow-hidden">
              <button
                className="w-full text-left p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === d.id ? null : d.id)}
              >
                <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {d.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">{d.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{d.summary}</p>
                </div>
                <span className="text-gray-400 text-sm">{expanded === d.id ? '▲' : '▼'}</span>
              </button>

              {expanded === d.id && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <p className="text-sm text-gray-700 mt-4 font-medium">{d.summary}</p>

                  {d.full_explanation && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Explanation</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{d.full_explanation}</p>
                    </div>
                  )}

                  {d.scripture_references && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Scripture References</h4>
                      <p className="text-sm text-blue-800">{d.scripture_references}</p>
                    </div>
                  )}

                  {user?.is_staff && (
                    <div className="flex gap-2 mt-4">
                      <button className="btn btn-outline btn-sm" onClick={() => openForm(d)}>Edit</button>
                      <button className="btn btn-sm bg-red-50 text-red-700 border border-red-200" onClick={() => del(d.id)}>Delete</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-bold text-lg mb-4">{editing ? 'Edit Doctrine' : 'Add Doctrine'}</h3>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="label">Number</label>
                  <input type="number" min="1" className="input" value={form.number}
                    onChange={e => setForm(f => ({ ...f, number: e.target.value }))} required />
                </div>
                <div className="col-span-3">
                  <label className="label">Title</label>
                  <input className="input" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Summary</label>
                <textarea className="input" rows="3" value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Full Explanation (optional)</label>
                <textarea className="input" rows="5" value={form.full_explanation}
                  onChange={e => setForm(f => ({ ...f, full_explanation: e.target.value }))} />
              </div>
              <div>
                <label className="label">Scripture References (optional)</label>
                <textarea className="input" rows="2" placeholder="e.g. Genesis 1:1; John 3:16"
                  value={form.scripture_references}
                  onChange={e => setForm(f => ({ ...f, scripture_references: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
