'use client';

import { useState } from 'react';

interface SecretCodeInputProps {
  reservationId: string;
  onCheckinSuccess: (doorPin: string) => void;
}

export default function SecretCodeInput({
  reservationId,
  onCheckinSuccess,
}: SecretCodeInputProps) {
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/reservations/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          secretCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if already checked in
        if (data.alreadyCheckedIn && data.doorPin) {
          onCheckinSuccess(data.doorPin);
          return;
        }
        throw new Error(data.error || 'Failed to complete check-in');
      }

      // Check-in successful
      onCheckinSuccess(data.doorPin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatSecretCode = (value: string) => {
    // Remove non-alphanumeric characters
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Add dashes every 3 characters (XXX-XXX-XXX)
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 3) {
      parts.push(cleaned.slice(i, i + 3));
    }

    return parts.join('-').slice(0, 11); // Max length: XXX-XXX-XXX
  };

  const handleSecretCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecretCode(formatSecretCode(e.target.value));
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Secret Code入力
      </h2>

      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          事前登録時に発行されたSecret Codeを入力してください。
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
          <p className="text-sm text-green-800 dark:text-green-300">
            ✓ 生体認証が完了しました
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="secret_code"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Secret Code
          </label>
          <input
            type="text"
            id="secret_code"
            value={secretCode}
            onChange={handleSecretCodeChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-3 text-2xl font-bold font-mono text-center tracking-wider"
            placeholder="XXX-XXX-XXX"
            required
            disabled={isLoading}
            maxLength={11}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            フォーマット: XXX-XXX-XXX（英数字）
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || secretCode.length < 11}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'チェックイン処理中...' : 'チェックインを完了'}
        </button>
      </form>
    </div>
  );
}
