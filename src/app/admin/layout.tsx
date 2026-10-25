'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, PlusCircle, CalendarDays, Car, Settings,
  LogOut, Menu, X,
} from 'lucide-react';
import { useAuth, useData, getStats } from '@/lib/hooks';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/create', label: 'New Booking', icon: PlusCircle },
  { href: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/admin/bookings', label: 'Bookings', icon: Car },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { authed, checking, login, logout } = useAuth();
  const { bookings, appointments, loading } = useData();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileNav(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileNav ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileNav]);

  // ===== LOGIN SCREEN =====
  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-charcoal">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-charcoal px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <CalendarDays className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl font-black uppercase tracking-[-0.01em] text-white">
              Appointment
            </h1>
            <p className="mt-1 text-sm text-white/50">Admin Dashboard</p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoginError('');
              const ok = await login(password);
              if (!ok) setLoginError('Wrong password. Try again.');
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-accent"
              />
              {loginError && <p className="mt-2 text-xs text-danger">{loginError}</p>}
            </div>
            <button type="submit" className="btn-accent w-full justify-center">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== DASHBOARD LAYOUT =====
  const stats = getStats(bookings, appointments);

  return (
    <div className="min-h-dvh bg-cream lg:flex">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-charcoal lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <CalendarDays className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-display text-lg font-black uppercase tracking-[-0.01em] text-white">
            Appointment
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const badge = item.href === '/admin/appointments' && stats.pending > 0
              ? stats.pending : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                <span className="flex-1">{item.label}</span>
                {badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-flare px-1.5 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="nav-item w-full"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-cream/95 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-charcoal">
            <CalendarDays className="h-4 w-4 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-display text-base font-black uppercase tracking-[-0.01em] text-ink">
            Appointment
          </span>
        </div>
        <button
          onClick={() => setMobileNav(!mobileNav)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink"
        >
          {mobileNav ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNav && (
        <div className="fixed inset-0 top-16 z-30 bg-cream lg:hidden">
          <nav className="space-y-1 p-4">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const badge = item.href === '/admin/appointments' && stats.pending > 0
                ? stats.pending : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-4 font-sans text-sm font-semibold transition-colors ${
                    isActive ? 'bg-ink text-white' : 'text-ink hover:bg-card'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  <span className="flex-1">{item.label}</span>
                  {badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-flare px-1.5 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-4 font-sans text-sm font-semibold text-danger hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.5} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
