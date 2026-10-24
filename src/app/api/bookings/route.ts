import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { config, generateSlug } from '@/lib/config';

// GET: List all bookings (admin only)
export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session');
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

// POST: Create a new booking
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Generate unique slug
  let slug = generateSlug(8);
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabaseAdmin
      .from('bookings')
      .select('slug')
      .eq('slug', slug)
      .single();
    if (!existing) break;
    slug = generateSlug(8);
    attempts++;
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .insert({
      slug,
      car_make: body.car_make,
      car_model: body.car_model,
      car_year: body.car_year,
      car_price: body.car_price,
      car_image_url: body.car_image_url || null,
      client_ref: body.client_ref || null,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookingUrl = `${config.baseUrl}/b/${slug}`;
  return NextResponse.json({ booking: data, url: bookingUrl });
}
