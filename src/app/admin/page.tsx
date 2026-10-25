'use client';

import { useData, getStats, type Booking, type Appointment } from '@/lib/hooks';
import { CalendarDays, Clock, CheckCircle2, XCircle, Car, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { bookings, appointments, loading } = useData();
  const stats = getStats(bookings, appointments);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink" />
      </div>
    );
  }

  const statCards = [
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-flare', bg: 'bg-flare/10' },
    { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Total Appointments', value: stats.totalAppointments, icon: CalendarDays, color: 'text-ink', bg: 'bg-card' },
    { label: 'Active Bookings', value: stats.activeBookings, icon: Car, color: 'text-navy', bg: 'bg-navy/5' },
    { label: 'Today', value: stats.todayAppointments, icon: Calendar, color: 'text-flare', bg: 'bg-flare/10' },
  ];

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="display-md mt-3 text-ink">Dashboard</h1>
        </div>
        <Link href="/admin/create" className="btn-primary">
          <span>+ New Booking</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} strokeWidth={1.5} />
              </div>
              <p className="font-display text-3xl font-black text-ink">{card.value}</p>
              <p className="mt-1 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Appointments */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="title text-ink">Recent Appointments</h2>
          <Link href="/admin/appointments" className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-accent hover:text-accent-strong">
            View All →
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="card-coda p-8 text-center">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-faint" strokeWidth={1} />
            <p className="text-sm text-muted">No appointments yet.</p>
            <p className="mt-1 text-xs text-faint">Create a booking link and send it to your client.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map(apt => (
              <AppointmentRow key={apt.id} apt={apt} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="title text-ink">Recent Bookings</h2>
          <Link href="/admin/bookings" className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-accent hover:text-accent-strong">
            View All →
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="card-coda p-8 text-center">
            <Car className="mx-auto mb-3 h-10 w-10 text-faint" strokeWidth={1} />
            <p className="text-sm text-muted">No bookings created yet.</p>
            <Link href="/admin/create" className="btn-accent mt-4">
              Create Your First Booking
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.slice(0, 6).map(b => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentRow({ apt }: { apt: Appointment }) {
  const statusClass = apt.status === 'pending' ? 'badge-pending'
    : apt.status === 'confirmed' ? 'badge-confirmed'
    : apt.status === 'completed' ? 'badge-completed'
    : 'badge-cancelled';

  return (
    <div className="card-coda p-4">
      <div className="flex items-center gap-4">
        {apt.bookings?.car_image_url ? (
          <img src={apt.bookings.car_image_url} alt="" className="h-14 w-14 rounded-xl object-cover border border-line flex-shrink-0" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-card border border-line flex-shrink-0">
            <Car className="h-6 w-6 text-faint" strokeWidth={1} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-sans text-sm font-bold text-ink">{apt.client_name}</p>
            <span className={`badge ${statusClass} flex-shrink-0`}>{apt.status}</span>
          </div>
          <p className="truncate text-xs text-muted">
            {apt.bookings ? `${apt.bookings.car_make} ${apt.bookings.car_model} ${apt.bookings.car_year}` : 'Vehicle info unavailable'}
          </p>
          <p className="mt-1 text-xs text-faint">
            {new Date(apt.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {apt.preferred_time}
          </p>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="card-coda group">
      {booking.car_image_url ? (
        <div className="relative h-32 overflow-hidden">
          <img src={booking.car_image_url} alt="" className="h-full w-full object-cover" />
          <span className={`badge ${booking.status === 'active' ? 'badge-active' : 'badge-cancelled'} absolute right-2 top-2`}>
            {booking.status}
          </span>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center bg-card">
          <Car className="h-10 w-10 text-faint" strokeWidth={1} />
        </div>
      )}
      <div className="p-4">
        <p className="font-sans text-sm font-bold text-ink">
          {booking.car_make} {booking.car_model} {booking.car_year}
        </p>
        <p className="mt-1 font-sans text-sm font-bold text-accent">{booking.car_price}</p>
        {booking.client_ref && (
          <p className="mt-1 truncate text-xs text-muted">{booking.client_ref}</p>
        )}
      </div>
    </div>
  );
}
