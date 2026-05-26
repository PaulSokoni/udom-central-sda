import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundImage: 'url(/udom.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

        {/* Header banner with logos */}
        <div className="px-8 py-7 text-center" style={{ background: 'rgba(10, 30, 70, 0.92)' }}>
          <div className="flex items-center justify-center gap-5 mb-4">
            <img
              src="/sda.jpeg"
              alt="SDA Logo"
              className="w-16 h-16 rounded-full object-cover border-3 border-white/40 shadow-lg"
              style={{ border: '3px solid rgba(255,255,255,0.4)' }}
            />
            <img
              src="/pcm.jpeg"
              alt="PCM Logo"
              className="w-16 h-16 rounded-full object-cover shadow-lg"
              style={{ border: '3px solid rgba(255,255,255,0.4)' }}
            />
          </div>
          <h1 className="text-white font-bold text-lg leading-tight">UDOM Central SDA Church</h1>
          <p className="text-blue-300 text-xs mt-1 uppercase tracking-widest">Seventh-day Adventist</p>
        </div>

        {/* Form area */}
        <div className="px-8 py-7">
          <p className="text-center text-sm text-gray-500 mb-6 font-medium">Church Management System</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 text-base mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Contact your administrator if you need access.
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-2">Visiting us today?</p>
            <Link to="/visitor-register" className="btn btn-outline w-full justify-center text-sm">
              Register as a Visitor / Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
