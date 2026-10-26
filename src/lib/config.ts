export const config = {
  // Accra office WhatsApp (international format, no +)
  officeWhatsApp: process.env.OFFICE_WHATSAPP || '233535198356',
  officeName: 'MUSTDONE AUTO GHANA',
  officeAddress: 'Accra, Ghana',
  officeMapsUrl: 'https://maps.app.goo.gl/6nqhCcgoFV96NvHi9?g_st=iwb',
  officeHours: 'Monday - Saturday, 9:00 AM - 5:00 PM',
  officeAgent: 'Michael Benguy',
  officeAgentRole: 'Accountant — Shipping / Clearing / Tema Port Handling',
  officePhoneDisplay: '+233 53 519 8356',
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
