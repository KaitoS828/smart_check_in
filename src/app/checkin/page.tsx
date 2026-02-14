'use client';

import { useState } from 'react';
import BiometricAuth from './components/BiometricAuth';
import SecretCodeInput from './components/SecretCodeInput';

type CheckinStep = 'biometric' | 'secret_code' | 'complete';

export default function CheckinPage() {
  const [currentStep, setCurrentStep] = useState<CheckinStep>('biometric');
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [doorPin, setDoorPin] = useState<string | null>(null);

  const handleBiometricSuccess = (id: string) => {
    setReservationId(id);
    setCurrentStep('secret_code');
  };

  const handleCheckinSuccess = (pin: string) => {
    setDoorPin(pin);
    setCurrentStep('complete');
  };

  const handleStartOver = () => {
    setCurrentStep('biometric');
    setReservationId(null);
    setDoorPin(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            セルフチェックイン
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            生体認証とSecret Codeでチェックインしてください
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
                  currentStep !== 'biometric'
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {currentStep !== 'biometric' ? '✓' : '1'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                生体認証
              </span>
            </div>

            <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep === 'complete'
                    ? 'bg-green-500 text-white'
                    : currentStep === 'secret_code'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {currentStep === 'complete' ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                Secret Code
              </span>
            </div>

            <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep === 'complete'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {currentStep === 'complete' ? '✓' : '3'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                完了
              </span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 'biometric' && (
            <BiometricAuth onAuthSuccess={handleBiometricSuccess} />
          )}

          {currentStep === 'secret_code' && reservationId && (
            <SecretCodeInput
              reservationId={reservationId}
              onCheckinSuccess={handleCheckinSuccess}
            />
          )}

          {currentStep === 'complete' && doorPin && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
              <div className="text-center">
                <div className="text-green-600 text-6xl mb-6">✓</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  チェックイン完了
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  以下のPINコードでドアを解錠してください
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-4 border-blue-500 rounded-lg p-8 mb-8">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    ドア解錠PIN
                  </p>
                  <p className="text-6xl font-bold font-mono text-blue-600 dark:text-blue-400 tracking-wider">
                    {doorPin}
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-4 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>重要:</strong>{' '}
                    このPINコードをスマートロックに入力してドアを解錠してください。
                    <br />
                    PINコードは再度表示されませんので、スクリーンショットを保存することをお勧めします。
                  </p>
                </div>

                <button
                  onClick={handleStartOver}
                  className="mt-4 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  最初に戻る
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              お困りの場合
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>
                • 生体認証に失敗する場合は、事前登録したデバイスを使用しているか確認してください
              </li>
              <li>
                • Secret
                Codeが見つからない場合は、事前登録時のメールまたはスクリーンショットをご確認ください
              </li>
              <li>• Secret Codeは大文字・小文字を区別しません</li>
              <li>
                • それでも解決しない場合は、施設の緊急連絡先にお問い合わせください
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
