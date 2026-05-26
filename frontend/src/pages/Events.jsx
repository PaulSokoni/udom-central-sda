import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  worship: 'bg-blue-100 text-blue-800',
  prayer: 'bg-purple-100 text-purple-800',
  special: 'bg-amber-100 text-amber-800',
  youth: 'bg-green-100 text-green-800',
  outreach: 'bg-teal-100 text-teal-800',
  meeting: 'bg-gray-100 text-gray-800',
  seminar: 'bg-pink-100 text-pink-800',
  other: 'bg-slate-100 text-slate-800',
};

const EVENT_TYPES = [
  { value: 'worship', label: 'Worship Service' },
  { value: 'prayer', label: 'Prayer Session' },
  { value: 'special', label: 'Special Event' },
  { value: 'youth', label: 'Youth Program' },
  { value: 'outreach', label: 'Community Outreach' },
  { value: 'meeting', label: 'Church Meeting' },
  { value: 'seminar', label: 'Seminar / Workshop' },
  { value: 'other', label: 'Other' },
];

const EMPTY_FORM = {
  title: '', event_type: 'worship', description: '', start_datetime: '',
  end_datetime: '', location: '', organizer: '', is_recurring: false,
};

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [showAttendance, setShowAttendance] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [visitorForm, setVisitorForm] = useState({ visitor_name: '', visitor_phone: '', visitor_address: '', notes: '' });
  const [showVisitorForm, setShowVisitorForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = filterType ? `?type=${filterType}` : '';
      const r = await api.get(`/events/${params}`);
      setEvents(r.data.results || r.data);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterType]);

  const openForm = (ev = null) => {
    if (ev) {
      setEditing(ev.id);
      setForm({
        title: ev.title, event_type: ev.event_type, description: ev.description || '',
        start_datetime: ev.start_datetime?.slice(0, 16) || '',
        end_datetime: ev.end_datetime?.slice(0, 16) || '',
        location: ev.location || '', organizer: ev.organizer || '',
        is_recurring: ev.is_recurring || false,
      });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setShowForm(true);
  };

  const save = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.end_datetime) delete payload.end_datetime;
      if (!payload.organizer) delete payload.organizer;
      if (editing) {
        await api.patch(`/events/${editing}/`, payload);
        toast.success('Event updated');
      } else {
        await api.post('/events/', payload);
        toast.success('Event created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}/`);
      toast.success('Deleted');
      load();
      if (selectedEvent?.id === id) setSelectedEvent(null);
    } catch { toast.error('Delete failed'); }
  };

  const openAttendance = async ev => {
    setSelectedEvent(ev);
    setShowAttendance(true);
    try {
      const [attRes, memRes] = await Promise.all([
        api.get(`/events/${ev.id}/attendance/`),
        api.get('/members/?page_size=500'),
      ]);
      setAttendance(attRes.data);
      setMembers(memRes.data.results || memRes.data);
    } catch { toast.error('Failed to load attendance'); }
  };

  const markMember = async memberId => {
    try {
      const already = attendance.find(a => a.member === memberId);
      if (already) {
        await api.delete(`/event-attendance/${already.id}/`);
        setAttendance(p => p.filter(a => a.id !== already.id));
      } else {
        const r = await api.post(`/events/${selectedEvent.id}/attendance/`, { member: memberId, is_visitor: false });
        setAttendance(p => [...p, r.data]);
      }
    } catch { toast.error('Failed to record attendance'); }
  };

  const addVisitor = async e => {
    e.preventDefault();
    try {
      const r = await api.post(`/events/${selectedEvent.id}/attendance/`, { ...visitorForm, is_visitor: true });
      setAttendance(p => [...p, r.data]);
      setVisitorForm({ visitor_name: '', visitor_phone: '', visitor_address: '', notes: '' });
      setShowVisitorForm(false);
      toast.success('Visitor recorded');
    } catch { toast.error('Failed'); }
  };

  const presentIds = new Set(attendance.filter(a => !a.is_visitor).map(a => a.member));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Events & Programs</h2>
        {user?.is_staff && (
          <button className="btn btn-primary" onClick={() => openForm()}>+ New Event</button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterType('')} className={`btn btn-sm ${!filterType ? 'btn-primary' : 'btn-outline'}`}>All</button>
        {EVENT_TYPES.map(t => (
          <button key={t.value} onClick={() => setFilterType(t.value)}
            className={`btn btn-sm ${filterType === t.value ? 'btn-primary' : 'btn-outline'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.length === 0 && <p className="text-gray-400 col-span-3 py-8 text-center">No events found.</p>}
          {events.map(ev => (
            <div key={ev.id} className="card p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`badge text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[ev.event_type] || TYPE_COLORS.other}`}>
                  {ev.event_type_display}
                </span>
                {ev.is_recurring && <span className="text-xs text-gray-400">Recurring</span>}
              </div>
              <h3 className="font-semibold text-blue-900 text-base mb-1">{ev.title}</h3>
              <p className="text-xs text-gray-500 mb-1">
                {new Date(ev.start_datetime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              {ev.location && <p className="text-xs text-gray-400 mb-2">📍 {ev.location}</p>}
              {ev.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ev.description}</p>}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span>👥 {ev.attendance_count} members</span>
                <span>🏠 {ev.visitor_count} visitors</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button className="btn btn-outline btn-sm" onClick={() => openAttendance(ev)}>Attendance</button>
                {user?.is_staff && (
                  <>
                    <button className="btn btn-outline btn-sm" onClick={() => openForm(ev)}>Edit</button>
                    <button className="btn btn-sm bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" onClick={() => del(ev.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-bold text-lg mb-4">{editing ? 'Edit Event' : 'New Event'}</h3>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="label">Title</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}>
                  {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Start Date & Time</label>
                <input type="datetime-local" className="input" value={form.start_datetime} onChange={e => setForm(f => ({ ...f, start_datetime: e.target.value }))} required />
              </div>
              <div>
                <label className="label">End Date & Time (optional)</label>
                <input type="datetime-local" className="input" value={form.end_datetime} onChange={e => setForm(f => ({ ...f, end_datetime: e.target.value }))} />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows="3" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_recurring} onChange={e => setForm(f => ({ ...f, is_recurring: e.target.checked }))} />
                Recurring event
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendance && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-500">{new Date(selectedEvent.start_datetime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAttendance(false)}>Close</button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Present: {attendance.filter(a => !a.is_visitor).length} members, {attendance.filter(a => a.is_visitor).length} visitors
              </span>
              {user?.is_staff && (
                <button className="btn btn-outline btn-sm" onClick={() => setShowVisitorForm(p => !p)}>
                  + Add Visitor
                </button>
              )}
            </div>

            {showVisitorForm && (
              <form onSubmit={addVisitor} className="bg-amber-50 rounded-xl p-4 mb-4 space-y-2">
                <h4 className="font-semibold text-sm text-amber-800">Record Visitor</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">Name *</label>
                    <input className="input text-sm" value={visitorForm.visitor_name} onChange={e => setVisitorForm(f => ({ ...f, visitor_name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label text-xs">Phone</label>
                    <input className="input text-sm" value={visitorForm.visitor_phone} onChange={e => setVisitorForm(f => ({ ...f, visitor_phone: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">Address</label>
                    <input className="input text-sm" value={visitorForm.visitor_address} onChange={e => setVisitorForm(f => ({ ...f, visitor_address: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowVisitorForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Record</button>
                </div>
              </form>
            )}

            {attendance.filter(a => a.is_visitor).length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-amber-700 mb-2">Visitors</h4>
                <div className="space-y-1">
                  {attendance.filter(a => a.is_visitor).map(a => (
                    <div key={a.id} className="flex items-center gap-2 py-1 px-3 bg-amber-50 rounded-lg text-sm">
                      <span className="font-medium">{a.visitor_name}</span>
                      {a.visitor_phone && <span className="text-gray-400">{a.visitor_phone}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h4 className="font-semibold text-sm text-gray-700 mb-2">Members</h4>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {members.map(m => {
                const present = presentIds.has(m.id);
                return (
                  <div key={m.id}
                    onClick={() => markMember(m.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${present ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-sm font-bold ${present ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {present ? '✓' : ''}
                    </div>
                    <span className="text-sm flex-1">{m.full_name}</span>
                    <span className="text-xs text-gray-400">{m.member_id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
