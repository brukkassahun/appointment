'use client';

import { config } from '@/lib/config';
import { Phone, MessageCircle, MapPin, Clock, Building } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="eyebrow">Configuration</p>
        <h1 className="display-md mt-3 text-ink">Settings</h1>
      </div>

      {/* Office Info */}
      <div className="card-coda max-w-2xl p-6 sm:p-8">
        <h2 className="mb-1 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
          Office Information
        </h2>
        <p className="mb-6 text-sm text-muted">This information appears on the client booking page.</p>

        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card flex-shrink-0">
              <Building className="h-5 w-5 text-ink" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-ink">{config.officeName}</p>
              <p className="text-sm text-muted">Accra, Ghana</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card flex-shrink-0">
              <MapPin className="h-5 w-5 text-ink" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-ink">Address</p>
              <p className="text-sm text-muted">{config.officeAddress}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card flex-shrink-0">
              <Clock className="h-5 w-5 text-ink" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-ink">Office Hours</p>
              <p className="text-sm text-muted">{config.officeHours}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-ink" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-ink">WhatsApp (Confirmation)</p>
              <p className="text-sm text-muted">+{config.officeWhatsApp}</p>
              <p className="mt-1 text-xs text-faint">Appointment confirmations are sent to this number.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Password Info */}
      <div className="card-coda max-w-2xl p-6 sm:p-8">
        <h2 className="mb-1 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
          Admin Access
        </h2>
        <p className="mb-6 text-sm text-muted">Your admin password is set as an environment variable in Vercel.</p>
        <div className="rounded-xl border border-line bg-card p-4">
          <p className="text-sm text-muted">
            To change your admin password, update the <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs text-ink">ADMIN_PASSWORD</code> environment variable in your Vercel project settings, then redeploy.
          </p>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="card-coda max-w-2xl p-6 sm:p-8">
        <h2 className="mb-1 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
          Environment Variables
        </h2>
        <p className="mb-6 text-sm text-muted">All configuration is managed via Vercel environment variables.</p>
        <div className="space-y-2">
          {[
            { name: 'NEXT_PUBLIC_SUPABASE_URL', desc: 'Supabase project URL' },
            { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', desc: 'Supabase anon key (public)' },
            { name: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Supabase service role key (secret)' },
            { name: 'ADMIN_PASSWORD', desc: 'Admin login password' },
            { name: 'OFFICE_WHATSAPP', desc: 'WhatsApp number for appointment confirmations' },
            { name: 'NEXT_PUBLIC_BASE_URL', desc: 'Base URL for booking links' },
            { name: 'BLOB_READ_WRITE_TOKEN', desc: 'Vercel Blob token for image uploads' },
          ].map(v => (
            <div key={v.name} className="flex flex-col gap-1 border-b border-line py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <code className="font-mono text-xs font-medium text-ink">{v.name}</code>
              <span className="text-xs text-muted">{v.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
