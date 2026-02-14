'use client';

import { useState, useEffect } from 'react';
import { Reservation } from '@/lib/supabase/types';
import ReservationList from './components/ReservationList';
import CreateReservationForm from './components/CreateReservationForm';

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reservations');
      }

      setReservations(data.reservations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleReservationCreated = (newReservation: Reservation) => {
    setReservations((prev) => [newReservation, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            予約管理と新規予約作成
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Reservation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                新規予約作成
              </h2>
              <CreateReservationForm
                onReservationCreated={handleReservationCreated}
              />
            </div>
          </div>

          {/* Reservations List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  予約一覧
                </h2>
                <button
                  onClick={fetchReservations}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? '読込中...' : '更新'}
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">読込中...</p>
                </div>
              ) : (
                <ReservationList reservations={reservations} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
