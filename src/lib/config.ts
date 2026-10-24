export const config = {
  // Accra office WhatsApp (international format, no +)
  officeWhatsApp: process.env.OFFICE_WHATSAPP || '2335546589852',
  officeName: 'Accra Office',
  officeAddress: 'Adenta-Accra, Ghana',
  officeHours: 'Monday - Saturday, 9:00 AM - 5:00 PM',
  // Admin password (set in Vercel env vars)
  adminPassword: process.env.ADMIN_PASSWORD || 'jetour2026',
  // Base URL for booking links
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
};

export function generateSlug(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
