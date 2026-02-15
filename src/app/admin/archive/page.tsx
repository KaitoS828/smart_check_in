'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Reservation } from '@/lib/supabase/types';
import ReservationList from '../components/ReservationList';
import { useI18n } from '@/lib/i18n/context';

export default function ArchivePage() {
  const { t, toggleLocale } = useI18n();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReservations = async () => {
    try {
      // Fetch archived reservations
      const response = await fetch('/api/reservations?archived=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reservations');
      }

      setReservations(data.reservations);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          {t('common.appName')}
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLocale}
            className="text-xs font-medium px-2.5 py-1 border border-border rounded-md text-text-secondary hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            {t('lang.toggle')}
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-medium px-2.5 py-1 border border-border rounded-md text-text-secondary hover:text-danger hover:border-danger/30 transition-colors"
          >
            {t('admin.logout')}
          </button>
          <span className="text-xs font-medium text-text-muted uppercase tracking-widest">
            {t('common.admin')}
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('admin.archive')}
          </h1>
          <Link
            href="/admin"
            className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
          >
            ← {t('admin.backToDashboard')}
          </Link>
        </div>
        <p className="text-text-secondary mb-10">
          {t('admin.viewArchive')}
        </p>

        <div className="border border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              {t('admin.listTitle')}
            </h2>
            <button
              onClick={fetchReservations}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-surface-secondary transition-colors"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('admin.refresh')}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-danger/5 border border-danger/20 p-4">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
              <p className="mt-3 text-sm text-text-secondary">{t('common.loading')}</p>
            </div>
          ) : (
            <ReservationList
              reservations={reservations}
              onRefresh={fetchReservations}
              isArchiveView={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
