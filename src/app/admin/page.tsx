'use client';

import { useState, useEffect, useCallback } from 'react';
import { config } from '@/lib/config';

interface Booking {
  id: string;
  slug: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_price: string;
  car_image_url: string | null;
  client_ref: string | null;
  status: string;
  created_at: string;
}

interface Appointment {
  id: string;
  booking_id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  purpose: string;
  preferred_date: string;
  preferred_time: string;
  num_visitors: string;
  payment_method: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  bookings: {
    car_make: string;
    car_model: string;
    car_year: number;
    car_price: string;
  } | null;
}

type Tab = 'create' | 'appointments' | 'bookings';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('create');

  // Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  // Create booking form
  const [createForm, setCreateForm] = useState({
    car_make: '',
    car_model: '',
    car_year: '',
    car_price: '',
    car_image_url: '',
    client_ref: '',
  });
  const [createdUrl, setCreatedUrl] = useState('');
  const [creating, setCreating] = useState(false);

  // Check if already authed on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/bookings', { method: 'GET' });
      if (res.ok) {
        setAuthed(true);
        loadData();
      }
    } catch {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      setPassword('');
      loadData();
    } else {
      setLoginError('Wrong password. Try again.');
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, aRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/appointments'),
      ]);
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData.bookings || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAppointments(aData.appointments || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreatedUrl('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          car_year: parseInt(createForm.car_year),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedUrl(data.url);
        setCreateForm({
          car_make: '', car_model: '', car_year: '',
          car_price: '', car_image_url: '', client_ref: '',
        });
        loadData(); // Refresh list
      }
    } catch {}
    setCreating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied: ' + text);
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setAuthed(false);
  };

  // ===== LOGIN SCREEN =====
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-8 text-center">
            <h1 className="text-white text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-200 text-sm mt-1">Jetour Appointments</p>
          </div>
          <form onSubmit={handleLogin} className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
              {loginError && <p className="text-red-500 text-xs mt-1.5">{loginError}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-bold active:scale-95 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== DASHBOARD =====
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-bold text-lg">Jetour Appointments</h1>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs hidden sm:inline">{appointments.filter(a => a.status === 'pending').length} pending</span>
            <button onClick={handleLogout} className="text-slate-400 text-xs hover:text-white transition">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-900 rounded-xl p-1">
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              tab === 'create' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            New Booking
          </button>
          <button
            onClick={() => setTab('appointments')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
              tab === 'appointments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Appointments
            {appointments.filter(a => a.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {appointments.filter(a => a.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('bookings')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              tab === 'bookings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bookings ({bookings.length})
          </button>
        </div>

        {/* ===== CREATE BOOKING TAB ===== */}
        {tab === 'create' && (
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-slate-800 font-bold text-lg mb-1">Create New Booking</h2>
              <p className="text-slate-500 text-sm mb-5">
                Fill in the confirmed car details. A unique link will be generated for your client to book their office visit.
              </p>

              {createdUrl && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
                  <p className="text-green-800 font-semibold text-sm mb-2">Booking link created!</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdUrl}
                      className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-xs text-slate-700"
                    />
                    <button
                      onClick={() => copyToClipboard(createdUrl)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-green-600 text-xs mt-2">Send this link to your client on WhatsApp.</p>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Make <span className="text-red-500">*</span></label>
                    <input
                      type="text" required
                      value={createForm.car_make}
                      onChange={e => setCreateForm({...createForm, car_make: e.target.value})}
                      placeholder="e.g. Toyota"
                      className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Model <span className="text-red-500">*</span></label>
                    <input
                      type="text" required
                      value={createForm.car_model}
                      onChange={e => setCreateForm({...createForm, car_model: e.target.value})}
                      placeholder="e.g. RAV4"
                      className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Year <span className="text-red-500">*</span></label>
                    <input
                      type="number" required min="1990" max="2026"
                      value={createForm.car_year}
                      onChange={e => setCreateForm({...createForm, car_year: e.target.value})}
                      placeholder="e.g. 2023"
                      className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Agreed Price <span className="text-red-500">*</span></label>
                    <input
                      type="text" required
                      value={createForm.car_price}
                      onChange={e => setCreateForm({...createForm, car_price: e.target.value})}
                      placeholder="e.g. $12,500"
                      className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Car Image URL</label>
                  <input
                    type="url"
                    value={createForm.car_image_url}
                    onChange={e => setCreateForm({...createForm, car_image_url: e.target.value})}
                    placeholder="https://example.com/car-photo.jpg"
                    className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                  <p className="text-xs text-slate-400 mt-1">Paste a direct link to the car photo. The client will see this image on their form.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Client Reference (optional)</label>
                  <input
                    type="text"
                    value={createForm.client_ref}
                    onChange={e => setCreateForm({...createForm, client_ref: e.target.value})}
                    placeholder="e.g. Kwame - WhatsApp discussion Oct 24"
                    className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                  <p className="text-xs text-slate-400 mt-1">Internal note to help you remember which client this is for.</p>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-bold active:scale-95 transition disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Generate Booking Link'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===== APPOINTMENTS TAB ===== */}
        {tab === 'appointments' && (
          <div>
            {loading ? (
              <p className="text-slate-400 text-center py-8">Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-sm">No appointments yet.</p>
                <p className="text-slate-600 text-xs mt-1">When clients submit the booking form, their appointments will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(apt => (
                  <div key={apt.id} className="bg-white rounded-2xl p-5 shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{apt.client_name}</h3>
                        <p className="text-slate-500 text-xs">
                          {apt.bookings ? `${apt.bookings.car_make} ${apt.bookings.car_model} ${apt.bookings.car_year} - ${apt.bookings.car_price}` : 'Vehicle info unavailable'}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {apt.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div><span className="text-slate-400">WhatsApp:</span> <span className="text-slate-700 font-medium">{apt.client_phone}</span></div>
                      <div><span className="text-slate-400">Date:</span> <span className="text-slate-700 font-medium">{new Date(apt.preferred_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
                      <div><span className="text-slate-400">Time:</span> <span className="text-slate-700 font-medium">{apt.preferred_time}</span></div>
                      <div><span className="text-slate-400">Purpose:</span> <span className="text-slate-700 font-medium">{apt.purpose}</span></div>
                      <div><span className="text-slate-400">Visitors:</span> <span className="text-slate-700 font-medium">{apt.num_visitors}</span></div>
                      <div><span className="text-slate-400">Payment:</span> <span className="text-slate-700 font-medium">{apt.payment_method || '—'}</span></div>
                    </div>

                    {apt.notes && (
                      <div className="bg-slate-50 rounded-lg p-2.5 mb-3">
                        <p className="text-xs text-slate-600"><span className="font-semibold">Notes:</span> {apt.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px]">
                        Submitted: {new Date(apt.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex gap-1.5">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition"
                          >
                            Complete
                          </button>
                        )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== BOOKINGS TAB ===== */}
        {tab === 'bookings' && (
          <div>
            {loading ? (
              <p className="text-slate-400 text-center py-8">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-sm">No bookings created yet.</p>
                <p className="text-slate-600 text-xs mt-1">Go to "New Booking" tab to create your first booking link.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm">
                          {b.car_make} {b.car_model} {b.car_year}
                        </h3>
                        <p className="text-blue-600 font-semibold text-sm">{b.car_price}</p>
                        {b.client_ref && (
                          <p className="text-slate-400 text-xs mt-0.5">{b.client_ref}</p>
                        )}
                        <p className="text-slate-400 text-[10px] mt-1">
                          Created: {new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                        b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="text"
                        readOnly
                        value={`${config.baseUrl}/b/${b.slug}`}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600"
                      />
                      <button
                        onClick={() => copyToClipboard(`${config.baseUrl}/b/${b.slug}`)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
