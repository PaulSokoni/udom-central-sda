import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'health', label: 'Health & Healing' },
  { value: 'family', label: 'Family & Relationships' },
  { value: 'financial', label: 'Financial' },
  { value: 'spiritual', label: 'Spiritual Growth' },
  { value: 'counseling', label: 'Counseling Needed' },
  { value: 'bereavement', label: 'Bereavement' },
  { value: 'other', label: 'Other' },
];

const STATUS_BADGE = {
  open: 'bg-blue-100 text-blue-800',
  being_prayed: 'bg-purple-100 text-purple-800',
  answered: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-700',
};

const EMPTY_FORM = { category: 'other', request: '', is_anonymous: false };

export default function PrayerRequests() {
  const { user } = useAuth();
  const isPastorOrAdmin = user?.is_staff || user?.role === 'pastor';
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [notes, setNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/prayer-requests/');
      setRequests(r.data.results || r.data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('No linked member profile.');
      } else {
        toast.error('Failed to load prayer requests');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/prayer-requests/', form);
      toast.success('Prayer request submitted. It will be handled with care and confidentiality.');
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submit failed');
    } finally { setSaving(false); }
  };

  const updateRequest = async (id, data) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/prayer-requests/${id}/`, data);
      toast.success('Updated');
      load();
      setSelectedReq(null);
    } catch { toast.error('Update failed'); }
    finally { setUpdatingStatus(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold">Prayer Requests</h2>
          <p className="text-sm text-gray-500 mt-0.5">All requests are strictly confidential</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>Submit Prayer Request</button>
      </div>

      {/* Confidentiality notice */}
      <div className="mb-5 p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <p className="text-sm text-purple-800">
          <strong>Confidentiality:</strong> Prayer requests are private. Only the pastor and designated leaders can view all requests.
          Your request will be handled with care, prayer, and full discretion.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <div className="space-y-3">
          {requests.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {isPastorOrAdmin ? 'No prayer requests submitted yet.' : 'You have no submitted prayer requests.'}
            </div>
          )}
          {requests.map(req => (
            <div key={req.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium">
                      {req.category_display}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[req.status] || STATUS_BADGE.open}`}>
                      {req.status_display}
                    </span>
                    {req.is_anonymous && (
                      <span className="text-xs text-gray-400 italic">Anonymous</span>
                    )}
                  </div>
                  {isPastorOrAdmin && !req.is_anonymous && (
                    <p className="text-xs font-semibold text-blue-900 mb-1">{req.member_name}</p>
                  )}
                  <p className="text-sm text-gray-700 whitespace-pre-line">{req.request}</p>
                  {isPastorOrAdmin && req.pastor_notes && (
                    <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs font-semibold text-purple-700 mb-0.5">Pastor's Notes</p>
                      <p className="text-xs text-purple-800">{req.pastor_notes}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(req.submitted_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                  </p>
                </div>
                {isPastorOrAdmin && (
                  <button className="btn btn-outline btn-sm flex-shrink-0" onClick={() => { setSelectedReq(req); setNotes(req.pastor_notes || ''); }}>
                    Respond
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-2">Submit Prayer Request</h3>
            <p className="text-sm text-gray-500 mb-4">Your request is completely confidential and will only be seen by the pastor.</p>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Your Prayer Request</label>
                <textarea className="input" rows="5" placeholder="Share what is on your heart…"
                  value={form.request} onChange={e => setForm(f => ({ ...f, request: e.target.value }))} required />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))} />
                Submit anonymously
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting…' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pastor Response Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-2">Respond to Prayer Request</h3>
            {!selectedReq.is_anonymous && <p className="text-sm text-blue-900 font-semibold mb-2">{selectedReq.member_name}</p>}
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4 whitespace-pre-line">{selectedReq.request}</p>
            <div className="space-y-3">
              <div>
                <label className="label">Update Status</label>
                <select className="input" defaultValue={selectedReq.status}
                  onChange={e => setSelectedReq(r => ({ ...r, _newStatus: e.target.value }))}>
                  <option value="open">Open</option>
                  <option value="being_prayed">Being Prayed For</option>
                  <option value="answered">Answered</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="label">Pastor's Notes (private)</label>
                <textarea className="input" rows="3" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn btn-outline" onClick={() => setSelectedReq(null)}>Cancel</button>
                <button className="btn btn-primary" disabled={updatingStatus}
                  onClick={() => updateRequest(selectedReq.id, {
                    status: selectedReq._newStatus || selectedReq.status,
                    pastor_notes: notes,
                  })}>
                  {updatingStatus ? 'Saving…' : 'Save Response'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
