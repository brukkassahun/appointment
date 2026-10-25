import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET: List all appointments (admin only)
export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session');
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      *,
      bookings (
        car_make,
        car_model,
        car_year,
        car_price,
        car_image_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointments: data });
}

// POST: Submit a new appointment (public)
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .insert({
      booking_id: body.booking_id,
      client_name: body.client_name,
      client_phone: body.client_phone,
      client_email: body.client_email || null,
      purpose: body.purpose,
      preferred_date: body.preferred_date,
      preferred_time: body.preferred_time,
      num_visitors: body.num_visitors || '1',
      payment_method: body.payment_method || null,
      notes: body.notes || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointment: data });
}
