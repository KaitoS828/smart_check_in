'use client';

import { useState, useEffect, use } from 'react';
import { Reservation } from '@/lib/supabase/types';
import GuestInfoForm from './components/GuestInfoForm';
import PasskeyRegistration from './components/PasskeyRegistration';

export default function RegisterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [guestInfoSubmitted, setGuestInfoSubmitted] = useState(false);
  const [passkeyRegistered, setPasskeyRegistered] = useState(false);

  useEffect(() => {
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReservation = async () => {
    try {
      const response = await fetch(`/api/reservations/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reservation');
      }

      setReservation(data.reservation);
      setGuestInfoSubmitted(Boolean(data.reservation.guest_name));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestInfoSubmitted = (updatedReservation: Reservation) => {
    setReservation(updatedReservation);
    setGuestInfoSubmitted(true);
  };

  const handlePasskeyRegistered = () => {
    setPasskeyRegistered(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">読込中...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              予約が見つかりません
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error || '指定された予約IDが存在しません。URLをご確認ください。'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            事前登録
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            宿泊者情報とデバイス登録を完了してください
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  guestInfoSubmitted
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {guestInfoSubmitted ? '✓' : '1'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                宿泊者情報
              </span>
            </div>

            <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  passkeyRegistered
                    ? 'bg-green-500 text-white'
                    : guestInfoSubmitted
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {passkeyRegistered ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                デバイス登録
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1: Guest Info Form */}
          <GuestInfoForm
            reservation={reservation}
            onGuestInfoSubmitted={handleGuestInfoSubmitted}
          />

          {/* Step 2: Passkey Registration (only shown after guest info is submitted) */}
          {guestInfoSubmitted && (
            <PasskeyRegistration
              reservation={reservation}
              onPasskeyRegistered={handlePasskeyRegistered}
            />
          )}

          {/* Completion Message */}
          {passkeyRegistered && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="text-center">
                <div className="text-green-600 text-6xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  登録完了
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  事前登録がすべて完了しました。
                  <br />
                  チェックイン当日は、登録したデバイスとSecret
                  Codeをご準備ください。
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    <strong>チェックイン方法:</strong>
                    <br />
                    1. QRコードをスキャンしてチェックイン画面を表示
                    <br />
                    2. 生体認証でデバイス確認
                    <br />
                    3. Secret Codeを入力
                    <br />
                    4. 解錠PINが表示されます
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
