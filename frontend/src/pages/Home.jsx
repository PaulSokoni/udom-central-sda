import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '👥', title: 'Member Management', desc: 'Register, track, and manage all church members with full profiles and history.' },
  { icon: '📋', title: 'Attendance Tracking', desc: 'Record weekly Sabbath attendance and generate attendance reports easily.' },
  { icon: '💰', title: 'Tithe & Finance', desc: 'Track tithes, offerings, and church finances with detailed records.' },
  { icon: '📊', title: 'Monthly Reports', desc: 'Generate and store monthly church reports for leadership and conference.' },
  { icon: '📅', title: 'Events & Programs', desc: 'Manage church events, camp meetings, and special programs.' },
  { icon: '🙏', title: 'Prayer Requests', desc: 'Collect and manage prayer requests from members and visitors.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-extrabold text-sm">UC</div>
            <div>
              <p className="font-bold text-blue-900 text-sm leading-tight">UDOM Central SDA</p>
              <p className="text-gray-400 text-xs leading-tight">Church Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/visitor-register" className="text-sm text-gray-600 font-medium hover:text-blue-800 transition-colors">
              Visitor Registration
            </Link>
            <Link to="/login" className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative flex-1 flex items-center justify-center text-center px-4 py-24 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1600&q=80')" }}
      >
        <div className="absolute inset-0 bg-blue-950/75" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/20">
            Seventh-Day Adventist Church
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            UDOM Central<br />
            <span className="text-blue-300">SDA Church</span>
          </h1>
          <p className="text-blue-100 text-lg mt-5 leading-relaxed max-w-xl mx-auto">
            A unified management system for members, attendance, finances, and church administration — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white text-blue-900 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-blue-50 transition-all text-sm"
            >
              Sign In to Dashboard →
            </Link>
            <Link
              to="/visitor-register"
              className="w-full sm:w-auto bg-white/10 backdrop-blur text-white font-semibold px-8 py-3.5 rounded-xl border border-white/30 hover:bg-white/20 transition-all text-sm"
            >
              Register as Visitor
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-gray-900">Everything your church needs</h2>
            <p className="text-gray-400 mt-2 text-sm">Manage your entire congregation from one secure platform</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{f.title}</h3>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 py-14 px-4 text-center">
        <h2 className="text-2xl font-extrabold text-white">Ready to get started?</h2>
        <p className="text-blue-300 mt-2 text-sm">Sign in with your credentials or contact your administrator for access.</p>
        <Link
          to="/login"
          className="inline-block mt-6 bg-white text-blue-900 font-bold px-8 py-3.5 rounded-xl shadow hover:bg-blue-50 transition-all text-sm"
        >
          Sign In Now →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center text-xs py-5 px-4">
        © {new Date().getFullYear()} UDOM Central Seventh-Day Adventist Church. All rights reserved.
      </footer>

    </div>
  );
}
