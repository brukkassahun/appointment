'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';
import { Upload, Check, Copy, Car, X } from 'lucide-react';

export default function CreateBookingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    car_make: '', car_model: '', car_year: '',
    car_price: '', car_image_url: '', client_ref: '',
  });
  const [createdUrl, setCreatedUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prefix', 'appointments');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, car_image_url: data.url }));
      } else {
        const err = await res.json().catch(() => ({}));
        setUploadError(err.error || 'Upload failed. Check BLOB_READ_WRITE_TOKEN in Vercel.');
      }
    } catch {
      setUploadError('Upload failed. Check your connection.');
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreatedUrl('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, car_year: parseInt(form.car_year) }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedUrl(data.url);
        setForm({ car_make: '', car_model: '', car_year: '', car_price: '', car_image_url: '', client_ref: '' });
      }
    } catch {}
    setCreating(false);
  };

  const copyUrl = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div>
        <p className="eyebrow">Create</p>
        <h1 className="display-md mt-3 text-ink">New Booking</h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
          Fill in the confirmed car details. A unique link will be generated for your client to book their office visit.
        </p>
      </div>

      {/* Success banner */}
      {createdUrl && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Check className="h-5 w-5 text-accent" strokeWidth={2} />
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-ink">Booking link created!</p>
              <p className="text-xs text-muted">Send this link to your client on WhatsApp.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text" readOnly value={createdUrl}
              className="flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 font-sans text-xs text-ink"
            />
            <button onClick={() => copyUrl(createdUrl)} className="btn-accent">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card-coda max-w-2xl space-y-6 p-6 sm:p-8">
        {/* Car Details */}
        <div>
          <h2 className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
            Vehicle Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-sans text-sm font-semibold text-ink">Make *</label>
              <input type="text" required value={form.car_make}
                onChange={e => setForm({...form, car_make: e.target.value})}
                placeholder="e.g. Toyota" className="input-coda" />
            </div>
            <div>
              <label className="mb-2 block font-sans text-sm font-semibold text-ink">Model *</label>
              <input type="text" required value={form.car_model}
                onChange={e => setForm({...form, car_model: e.target.value})}
                placeholder="e.g. RAV4" className="input-coda" />
            </div>
            <div>
              <label className="mb-2 block font-sans text-sm font-semibold text-ink">Year *</label>
              <input type="number" required min="1990" max="2026" value={form.car_year}
                onChange={e => setForm({...form, car_year: e.target.value})}
                placeholder="e.g. 2023" className="input-coda" />
            </div>
            <div>
              <label className="mb-2 block font-sans text-sm font-semibold text-ink">Agreed Price *</label>
              <input type="text" required value={form.car_price}
                onChange={e => setForm({...form, car_price: e.target.value})}
                placeholder="e.g. $12,500" className="input-coda" />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <h2 className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
            Car Image
          </h2>
          {form.car_image_url ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-line">
                <img src={form.car_image_url} alt="Car" className="h-56 w-full object-cover" />
                <button type="button" onClick={() => setForm({...form, car_image_url: ''})}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80">
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <div className="flex gap-2">
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.14em] text-ink transition hover:border-ink">
                  <Upload className="h-4 w-4" strokeWidth={1.5} /> Change Photo
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>
                <button type="button" onClick={() => setForm({...form, car_image_url: ''})}
                  className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.14em] text-danger transition hover:bg-danger/10">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-card transition hover:border-ink/30">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-ink" />
                  <span className="mt-2 text-sm text-muted">Uploading...</span>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-faint" strokeWidth={1} />
                  <span className="font-sans text-sm font-semibold text-ink">Tap to upload car photo</span>
                  <span className="mt-1 text-xs text-faint">JPG, PNG, WebP (max 10MB)</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
          )}
          {uploadError && <p className="mt-2 text-xs text-danger">{uploadError}</p>}
        </div>

        {/* Client Reference */}
        <div>
          <h2 className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
            Internal Reference
          </h2>
          <input type="text" value={form.client_ref}
            onChange={e => setForm({...form, client_ref: e.target.value})}
            placeholder="e.g. Kwame - WhatsApp discussion Oct 24"
            className="input-coda" />
          <p className="mt-2 text-xs text-faint">Internal note to remember which client this is for.</p>
        </div>

        {/* Submit */}
        <button type="submit" disabled={creating}
          className="btn-primary w-full justify-center py-4">
          {creating ? 'Creating...' : 'Generate Booking Link'}
        </button>
      </form>
    </div>
  );
}
