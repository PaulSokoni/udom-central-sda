import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8002/api';

export default function VisitorRegistration() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', home_church: '', address: '',
    event: '', visit_date: new Date().toISOString().slice(0, 10),
    wants_followup: false, notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API}/visitors/upcoming_events/`).then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.event) delete payload.event;
      await axios.post(`${API}/visitors/`, payload);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundImage: 'url(/udom.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div className="px-8 py-6 text-center" style={{ background: 'rgba(10, 30, 70, 0.92)' }}>
          <div className="flex items-center justify-center gap-4 mb-3">
            <img src="/sda.jpeg" alt="SDA" className="w-14 h-14 rounded-full object-cover" style={{ border: '3px solid rgba(255,255,255,0.4)' }} />
            <img src="/pcm.jpeg" alt="PCM" className="w-14 h-14 rounded-full object-cover" style={{ border: '3px solid rgba(255,255,255,0.4)' }} />
          </div>
          <h1 className="text-white font-bold text-lg">UDOM Central SDA Church</h1>
          <p className="text-blue-300 text-xs mt-0.5 uppercase tracking-widest">Visitor Registration</p>
        </div>

        <div className="px-8 py-7">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
              <h2 className="text-xl font-bold text-green-700 mb-2">Welcome!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for visiting UDOM Central SDA Church. We are glad to have you with us today.
                {form.wants_followup && ' A church member will be in touch with you soon.'}
              </p>
              <div className="space-y-2">
                <button onClick={() => { setDone(false); setForm({ name: '', phone: '', email: '', home_church: '', address: '', event: '', visit_date: new Date().toISOString().slice(0,10), wants_followup: false, notes: '' }); }}
                  className="btn btn-outline w-full justify-center">Register Another Visitor</button>
                <Link to="/login" className="btn btn-primary w-full justify-center block text-center">Member Login</Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-center text-sm text-gray-500 mb-5">Please fill in your details so we can welcome you properly.</p>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">{error}</div>
              )}

              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="Your full name"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" placeholder="+255 ..."
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" placeholder="Optional"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Home Church / Denomination</label>
                  <input className="input" placeholder="e.g. SDA — Dodoma Central"
                    value={form.home_church} onChange={e => setForm(f => ({ ...f, home_church: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Where are you from?</label>
                  <input className="input" placeholder="City / Region"
                    value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                {events.length > 0 && (
                  <div>
                    <label className="label">Which program are you attending today?</label>
                    <select className="input" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))}>
                      <option value="">— General visit —</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} — {new Date(ev.start_datetime).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="label">Date of Visit *</label>
                  <input type="date" className="input"
                    value={form.visit_date} onChange={e => setForm(f => ({ ...f, visit_date: e.target.value }))} required />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.wants_followup} onChange={e => setForm(f => ({ ...f, wants_followup: e.target.checked }))} />
                  I would like someone from the church to follow up with me
                </label>
                <button type="submit" disabled={saving} className="btn btn-primary w-full justify-center py-2.5 mt-2">
                  {saving ? 'Registering…' : 'Register as Visitor'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-5">
                Already a member? <Link to="/login" className="text-blue-700 hover:underline">Sign in here</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
