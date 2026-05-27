import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '👥', title: 'Member Management', desc: 'Full member profiles, history, photos, and status tracking.' },
  { icon: '📋', title: 'Attendance Tracking', desc: 'Record Sabbath attendance and generate instant reports.' },
  { icon: '💰', title: 'Tithe & Finance', desc: 'Log tithes, offerings, and view complete financial history.' },
  { icon: '📊', title: 'Monthly Reports', desc: 'Auto-generate monthly church reports for leadership.' },
  { icon: '📅', title: 'Events & Programs', desc: 'Manage camp meetings, seminars, and special events.' },
  { icon: '🙏', title: 'Prayer Requests', desc: 'Collect and manage prayer needs from the congregation.' },
];

const STATS = [
  { value: '1000+', label: 'Members Supported' },
  { value: '10+', label: 'Modules Available' },
  { value: '24/7', label: 'Online Access' },
  { value: '100%', label: 'Secure & Private' },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              <img src="/sda.jpeg" alt="SDA" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow" />
              <img src="/pcm.jpeg" alt="PCM" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-blue-900 text-sm leading-tight">UDOM Central SDA</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Church Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/visitor-register"
              className="hidden sm:block text-sm text-gray-500 font-medium hover:text-blue-700 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
              Visitor Register
            </Link>
            <Link to="/login"
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 sm:px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95">
              Sign In →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1e4a] via-[#0d2a6e] to-[#1a3a8a] text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        {/* Church image overlay */}
        <div className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: "url('/udom.jpeg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1e4a]/80 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Seventh-Day Adventist Church · Dodoma, Tanzania
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              UDOM Central<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                SDA Church
              </span>
            </h1>

            <p className="text-blue-200/80 text-lg mt-5 max-w-xl mx-auto md:mx-0 leading-relaxed">
              A modern, unified platform for managing your entire congregation — members, attendance, finances, reports, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center md:justify-start">
              <Link to="/login"
                className="bg-white text-blue-900 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm">
                Sign In to Dashboard →
              </Link>
              <Link to="/visitor-register"
                className="bg-white/10 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-all text-sm backdrop-blur-sm">
                I'm a Visitor 👋
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full md:w-auto md:max-w-xs">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-blue-300/80 text-xs mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 28C840 36 960 42 1080 40C1200 38 1320 28 1380 23L1440 18V60H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              Everything your church needs
            </h2>
            <p className="text-gray-400 mt-3 text-base max-w-xl mx-auto">
              Manage your entire congregation from one secure, easy-to-use platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50/50 transition-all duration-200 cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">How to access the system</h2>
          <p className="text-gray-400 text-base mb-12">Getting started is simple</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Get your account', desc: 'Contact your church administrator to get a username and password.' },
              { step: '02', title: 'Sign in', desc: 'Click "Sign In" and enter your credentials to access the dashboard.' },
              { step: '03', title: 'Start managing', desc: 'View members, record attendance, check finances, and much more.' },
            ].map(s => (
              <div key={s.step} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to get started?</h2>
        <p className="text-blue-200 text-base mb-8 max-w-md mx-auto">
          Sign in with your credentials or register as a visitor to explore the church.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login"
            className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm">
            Sign In Now →
          </Link>
          <Link to="/visitor-register"
            className="bg-white/10 border border-white/25 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all text-sm">
            Visitor Registration
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/sda.jpeg" alt="" className="w-7 h-7 rounded-full object-cover opacity-70" />
          <span className="text-sm font-semibold text-gray-300">UDOM Central SDA Church</span>
        </div>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Seventh-Day Adventist Church · Dodoma, Tanzania. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
