'use client';

import { useState } from 'react';
import { useData, type Booking } from '@/lib/hooks';
import { config } from '@/lib/config';
import { Car, Copy, Check, Trash2, ExternalLink } from 'lucide-react';

export default function BookingsPage() {
  const { bookings, loading, loadData } = useData();
  const [copiedSlug, setCopiedSlug] = useState('');

  const copyUrl = (slug: string) => {
    const url = `${config.baseUrl}/b/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(''), 2000);
  };

  const deleteBooking = async (slug: string) => {
    if (!confirm('Delete this booking? Related appointments will also be deleted.')) return;
    await fetch(`/api/bookings/${slug}`, { method: 'DELETE' });
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Manage</p>
          <h1 className="display-md mt-3 text-ink">Bookings</h1>
          <p className="mt-2 text-sm text-muted">{bookings.length} total · {bookings.filter(b => b.status === 'active').length} active</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="card-coda p-12 text-center">
          <Car className="mx-auto mb-4 h-12 w-12 text-faint" strokeWidth={1} />
          <p className="font-sans text-sm font-semibold text-ink">No bookings created yet</p>
          <p className="mt-1 text-xs text-muted">Go to "New Booking" to create your first booking link.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map(b => (
            <BookingGridCard
              key={b.id}
              booking={b}
              copied={copiedSlug === b.slug}
              onCopy={() => copyUrl(b.slug)}
              onDelete={() => deleteBooking(b.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingGridCard({ booking, copied, onCopy, onDelete }: {
  booking: Booking;
  copied: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card-coda group flex flex-col">
      {/* Image */}
      {booking.car_image_url ? (
        <div className="relative h-40 overflow-hidden">
          <img src={booking.car_image_url} alt="" className="h-full w-full object-cover" />
          <span className={`badge ${booking.status === 'active' ? 'badge-active' : 'badge-cancelled'} absolute right-3 top-3`}>
            {booking.status}
          </span>
        </div>
      ) : (
        <div className="relative flex h-40 items-center justify-center bg-card">
          <Car className="h-12 w-12 text-faint" strokeWidth={1} />
          <span className={`badge ${booking.status === 'active' ? 'badge-active' : 'badge-cancelled'} absolute right-3 top-3`}>
            {booking.status}
          </span>
        </div>
      )}

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <p className="font-sans text-sm font-bold text-ink">
          {booking.car_make} {booking.car_model} {booking.car_year}
        </p>
        <p className="mt-1 font-sans text-base font-black text-accent">{booking.car_price.startsWith('$') ? booking.car_price : `$${booking.car_price}`}</p>
        {booking.client_ref && (
          <p className="mt-1 truncate text-xs text-muted">{booking.client_ref}</p>
        )}
        <p className="mt-1 text-[10px] text-faint">
          Created {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Link + Actions */}
        <div className="mt-4 space-y-2 border-t border-line pt-3">
          <div className="flex items-center gap-2">
            <input
              type="text" readOnly
              value={`${config.baseUrl}/b/${booking.slug}`}
              className="min-w-0 flex-1 truncate rounded-lg border border-line bg-paper px-3 py-2 font-sans text-[11px] text-muted"
            />
            <button onClick={onCopy}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ink text-white transition hover:bg-ink/85">
              {copied ? <Check className="h-4 w-4" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
          <div className="flex gap-2">
            <a
              href={`${config.baseUrl}/b/${booking.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-2 font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-ink transition hover:border-ink"
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} /> Open
            </a>
            <button onClick={onDelete}
              className="flex items-center justify-center rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-danger transition hover:bg-danger/10">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
