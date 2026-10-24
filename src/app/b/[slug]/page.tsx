import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import BookingForm from '@/components/BookingForm';

export const dynamic = 'force-dynamic';

async function getBooking(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  if (data.status !== 'active') return null;
  return data;
}

export default async function BookingPage({
  params,
}: {
  params: { slug: string };
}) {
  const booking = await getBooking(params.slug);
  if (!booking) notFound();

  return <BookingForm booking={booking} />;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const booking = await getBooking(params.slug);
  if (!booking) return { title: 'Booking Not Found' };
  return {
    title: `Book Visit - ${booking.car_make} ${booking.car_model} ${booking.car_year}`,
  };
}
