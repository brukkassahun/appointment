'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { config } from '@/lib/config';

interface Booking {
  id: string;
  slug: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_price: string;
  car_image_url: string | null;
  client_ref: string | null;
  status: string;
  created_at: string;
}

interface Appointment {
  id: string;
  booking_id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  purpose: string;
  preferred_date: string;
  preferred_time: string;
  num_visitors: string;
  payment_method: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  bookings: {
    car_make: string;
    car_model: string;
    car_year: number;
    car_price: string;
    car_image_url: string | null;
  } | null;
}

// Shared types + auth context
export type { Booking, Appointment };

export function useAuth() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/bookings', { method: 'GET' });
      setAuthed(res.ok);
    } catch {
      setAuthed(false);
    }
    setChecking(false);
  };

  const login = async (password: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setAuthed(false);
  };

  return { authed, checking, login, logout };
}

export function useData() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, aRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/appointments'),
      ]);
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData.bookings || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAppointments(aData.appointments || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { bookings, appointments, loading, loadData };
}

// Stats helper
export function getStats(bookings: Booking[], appointments: Appointment[]) {
  const pending = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const totalAppointments = appointments.length;

  // Today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.preferred_date === today).length;

  // This week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekAppointments = appointments.filter(a => {
    const d = new Date(a.preferred_date);
    return d >= weekStart && d <= weekEnd;
  }).length;

  return {
    pending, confirmed, completed, cancelled,
    activeBookings, totalAppointments,
    todayAppointments, weekAppointments,
    totalBookings: bookings.length,
  };
}
