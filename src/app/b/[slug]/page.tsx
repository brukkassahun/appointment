import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { config } from '@/lib/config';
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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const booking = await getBooking(params.slug);
  if (!booking) {
    return {
      title: 'Appointment Not Found',
      description: 'This appointment link is no longer valid.',
    };
  }

  const carName = `${booking.car_make} ${booking.car_model} ${booking.car_year}`;
  const price = booking.car_price?.startsWith('$')
    ? booking.car_price
    : `$${booking.car_price}`;
  const title = `Your ${carName} Is Ready`;
  const description = `Complete your payment and we will ship your ${carName} from China to Ghana. Price: ${price}. Book your office appointment now.`;
  const bookingUrl = `${config.baseUrl}/b/${params.slug}`;
  const carImage = booking.car_image_url || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: bookingUrl,
    },
    openGraph: {
      type: 'website',
      siteName: 'MUSTDONE AUTO',
      title,
      description,
      url: bookingUrl,
      images: carImage
        ? [
            {
              url: carImage,
              width: 1200,
              height: 630,
              alt: `${carName} — Ready to Ship`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: carImage ? [carImage] : undefined,
    },
  };
}
