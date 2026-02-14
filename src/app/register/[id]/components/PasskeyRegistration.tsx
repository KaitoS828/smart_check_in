'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Reservation } from '@/lib/supabase/types';

interface PasskeyRegistrationProps {
  reservation: Reservation;
  onPasskeyRegistered: () => void;
}

export default function PasskeyRegistration({
  reservation,
  onPasskeyRegistered,
}: PasskeyRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegisterPasskey = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Check if browser supports WebAuthn
      if (!window.PublicKeyCredential) {
        throw new Error(
          'このブラウザはWebAuthn（生体認証）に対応していません。Chrome、Safari、Firefoxの最新版をご利用ください。'
        );
      }

      // Step 1: Get registration options from server
      const optionsResponse = await fetch(
        '/api/webauthn/register/generate-options',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservationId: reservation.id }),
        }
      );

      const optionsData = await optionsResponse.json();

      if (!optionsResponse.ok) {
        throw new Error(optionsData.error || 'Failed to get registration options');
      }

      const { options, challengeId } = optionsData;

      // Step 2: Start WebAuthn registration (browser prompts for biometric)
      let credential;
      try {
        credential = await startRegistration(options);
      } catch (regError) {
        if (
          regError instanceof Error &&
          regError.name === 'NotAllowedError'
        ) {
          throw new Error('生体認証がキャンセルされました。もう一度お試しください。');
        }
        throw new Error('生体認証に失敗しました。デバイスの設定をご確認ください。');
      }

      // Step 3: Verify registration with server
      const verifyResponse = await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          reservationId: reservation.id,
          credential,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Failed to verify registration');
      }

      setIsRegistered(true);
      onPasskeyRegistered();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        生体認証デバイス登録
      </h2>

      <div className="mb-6 space-y-3">
        <p className="text-gray-600 dark:text-gray-400">
          チェックイン時に使用する生体認証（パスキー）を登録します。
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            対応デバイス:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• iPhone/iPad: Face ID または Touch ID</li>
            <li>• Mac: Touch ID</li>
            <li>• Windows: Windows Hello（顔認証・指紋認証）</li>
            <li>• Android: 指紋認証または顔認証</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {isRegistered ? (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-6 border-2 border-green-500">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
            ✓ デバイス登録が完了しました
          </h3>
          <p className="text-green-700 dark:text-green-400 mb-4">
            チェックイン当日は、このデバイスで生体認証を行ってください。
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-lg p-4 mt-4">
            <h4 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">
              Secret Code: {reservation.secret_code}
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              <strong>重要:</strong>{' '}
              このSecret Codeは当日のチェックインで必要です。
              スクリーンショットを保存するか、メモしておいてください。
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleRegisterPasskey}
          disabled={isLoading}
          className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              生体認証を待機中...
            </>
          ) : (
            '🔐 デバイスを登録（生体認証）'
          )}
        </button>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          ※
          生体認証を登録すると、チェックイン時にこのデバイスでのみ解錠PINを取得できます。
        </p>
      </div>
    </div>
  );
}
