import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET: Get a single booking by slug (public - for client booking form)
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

  if (data.status !== 'active') {
    return NextResponse.json({ error: 'This booking link is no longer active' }, { status: 410 });
  }

  return NextResponse.json({ booking: data });
}

// DELETE: Delete a booking by slug (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = request.cookies.get('admin_session');
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from('bookings')
    .delete()
    .eq('slug', params.slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
