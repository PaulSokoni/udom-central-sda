import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-[#0a1e4a] via-[#0d2a6e] to-[#1a3a8a] text-white p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{ backgroundImage: "url('/udom.jpeg')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1e4a]/90 to-[#1a3a8a]/70" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex -space-x-2">
              <img src="/sda.jpeg" alt="SDA" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
              <img src="/pcm.jpeg" alt="PCM" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
            </div>
            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">← Back to home</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Welcome to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              UDOM Central
            </span><br />
            SDA Church
          </h1>
          <p className="text-blue-200/70 text-base leading-relaxed max-w-sm">
            Your complete church management system — members, attendance, finance, reports, and more.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { v: '1000+', l: 'Members' },
              { v: '10+', l: 'Modules' },
              { v: 'Live', l: 'Real-time data' },
              { v: 'Secure', l: 'Role-based access' },
            ].map(s => (
              <div key={s.l} className="bg-white/10 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-xl font-extrabold text-white">{s.v}</p>
                <p className="text-blue-300/70 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-blue-300/50 text-xs">© {new Date().getFullYear()} UDOM Central SDA Church · Dodoma, Tanzania</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-4 sm:px-8 py-12">

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="flex -space-x-2 mb-3">
            <img src="/sda.jpeg" alt="SDA" className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg" style={{ border: '3px solid white' }} />
            <img src="/pcm.jpeg" alt="PCM" className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg" style={{ border: '3px solid white' }} />
          </div>
          <h2 className="font-extrabold text-blue-900 text-lg text-center">UDOM Central SDA Church</h2>
          <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Seventh-Day Adventist</p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Sign in</h2>
            <p className="text-gray-400 text-sm mt-1.5">Enter your credentials to access the system</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <span className="text-red-400 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all placeholder-gray-300"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required autoFocus autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all placeholder-gray-300"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors text-xs font-medium">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white font-bold py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-98 text-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-400 mb-3">Visiting UDOM Central SDA Church?</p>
            <Link to="/visitor-register"
              className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 font-semibold py-3 rounded-xl transition-all text-sm">
              👋 Register as a Visitor
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Don't have an account? Contact your church administrator.
          </p>

          {/* Mobile back link */}
          <div className="lg:hidden text-center mt-4">
            <Link to="/" className="text-xs text-blue-600 hover:underline">← Back to homepage</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
