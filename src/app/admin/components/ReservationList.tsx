'use client';

import { useState } from 'react';
import { Reservation } from '@/lib/supabase/types';
import { useI18n } from '@/lib/i18n/context';

interface ReservationListProps {
  reservations: Reservation[];
  onRefresh: () => void;
  isArchiveView?: boolean;
}

export default function ReservationList({
  reservations,
  onRefresh,
  isArchiveView = false,
}: ReservationListProps) {
  const { t } = useI18n();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(reservations.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleExportCsv = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(',');
    window.open(`/api/reservations/export?ids=${ids}`, '_blank');
  };

  const handleArchive = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(isArchiveView ? t('admin.confirmUnarchive') : t('admin.confirmArchive'))) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          is_archived: !isArchiveView,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reservations');
      }

      setSelectedIds(new Set());
      onRefresh();
    } catch (error) {
      alert(t('common.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs font-medium text-text-secondary bg-surface-secondary px-2 py-1 rounded">
                {selectedIds.size} {t('admin.selected')}
              </span>
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
                disabled={isProcessing}
              >
                {t('admin.exportSelected')}
              </button>
              <button
                onClick={handleArchive}
                className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
                disabled={isProcessing}
              >
                {isArchiveView ? t('admin.unarchiveSelected') : t('admin.archiveSelected')}
              </button>
            </>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
          disabled={isProcessing}
        >
          {t('admin.refresh')}
        </button>
      </div>

      {reservations.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">
          {t('admin.noReservations')}
        </p>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 w-8">
                  <input
                    type="checkbox"
                    className="rounded border-border text-foreground focus:ring-foreground/20"
                    onChange={handleSelectAll}
                    checked={
                      reservations.length > 0 &&
                      selectedIds.size === reservations.length
                    }
                  />
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">
                  {t('admin.guestCol')}
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">
                  {t('admin.occupationCol')}
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">
                  {t('admin.secretCodeCol')}
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">
                  {t('admin.statusCol')}
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">
                  {t('admin.dateCol')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  className={`hover:bg-surface-secondary/50 ${
                    selectedIds.has(r.id) ? 'bg-surface-secondary/30' : ''
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      className="rounded border-border text-foreground focus:ring-foreground/20"
                      checked={selectedIds.has(r.id)}
                      onChange={() => handleSelect(r.id)}
                    />
                  </td>
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
