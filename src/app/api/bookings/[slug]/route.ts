import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Don't show expired or cancelled bookings
  if (data.status !== 'active') {
    return NextResponse.json({ error: 'This booking link is no longer active' }, { status: 410 });
  }

  return NextResponse.json({ booking: data });
}
