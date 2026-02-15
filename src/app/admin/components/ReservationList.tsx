'use client';

import { Reservation } from '@/lib/supabase/types';
import { useI18n } from '@/lib/i18n/context';

interface ReservationListProps {
  reservations: Reservation[];
  onRefresh: () => void;
}

export default function ReservationList({
  reservations,
  onRefresh,
}: ReservationListProps) {
  const { t } = useI18n();

  const handleExportCsv = () => {
    window.open('/api/reservations/export', '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
        >
          {t('admin.refresh')}
        </button>
        <button
          onClick={handleExportCsv}
          className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
        >
          {t('admin.csvExport')}
        </button>
      </div>

      {reservations.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">
          {t('admin.noReservations')}
        </p>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">{t('admin.guestCol')}</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">{t('admin.occupationCol')}</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">{t('admin.secretCodeCol')}</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">{t('admin.statusCol')}</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">{t('admin.dateCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-surface-secondary/50">
                  <td className="px-3 py-2.5">
                    <div>
                      <p className="font-medium text-foreground">
                        {r.guest_name || t('admin.unregistered')}
                      </p>
                      {r.is_foreign_national && r.nationality && (
                        <p className="text-xs text-text-muted">{r.nationality}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary">
                    {r.guest_occupation || '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <code className="text-xs font-mono bg-surface-secondary px-1.5 py-0.5 rounded">
                      {r.secret_code}
                    </code>
                  </td>
                  <td className="px-3 py-2.5">
                    {r.is_checked_in ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        {t('admin.checkedIn')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-secondary text-text-muted">
                        {t('admin.notCheckedIn')}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary text-xs">
                    {new Date(r.created_at).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
