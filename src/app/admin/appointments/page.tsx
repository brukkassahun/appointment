'use client';

import { useState, useMemo } from 'react';
import { useData, type Appointment } from '@/lib/hooks';
import { Search, CalendarDays, Car, Trash2, Phone, Clock } from 'lucide-react';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

export default function AppointmentsPage() {
  const { appointments, loading, loadData } = useData();
  const [filter, setFilter] = useState<typeof STATUS_FILTERS[number]>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = appointments;
    if (filter !== 'all') {
      result = result.filter(a => a.status === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.client_name.toLowerCase().includes(q) ||
        a.client_phone.includes(q) ||
        (a.bookings?.car_make?.toLowerCase().includes(q)) ||
        (a.bookings?.car_model?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [appointments, filter, search]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const deleteApt = async (id: string) => {
    if (!confirm('Delete this appointment permanently?')) return;
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    loadData();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="eyebrow">Manage</p>
        <h1 className="display-md mt-3 text-ink">Appointments</h1>
        <p className="mt-2 text-sm text-muted">{appointments.length} total · {appointments.filter(a => a.status === 'pending').length} pending</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" strokeWidth={1.5} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, or car..."
            className="input-coda pl-11"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 rounded-full px-4 py-2 font-sans text-xs font-bold uppercase tracking-[0.14em] transition ${
                filter === f ? 'bg-ink text-white' : 'border border-line bg-paper text-muted hover:border-ink/30'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card-coda p-12 text-center">
          <CalendarDays className="mx-auto mb-4 h-12 w-12 text-faint" strokeWidth={1} />
          <p className="font-sans text-sm font-semibold text-ink">
            {appointments.length === 0 ? 'No appointments yet' : 'No matching appointments'}
          </p>
          <p className="mt-1 text-xs text-muted">
            {appointments.length === 0 ? 'Create a booking link and share it with your client.' : 'Try a different filter or search term.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => (
            <AppointmentCard
              key={apt.id}
              apt={apt}
              onUpdate={updateStatus}
              onDelete={deleteApt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ apt, onUpdate, onDelete }: {
  apt: Appointment;
  onUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const statusClass = apt.status === 'pending' ? 'badge-pending'
    : apt.status === 'confirmed' ? 'badge-confirmed'
    : apt.status === 'completed' ? 'badge-completed'
    : 'badge-cancelled';

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <div className="card-coda p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Image */}
        {apt.bookings?.car_image_url ? (
          <img src={apt.bookings.car_image_url} alt="" className="h-20 w-20 rounded-xl object-cover border border-line flex-shrink-0" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-card border border-line flex-shrink-0">
            <Car className="h-8 w-8 text-faint" strokeWidth={1} />
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-sans text-base font-bold text-ink">{apt.client_name}</p>
              <p className="truncate text-sm text-muted">
                {apt.bookings ? `${apt.bookings.car_make} ${apt.bookings.car_model} ${apt.bookings.car_year} · ${apt.bookings.car_price.startsWith('$') ? apt.bookings.car_price : `$${apt.bookings.car_price}`}` : 'Vehicle unavailable'}
              </p>
            </div>
            <span className={`badge ${statusClass} flex-shrink-0`}>{apt.status}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
            <div className="flex items-center gap-1.5 text-muted">
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} /> {apt.client_phone}
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} /> {formatDate(apt.preferred_date)}
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> {apt.preferred_time}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg bg-card px-2 py-1 font-medium text-muted">{apt.purpose}</span>
            <span className="rounded-lg bg-card px-2 py-1 font-medium text-muted">{apt.num_visitors} visitor(s)</span>
            {apt.payment_method && (
              <span className="rounded-lg bg-card px-2 py-1 font-medium text-muted">{apt.payment_method}</span>
            )}
          </div>

          {apt.notes && (
            <p className="mt-2 rounded-lg bg-card px-3 py-2 text-xs text-muted">
              <span className="font-semibold text-ink">Note: </span>{apt.notes}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-[10px] text-faint">
          Submitted {new Date(apt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex flex-wrap gap-2">
          {apt.status === 'pending' && (
            <button onClick={() => onUpdate(apt.id, 'confirmed')}
              className="rounded-lg bg-blue-50 px-3 py-1.5 font-sans text-xs font-bold text-blue-600 transition hover:bg-blue-100">
              Confirm
            </button>
          )}
          {apt.status === 'confirmed' && (
            <button onClick={() => onUpdate(apt.id, 'completed')}
              className="rounded-lg bg-accent/10 px-3 py-1.5 font-sans text-xs font-bold text-accent transition hover:bg-accent/20">
              Complete
            </button>
          )}
          {apt.status !== 'cancelled' && apt.status !== 'completed' && (
            <button onClick={() => onUpdate(apt.id, 'cancelled')}
              className="rounded-lg bg-red-50 px-3 py-1.5 font-sans text-xs font-bold text-danger transition hover:bg-red-100">
              Cancel
            </button>
          )}
          <button onClick={() => onDelete(apt.id)}
            className="rounded-lg bg-card px-3 py-1.5 font-sans text-xs font-bold text-faint transition hover:bg-slate-200">
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
