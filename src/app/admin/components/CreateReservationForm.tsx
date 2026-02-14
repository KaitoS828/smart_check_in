'use client';

import { useState } from 'react';
import { Reservation } from '@/lib/supabase/types';

interface CreateReservationFormProps {
  onReservationCreated: (reservation: Reservation) => void;
}

export default function CreateReservationForm({
  onReservationCreated,
}: CreateReservationFormProps) {
  const [doorPin, setDoorPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShowSuccess(false);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ door_pin: doorPin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create reservation');
      }

      setCreatedReservation(data.reservation);
      setShowSuccess(true);
      setDoorPin('');
      onReservationCreated(data.reservation);

      // Auto-hide success message after 10 seconds
      setTimeout(() => setShowSuccess(false), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const registrationUrl = createdReservation
    ? `${window.location.origin}/register/${createdReservation.id}`
    : '';

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="door_pin"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            スマートロック Door PIN
          </label>
          <input
            type="text"
            id="door_pin"
            value={doorPin}
            onChange={(e) => setDoorPin(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white px-4 py-2"
            placeholder="例: 1234"
            required
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            チェックイン後にゲストに提示される解錠用PINコードです
          </p>
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
          {isLoading ? '作成中...' : '新規予約を作成'}
        </button>
      </form>

      {showSuccess && createdReservation && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-6 border-2 border-green-500">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
            ✓ 予約が作成されました
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                事前登録URL（ゲストに送付）:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={registrationUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(registrationUrl)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  コピー
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secret Code（ゲストに送付）:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={createdReservation.secret_code}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xl font-bold font-mono text-blue-600 dark:text-blue-400"
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(createdReservation.secret_code)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  コピー
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>重要:</strong> Secret Codeは当日のチェックインで必要です。
                URLと一緒にゲストに送付してください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
