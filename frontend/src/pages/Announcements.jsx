import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

const PRIORITY_STYLE = {
  urgent: 'bg-red-100 text-red-800 border-l-4 border-red-500',
  high: 'bg-amber-100 text-amber-800 border-l-4 border-amber-500',
  normal: 'bg-blue-50 text-blue-800 border-l-2 border-blue-300',
  low: 'bg-gray-50 text-gray-700 border-l-2 border-gray-300',
};

const PRIORITY_BADGE = {
  urgent: 'bg-red-500 text-white',
  high: 'bg-amber-500 text-white',
  normal: 'bg-blue-500 text-white',
  low: 'bg-gray-400 text-white',
};

const EMPTY_FORM = {
  title: '', body: '', priority: 'normal', audience: 'all',
  is_published: true, publish_date: new Date().toISOString().slice(0, 10), expiry_date: '',
};

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/announcements/');
      setAnnouncements(r.data.results || r.data);
    } catch { toast.error('Failed to load announcements'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openForm = (ann = null) => {
    if (ann) {
      setEditing(ann.id);
      setForm({
        title: ann.title, body: ann.body, priority: ann.priority,
        audience: ann.audience, is_published: ann.is_published,
        publish_date: ann.publish_date, expiry_date: ann.expiry_date || '',
      });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setShowForm(true);
  };

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.expiry_date) delete payload.expiry_date;
      if (editing) {
        await api.patch(`/announcements/${editing}/`, payload);
        toast.success('Updated');
      } else {
        await api.post('/announcements/', payload);
        toast.success('Published');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}/`);
      toast.success('Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Announcements</h2>
        {user?.is_staff && (
          <button className="btn btn-primary" onClick={() => openForm()}>+ New Announcement</button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <div className="space-y-4">
          {announcements.length === 0 && (
            <div className="text-center py-12 text-gray-400">No announcements at this time.</div>
          )}
          {announcements.map(ann => (
            <div key={ann.id} className={`card p-5 ${PRIORITY_STYLE[ann.priority] || PRIORITY_STYLE.normal}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRIORITY_BADGE[ann.priority]}`}>
                      {ann.priority_display}
                    </span>
                    <span className="text-xs text-gray-500">{ann.audience_display}</span>
                  </div>
                  <h3 className="font-bold text-base">{ann.title}</h3>
                  <p className="text-sm mt-1 whitespace-pre-line">{ann.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Posted: {new Date(ann.publish_date).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                    {ann.expiry_date && <span>Expires: {new Date(ann.expiry_date).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>}
                    {ann.author_name && <span>By: {ann.author_name}</span>}
                  </div>
                </div>
                {user?.is_staff && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button className="btn btn-outline btn-sm" onClick={() => openForm(ann)}>Edit</button>
                    <button className="btn btn-sm bg-red-50 text-red-700 border border-red-200" onClick={() => del(ann.id)}>Del</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-bold text-lg mb-4">{editing ? 'Edit Announcement' : 'New Announcement'}</h3>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="label">Title</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input" rows="5" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="label">Audience</label>
                  <select className="input" value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
                    <option value="all">All Members</option>
                    <option value="active">Active Members</option>
                    <option value="leaders">Leaders Only</option>
                    <option value="youth">Youth</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Publish Date</label>
                  <input type="date" className="input" value={form.publish_date} onChange={e => setForm(f => ({ ...f, publish_date: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Expiry Date (optional)</label>
                  <input type="date" className="input" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                Published (visible to members)
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Publish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
