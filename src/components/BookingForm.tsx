'use client';

import { useState } from 'react';
import { config } from '@/lib/config';
import {
  CalendarDays, Clock, MapPin, Check, Car, ChevronRight,
  ShieldCheck, FileCheck, Sparkles, Phone,
} from 'lucide-react';

interface Booking {
  id: string;
  slug: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_price: string;
  car_image_url: string | null;
}

const TIME_SLOTS = [
  { val: '9:00 AM - 12:00 PM', label: 'Morning', sub: '9AM - 12PM' },
  { val: '12:00 PM - 3:00 PM', label: 'Midday', sub: '12PM - 3PM' },
  { val: '3:00 PM - 5:00 PM', label: 'Afternoon', sub: '3PM - 5PM' },
];

const HOOK_POINTS = [
  { icon: ShieldCheck, title: 'Vehicle Ready', desc: 'Your car is at our Accra office, inspected and ready for collection' },
  { icon: FileCheck, title: 'Documents Prepared', desc: 'Ownership transfer and registration documents ready for signing' },
  { icon: Car, title: 'Drive Home Today', desc: 'Complete your payment at the office and drive your car home same day' },
];

export default function BookingForm({ booking }: { booking: Booking }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [form, setForm] = useState({
    client_name: '', client_phone: '', client_email: '',
    purpose: '', preferred_date: '', num_visitors: '1',
    payment_method: 'Bank Transfer', notes: '',
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeSlot) { setError('Please select a time slot'); return; }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, preferred_time: timeSlot, booking_id: booking.id }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);

      const formattedDate = new Date(form.preferred_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      let msg = '*NEW OFFICE APPOINTMENT*\n';
      msg += '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\n';
      msg += '*Client*\n';
      msg += `Name: ${form.client_name}\n`;
      msg += `WhatsApp: ${form.client_phone}\n`;
      if (form.client_email) msg += `Email: ${form.client_email}\n`;
      msg += '\n*Vehicle*\n';
      msg += `Vehicle: ${booking.car_make} ${booking.car_model} ${booking.car_year}\n`;
      msg += `Agreed Price: ${booking.car_price}\n`;
      msg += '\n*Appointment*\n';
      msg += `Purpose: ${form.purpose}\n`;
      msg += `Date: ${formattedDate}\n`;
      msg += `Time: ${timeSlot}\n`;
      msg += `Visitors: ${form.num_visitors}\n`;
      msg += `Payment: ${form.payment_method}\n`;
      if (form.notes) msg += `\n*Notes*\n${form.notes}\n`;
      msg += '\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n';
      msg += 'Please confirm this appointment.';

      setTimeout(() => {
        const url = `https://wa.me/${config.officeWhatsApp}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
      }, 500);
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  // ===== SUCCESS SCREEN =====
  if (submitted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
        <div className="w-full max-w-md">
          <div className="card-coda p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <Check className="h-8 w-8 text-accent" strokeWidth={2} />
            </div>
            <h1 className="font-display text-2xl font-black uppercase tracking-[-0.01em] text-ink">
              Your Car Awaits
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Your appointment has been recorded. We are opening WhatsApp so you can send the details to our Accra office.
              Please tap send in WhatsApp to confirm.
            </p>
            <div className="mt-6 rounded-xl bg-card p-4 text-left">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-muted">What happens next</p>
              <ol className="mt-2 space-y-1.5 text-xs text-muted">
                <li>1. Send the WhatsApp message to our office</li>
                <li>2. Our office confirms your appointment</li>
                <li>3. Visit the office on your selected date</li>
                <li>4. Complete payment and collect your car</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== BOOKING FORM =====
  return (
    <div className="min-h-dvh bg-cream">
      {/* Top Bar */}
      <div className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-2xl items-center gap-2.5 px-4 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink">
            <CalendarDays className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-display text-base font-black uppercase tracking-[-0.01em] text-ink">Appointment</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Premium Welcome */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
            <Sparkles className="h-6 w-6 text-accent" strokeWidth={1.5} />
          </div>
          <p className="eyebrow">Your Car Awaits You</p>
          <h1 className="display-lg mt-4 text-ink">
            Welcome, Your<br /><span className="text-accent">Jetour</span> Is Ready
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
            Your car is at our Accra office and ready for collection. Book your visit to complete payment and drive home.
          </p>
        </div>

        {/* Car Info Card (pre-filled by admin) */}
        <div className="card-coda mb-6 overflow-hidden">
          {booking.car_image_url && (
            <div className="relative h-56 overflow-hidden sm:h-72">
              <img src={booking.car_image_url} alt={`${booking.car_make} ${booking.car_model}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="badge bg-accent text-white">Ready for Collection</span>
              </div>
            </div>
          )}
          <div className="p-5 sm:p-6">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-muted">Vehicle Confirmed</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Vehicle</span>
                <span className="font-sans text-sm font-bold text-ink">{booking.car_make} {booking.car_model} {booking.car_year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Agreed Price</span>
                <span className="font-sans text-lg font-black text-accent">{booking.car_price}</span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-2">
                <span className="text-sm text-muted">Import Duty (est.)</span>
                <span className="font-sans text-sm font-bold text-ink">Payable at office</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Registration & Tags</span>
                <span className="font-sans text-sm font-bold text-ink">Assisted on-site</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-faint">
              If any detail is incorrect, contact your sales agent on WhatsApp before booking.
            </p>
          </div>
        </div>

        {/* Hook Points — why book now */}
        <div className="mb-6 space-y-3">
          {HOOK_POINTS.map((point, i) => {
            const Icon = point.icon;
            return (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 flex-shrink-0">
                  <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-sm font-bold text-ink">{point.title}</p>
                  <p className="text-xs text-muted">{point.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Office Info with Image */}
        <div className="card-coda mb-6 overflow-hidden">
          <div className="relative h-40 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1568605114967-8130f3a36894?w=800&h=400&fit=crop"
              alt="MUSTDONE AUTO GHANA office"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="font-display text-lg font-black uppercase tracking-[-0.01em] text-white">{config.officeName}</p>
              <a href={config.officeMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-white/80 underline-offset-2 hover:underline">
                <MapPin className="h-3 w-3" strokeWidth={2} /> View on Google Maps
              </a>
            </div>
          </div>
          <div className="space-y-3 p-4">
            {/* Agent */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-sans text-sm font-bold text-ink">{config.officeAgent}</p>
                <p className="text-xs text-muted">{config.officeAgentRole}</p>
              </div>
            </div>
            {/* Hours + Phone */}
            <div className="flex items-center gap-4 border-t border-line pt-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card flex-shrink-0">
                <Clock className="h-5 w-5 text-ink" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-sans text-sm font-bold text-ink">{config.officeHours}</p>
                <p className="text-xs text-muted">{config.officePhoneDisplay} · Walk-ins welcome, appointments get priority</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent flex-shrink-0">
            <Phone className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-sans text-sm font-bold text-ink">Have questions before booking?</p>
            <p className="text-xs text-muted">Chat with us on WhatsApp for instant answers</p>
          </div>
          <a
            href={`https://wa.me/${config.officeWhatsApp}?text=${encodeURIComponent('Hi, I have a question about my vehicle appointment.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent px-4 py-2.5 text-[11px]"
          >
            WhatsApp
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-coda space-y-6 p-5 sm:p-8">
          {/* Section: Your Info */}
          <div>
            <h2 className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
              Your Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-sans text-sm font-semibold text-ink">Full Name *</label>
                <input type="text" required value={form.client_name}
                  onChange={e => update('client_name', e.target.value)}
                  placeholder="e.g. Kwame Mensah" className="input-coda" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-sans text-sm font-semibold text-ink">WhatsApp *</label>
                  <input type="tel" required value={form.client_phone}
                    onChange={e => update('client_phone', e.target.value)}
                    placeholder="+233 55 123 4567" className="input-coda" />
                </div>
                <div>
                  <label className="mb-2 block font-sans text-sm font-semibold text-ink">Email</label>
                  <input type="email" value={form.client_email}
                    onChange={e => update('client_email', e.target.value)}
                    placeholder="you@email.com" className="input-coda" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Appointment */}
          <div>
            <h2 className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
              Appointment Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-sans text-sm font-semibold text-ink">Purpose of Visit *</label>
                <select required value={form.purpose}
                  onChange={e => update('purpose', e.target.value)}
                  className="select-coda">
                  <option value="" disabled>Select purpose</option>
                  <option value="Payment only">Payment only</option>
                  <option value="Payment + Document Signing">Payment + Document Signing</option>
                  <option value="Document Signing only">Document Signing only</option>
                  <option value="Other">Other (specify in notes)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-sans text-sm font-semibold text-ink">Preferred Date *</label>
                <input type="date" required min={minDate} value={form.preferred_date}
                  onChange={e => {
                    const day = new Date(e.target.value).getDay();
                    if (day === 0) { alert('Office closed on Sundays. Please choose Monday - Saturday.'); return; }
                    update('preferred_date', e.target.value);
                  }}
                  className="input-coda" />
                <p className="mt-1.5 text-xs text-faint">Office hours: Monday - Saturday, 9:00 AM - 5:00 PM</p>
              </div>

              <div>
                <label className="mb-2 block font-sans text-sm font-semibold text-ink">Preferred Time *</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot.val} type="button"
                      onClick={() => { setTimeSlot(slot.val); setError(''); }}
                      className={`rounded-xl border-2 px-2 py-3 text-center transition ${
                        timeSlot === slot.val
                          ? 'border-ink bg-ink text-white'
                          : 'border-line bg-paper text-muted hover:border-ink/30'
                      }`}>
                      <span className="block font-sans text-xs font-bold">{slot.label}</span>
                      <span className="mt-0.5 block text-[10px] opacity-70">{slot.sub}</span>
                    </button>
                  ))}
                </div>
                {error && <p className="mt-2 text-xs text-danger">{error}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-sans text-sm font-semibold text-ink">Visitors</label>
                  <select value={form.num_visitors}
                    onChange={e => update('num_visitors', e.target.value)}
                    className="select-coda">
                    <option value="1">1 person</option>
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="4+">4+ people</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-sans text-sm font-semibold text-ink">Payment Method</label>
                  <select value={form.payment_method}
                    onChange={e => update('payment_method', e.target.value)}
                    className="select-coda">
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Cheque">Cheque</option>
                    <option value="To be discussed">To be discussed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-sans text-sm font-semibold text-ink">Notes (optional)</label>
                <textarea value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                  placeholder="Any questions or special requests..."
                  rows={3} className="input-coda resize-none" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="btn-primary w-full justify-center py-4 text-sm">
            {submitting ? 'Saving...' : (
              <>
                Confirm via WhatsApp
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </>
            )}
          </button>

          <p className="text-center text-xs text-faint">
            Your appointment is recorded and sent to our Accra office via WhatsApp.
          </p>
        </form>
      </div>
    </div>
  );
}
