'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

interface BiometricAuthProps {
  onAuthSuccess: (reservationId: string) => void;
}

export default function BiometricAuth({ onAuthSuccess }: BiometricAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthenticate = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Check if browser supports WebAuthn
      if (!window.PublicKeyCredential) {
        throw new Error(
          'このブラウザはWebAuthn（生体認証）に対応していません。Chrome、Safari、Firefoxの最新版をご利用ください。'
        );
      }

      // Step 1: Get authentication options from server
      const optionsResponse = await fetch(
        '/api/webauthn/authenticate/generate-options',
        {
          method: 'POST',
        }
      );

      const optionsData = await optionsResponse.json();

      if (!optionsResponse.ok) {
        throw new Error(
          optionsData.error || 'Failed to get authentication options'
        );
      }

      const { options, challengeId } = optionsData;

      // Step 2: Start WebAuthn authentication (browser prompts for biometric)
      let credential;
      try {
        credential = await startAuthentication(options);
      } catch (authError) {
        if (
          authError instanceof Error &&
          authError.name === 'NotAllowedError'
        ) {
          throw new Error('生体認証がキャンセルされました。もう一度お試しください。');
        }
        throw new Error(
          '生体認証に失敗しました。登録したデバイスで認証を行ってください。'
        );
      }

      // Step 3: Verify authentication with server
      const verifyResponse = await fetch(
        '/api/webauthn/authenticate/verify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId,
            credential,
          }),
        }
      );

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Authentication verification failed');
      }

      // Authentication successful - pass reservation ID to parent
      onAuthSuccess(verifyData.reservationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        生体認証
      </h2>

      <div className="mb-6 space-y-3">
        <p className="text-gray-600 dark:text-gray-400">
          事前登録したデバイスで生体認証を行ってください。
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <ul className="text-sm text-blue-900 dark:text-blue-300 space-y-1">
            <li>• 登録したデバイスを使用してください</li>
            <li>• Touch ID / Face ID / Windows Hello で認証します</li>
            <li>• 認証後、Secret Codeの入力が必要です</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <button
        onClick={handleAuthenticate}
        disabled={isLoading}
        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          '🔐 チェックインを開始'
        )}
      </button>
    </div>
  );
}
