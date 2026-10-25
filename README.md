# Appointment

Appointment booking system for car export clients to schedule office visits at the Accra office.

## How It Works

1. **Admin creates a booking** at `/admin` with car details (make, model, year, price, photo)
2. **Admin sends the generated link** to the client on WhatsApp
3. **Client opens the link**, sees the pre-filled car info, fills in their details and preferred appointment time
4. **Client submits** -> appointment is saved to the database AND a WhatsApp message opens for the Accra office
5. **Admin views all appointments** in the dashboard and marks them as confirmed/completed/cancelled

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL database)
- **Tailwind CSS** (styling)
- **Vercel** (hosting)

## Setup

### 1. Database (Supabase)

Run `supabase/schema.sql` in your Supabase Dashboard > SQL Editor.

This creates two tables:
- `bookings` - car details created by admin
- `appointments` - client submissions

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_secure_password
OFFICE_WHATSAPP=2335546589852
NEXT_PUBLIC_BASE_URL=https://book.jetourkits.com
```

### 3. Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/admin` to access the dashboard.

### 4. Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel Project Settings > Environment Variables
4. Deploy

### 5. Custom Subdomain

In Vercel Project Settings > Domains:
- Add `appointment.jetourkits.com`
- Add the DNS record shown by Vercel to your domain registrar
- Update `NEXT_PUBLIC_BASE_URL` to `https://appointment.jetourkits.com`

## Project Structure

```
src/
  app/
    admin/page.tsx          # Admin dashboard (login + create bookings + view appointments)
    b/[slug]/page.tsx        # Client booking page (server-side fetch)
    api/
      auth/route.ts          # Login/logout
      bookings/route.ts      # Create + list bookings
      bookings/[slug]/route.ts  # Get single booking
      appointments/route.ts  # Submit + list appointments
      appointments/[id]/route.ts  # Update status
  components/
    BookingForm.tsx          # Client-side booking form component
  lib/
    config.ts                # Config (WhatsApp number, admin password, etc.)
    supabase.ts              # Supabase client (anon key)
    supabase-admin.ts        # Supabase admin client (service role key)
supabase/
  schema.sql                 # Database schema
```

## Workflow

```
Admin Dashboard (/admin)
        |
        | Create booking with car details
        v
  Generate unique link: appointment.jetourkits.com/b/abc123
        |
        | Send link to client on WhatsApp
        v
  Client opens link (/b/abc123)
        |
        | Fills in personal info + appointment time
        v
  Submit -> Save to DB + Open WhatsApp for Accra office
        |
        v
  Admin views appointment in dashboard -> Confirm/Complete
```
