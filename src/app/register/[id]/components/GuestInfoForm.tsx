'use client';

import { useState } from 'react';
import { Reservation } from '@/lib/supabase/types';

interface GuestInfoFormProps {
  reservation: Reservation;
  onGuestInfoSubmitted: (updatedReservation: Reservation) => void;
}

export default function GuestInfoForm({
  reservation,
  onGuestInfoSubmitted,
}: GuestInfoFormProps) {
  const [guestName, setGuestName] = useState(reservation.guest_name || '');
  const [guestAddress, setGuestAddress] = useState(reservation.guest_address || '');
  const [guestContact, setGuestContact] = useState(reservation.guest_contact || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isAlreadySubmitted = Boolean(reservation.guest_name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: guestName,
          guest_address: guestAddress,
          guest_contact: guestContact,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update guest information');
      }

      onGuestInfoSubmitted(data.reservation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        宿泊者名簿
      </h2>

      {isAlreadySubmitted && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <p className="text-sm text-green-800 dark:text-green-300">
            ✓ 宿泊者情報は既に登録されています
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="guest_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="guest_name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
            placeholder="山田 太郎"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="guest_address"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            ご住所 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="guest_address"
            value={guestAddress}
            onChange={(e) => setGuestAddress(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
            placeholder="東京都渋谷区..."
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="guest_contact"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            連絡先（電話番号） <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="guest_contact"
            value={guestContact}
            onChange={(e) => setGuestContact(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
            placeholder="090-1234-5678"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '送信中...' : isAlreadySubmitted ? '情報を更新' : '宿泊者情報を送信'}
        </button>
      </form>
    </div>
  );
}
