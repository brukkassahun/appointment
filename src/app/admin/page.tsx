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
    car_image_url: string | null;
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
        loadData();
      }
    } catch {}
    setCreating(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prefix', 'appointments');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCreateForm(prev => ({ ...prev, car_image_url: data.url }));
      } else {
        const err = await res.json().catch(() => ({}));
        setUploadError(err.error || 'Upload failed. Make sure BLOB_READ_WRITE_TOKEN is set in Vercel.');
      }
    } catch {
      setUploadError('Upload failed. Please check your connection.');
    }
    setUploading(false);
    // Reset the file input so the same file can be selected again
    e.target.value = '';
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

  const deleteAppointment = async (id: string) => {
    if (!confirm('Delete this appointment permanently?')) return;
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    loadData();
  };

  const deleteBooking = async (slug: string) => {
    if (!confirm('Delete this booking? All related appointments will also be deleted.')) return;
    await fetch(`/api/bookings/${slug}`, { method: 'DELETE' });
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
            <p className="text-blue-200 text-sm mt-1">Appointment</p>
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
          <h1 className="text-white font-bold text-lg">Appointment</h1>
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

                {/* ===== IMAGE UPLOAD WITH PREVIEW + CHANGE BUTTON ===== */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Car Image</label>
                  {createForm.car_image_url ? (
                    <div className="relative">
                      <img
                        src={createForm.car_image_url}
                        alt="Car preview"
                        className="w-full h-48 object-cover rounded-xl border-2 border-slate-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.querySelector('.img-fallback')!.setAttribute('style', 'display:flex');
                        }}
                      />
                      <div className="img-fallback hidden w-full h-48 items-center justify-center bg-slate-100 rounded-xl border-2 border-slate-200 text-slate-400 text-sm">
                        Image could not load
                      </div>
                      {/* Change + Remove buttons */}
                      <div className="flex gap-2 mt-2">
                        <label className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold text-center cursor-pointer hover:bg-blue-100 transition flex items-center justify-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Change Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setCreateForm({ ...createForm, car_image_url: '' })}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                        {uploading ? (
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-sm text-slate-500">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-sm text-slate-500">Tap to upload car photo</span>
                            <span className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP (max 10MB)</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
                    </div>
                  )}
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

        {/* ===== APPOINTMENTS TAB (WITH IMAGE + DELETE) ===== */}
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
                    {/* Car image + client info */}
                    <div className="flex gap-3 mb-3">
                      {apt.bookings?.car_image_url && (
                        <img
                          src={apt.bookings.car_image_url}
                          alt={`${apt.bookings.car_make} ${apt.bookings.car_model}`}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800 text-base">{apt.client_name}</h3>
                            <p className="text-slate-500 text-xs">
                              {apt.bookings ? `${apt.bookings.car_make} ${apt.bookings.car_model} ${apt.bookings.car_year} - ${apt.bookings.car_price}` : 'Vehicle info unavailable'}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {apt.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
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
                        <button
                          onClick={() => deleteAppointment(apt.id)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== BOOKINGS TAB (WITH IMAGE + DELETE) ===== */}
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
                    {/* Car image + details */}
                    <div className="flex gap-3">
                      {b.car_image_url ? (
                        <img
                          src={b.car_image_url}
                          alt={`${b.car_make} ${b.car_model}`}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                          <span className="text-slate-300 text-xs">No image</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
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
                      </div>
                    </div>

                    {/* Copy link + delete */}
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
                      <button
                        onClick={() => deleteBooking(b.slug)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                      >
                        Delete
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
