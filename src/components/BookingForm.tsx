'use client';

import { useState } from 'react';
import { config } from '@/lib/config';

interface Booking {
  id: string;
  slug: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_price: string;
  car_image_url: string | null;
}

export default function BookingForm({ booking }: { booking: Booking }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    purpose: '',
    preferred_date: '',
    preferred_time: '',
    num_visitors: '1',
    payment_method: 'Bank Transfer',
    notes: '',
  });

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeSlot) {
      setError('Please select a time slot');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      // Save to database
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preferred_time: timeSlot,
          booking_id: booking.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');
      const data = await res.json();

      // Build WhatsApp message for Accra office
      const formattedDate = new Date(formData.preferred_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      let msg = '*NEW OFFICE APPOINTMENT*\n';
      msg += '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\n';
      msg += '*Client*\n';
      msg += `Name: ${formData.client_name}\n`;
      msg += `WhatsApp: ${formData.client_phone}\n`;
      if (formData.client_email) msg += `Email: ${formData.client_email}\n`;
      msg += '\n*Vehicle Confirmed*\n';
      msg += `Vehicle: ${booking.car_make} ${booking.car_model} ${booking.car_year}\n`;
      msg += `Agreed Price: ${booking.car_price}\n`;
      msg += '\n*Appointment*\n';
      msg += `Purpose: ${formData.purpose}\n`;
      msg += `Date: ${formattedDate}\n`;
      msg += `Time: ${timeSlot}\n`;
      msg += `Visitors: ${formData.num_visitors}\n`;
      msg += `Payment: ${formData.payment_method}\n`;
      if (formData.notes) {
        msg += `\n*Notes*\n${formData.notes}\n`;
      }
      msg += '\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n';
      msg += 'Please confirm this appointment.';

      setSubmitted(true);

      // Open WhatsApp after a short delay
      setTimeout(() => {
        const url = `https://wa.me/${config.officeWhatsApp}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
      }, 500);
    } catch (err) {
      setError('Something went wrong. Please try again or contact us on WhatsApp.');
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <h1 className="text-white text-xl font-bold">Appointment Request Sent!</h1>
            <p className="text-blue-200 text-sm mt-2">Your appointment has been recorded.</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-slate-600 text-sm mb-4">
              We are opening WhatsApp so you can send the details to our Accra office.
              Please tap send in WhatsApp to confirm your appointment.
            </p>
            <p className="text-slate-400 text-xs">
              Our office will confirm your appointment via WhatsApp shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-6 text-center">
          <h1 className="text-white text-xl font-bold">Schedule Your Office Visit</h1>
          <p className="text-blue-200 text-xs mt-1">Book your appointment at our Accra office</p>
          <span className="inline-block bg-green-500/20 text-green-400 text-[11px] font-semibold px-3 py-1 rounded-full mt-2">
            Adenta-Accra, Ghana
          </span>
        </div>

        {/* Car Info (Pre-filled by admin - read only) */}
        <div className="p-5 border-b-2 border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Vehicle Confirmed</p>
          {booking.car_image_url && (
            <img
              src={booking.car_image_url}
              alt={`${booking.car_make} ${booking.car_model}`}
              className="w-full h-40 object-cover rounded-xl mb-3"
            />
          )}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Make</span>
              <span className="font-semibold text-slate-800">{booking.car_make}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Model</span>
              <span className="font-semibold text-slate-800">{booking.car_model}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Year</span>
              <span className="font-semibold text-slate-800">{booking.car_year}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Agreed Price</span>
              <span className="font-bold text-blue-600">{booking.car_price}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Vehicle details confirmed with your sales agent. If anything is incorrect, please contact us on WhatsApp before booking.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">

          {/* Section: Your Information */}
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 pb-1.5 border-b-2 border-slate-100">Your Information</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text" required
              value={formData.client_name}
              onChange={e => updateField('client_name', e.target.value)}
              placeholder="e.g. Kwame Mensah"
              className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">WhatsApp <span className="text-red-500">*</span></label>
              <input
                type="tel" required
                value={formData.client_phone}
                onChange={e => updateField('client_phone', e.target.value)}
                placeholder="+233 55 123 4567"
                className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.client_email}
                onChange={e => updateField('client_email', e.target.value)}
                placeholder="you@email.com"
                className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Section: Appointment */}
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 mt-5 pb-1.5 border-b-2 border-slate-100">Appointment Details</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Purpose of Visit <span className="text-red-500">*</span></label>
            <select
              required value={formData.purpose}
              onChange={e => updateField('purpose', e.target.value)}
              className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="" disabled>Select purpose</option>
              <option value="Payment only">Payment only</option>
              <option value="Payment + Document Signing">Payment + Document Signing</option>
              <option value="Document Signing only">Document Signing only</option>
              <option value="Vehicle Inspection before Payment">Vehicle Inspection before Payment</option>
              <option value="Full Vehicle Pickup">Full Vehicle Pickup (Payment + Documents + Collection)</option>
              <option value="Other">Other (specify in notes)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Preferred Date <span className="text-red-500">*</span></label>
            <input
              type="date" required min={minDate}
              value={formData.preferred_date}
              onChange={e => {
                const day = new Date(e.target.value).getDay();
                if (day === 0) {
                  alert('Our office is closed on Sundays. Please choose Monday to Saturday.');
                  return;
                }
                updateField('preferred_date', e.target.value);
              }}
              className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">Office hours: Mon - Sat, 9:00 AM - 5:00 PM</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Preferred Time <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: '9:00 AM - 12:00 PM', label: 'Morning', sub: '9AM-12PM' },
                { val: '12:00 PM - 3:00 PM', label: 'Midday', sub: '12PM-3PM' },
                { val: '3:00 PM - 5:00 PM', label: 'Afternoon', sub: '3PM-5PM' },
              ].map(slot => (
                <button
                  key={slot.val}
                  type="button"
                  onClick={() => { setTimeSlot(slot.val); setError(''); }}
                  className={`py-2.5 px-1 border-2 rounded-lg text-center text-xs font-semibold transition ${
                    timeSlot === slot.val
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {slot.label}<br/>{slot.sub}
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Visitors</label>
              <select
                value={formData.num_visitors}
                onChange={e => updateField('num_visitors', e.target.value)}
                className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              >
                <option value="1">1 person</option>
                <option value="2">2 people</option>
                <option value="3">3 people</option>
                <option value="4+">4+ people</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Payment</label>
              <select
                value={formData.payment_method}
                onChange={e => updateField('payment_method', e.target.value)}
                className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Cheque">Cheque</option>
                <option value="To be discussed">To be discussed</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={e => updateField('notes', e.target.value)}
              placeholder="Any questions or special requests..."
              rows={3}
              className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-60"
          >
            {submitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.608.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Confirm via WhatsApp
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-400 mt-3">
            By submitting, your appointment is recorded and sent to our Accra office via WhatsApp.
          </p>
        </form>
      </div>
    </div>
  );
}
