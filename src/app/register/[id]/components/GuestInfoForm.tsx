'use client';

import { useState } from 'react';
import { Reservation } from '@/lib/supabase/types';
import { useI18n } from '@/lib/i18n/context';

interface GuestInfoFormProps {
  reservation: Reservation;
  onGuestInfoSubmitted: (updatedReservation: Reservation) => void;
}

export default function GuestInfoForm({
  reservation,
  onGuestInfoSubmitted,
}: GuestInfoFormProps) {
  const { t } = useI18n();
  const [guestName, setGuestName] = useState(reservation.guest_name || '');
  const [guestNameKana, setGuestNameKana] = useState(reservation.guest_name_kana || '');
  const [guestAddress, setGuestAddress] = useState(reservation.guest_address || '');
  const [guestContact, setGuestContact] = useState(reservation.guest_contact || '');
  const [guestOccupation, setGuestOccupation] = useState(reservation.guest_occupation || '');
  const [isForeignNational, setIsForeignNational] = useState(reservation.is_foreign_national || false);
  const [nationality, setNationality] = useState(reservation.nationality || '');
  const [passportNumber, setPassportNumber] = useState(reservation.passport_number || '');
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(reservation.passport_image_url || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isAlreadySubmitted = Boolean(reservation.guest_name);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPassportFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isForeignNational) {
        if (!nationality) {
          throw new Error(t('guest.nationality'));
        }
        if (!passportNumber) {
          throw new Error(t('guest.passportNumber'));
        }
      }

      if (isForeignNational && passportFile) {
        const formData = new FormData();
        formData.append('file', passportFile);
        formData.append('reservationId', reservation.id);

        const uploadResponse = await fetch('/api/upload/passport', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          throw new Error(uploadData.error || 'Upload failed');
        }
      }

      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: guestName,
          guest_name_kana: guestNameKana,
          guest_address: guestAddress,
          guest_contact: guestContact,
          guest_occupation: guestOccupation,
          is_foreign_national: isForeignNational,
          nationality: isForeignNational ? nationality : undefined,
          passport_number: isForeignNational ? passportNumber : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update guest information');
      }

      onGuestInfoSubmitted(data.reservation);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'block w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">{t('guest.title')}</h2>
        <p className="text-sm text-text-secondary">{t('guest.subtitle')}</p>
      </div>

      {isAlreadySubmitted && (
        <div className="bg-success/5 border border-success/20 rounded-lg p-3">
          <p className="text-sm text-success font-medium">{t('guest.alreadyRegistered')}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border border-border rounded-lg p-4 space-y-4">
          <p className="text-sm font-semibold text-foreground">{t('guest.basicInfo')}</p>

          <div>
            <label htmlFor="guest_name" className="block text-sm font-medium text-foreground mb-1.5">
              {t('guest.name')} <span className="text-danger">*</span>
            </label>
            <input type="text" id="guest_name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputClass} placeholder={t('guest.namePlaceholder')} required disabled={isLoading} />
          </div>

          <div>
            <label htmlFor="guest_name_kana" className="block text-sm font-medium text-foreground mb-1.5">
              {t('guest.nameKana')} <span className="text-danger">*</span>
            </label>
            <input type="text" id="guest_name_kana" value={guestNameKana} onChange={(e) => setGuestNameKana(e.target.value)} className={inputClass} placeholder={t('guest.nameKanaPlaceholder')} required disabled={isLoading} />
          </div>

          <div>
            <label htmlFor="guest_address" className="block text-sm font-medium text-foreground mb-1.5">
              {t('guest.address')} <span className="text-danger">*</span>
            </label>
            <input type="text" id="guest_address" value={guestAddress} onChange={(e) => setGuestAddress(e.target.value)} className={inputClass} placeholder={t('guest.addressPlaceholder')} required disabled={isLoading} />
          </div>

          <div>
            <label htmlFor="guest_occupation" className="block text-sm font-medium text-foreground mb-1.5">
              {t('guest.occupation')} <span className="text-danger">*</span>
            </label>
            <input type="text" id="guest_occupation" value={guestOccupation} onChange={(e) => setGuestOccupation(e.target.value)} className={inputClass} placeholder={t('guest.occupationPlaceholder')} required disabled={isLoading} />
          </div>

          <div>
            <label htmlFor="guest_contact" className="block text-sm font-medium text-foreground mb-1.5">
              {t('guest.contact')} <span className="text-danger">*</span>
            </label>
            <input type="tel" id="guest_contact" value={guestContact} onChange={(e) => setGuestContact(e.target.value)} className={inputClass} placeholder={t('guest.contactPlaceholder')} required disabled={isLoading} />
          </div>
        </div>

        <div className="border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_foreign" checked={isForeignNational} onChange={(e) => setIsForeignNational(e.target.checked)} className="w-4 h-4 rounded border-border" disabled={isLoading} />
            <label htmlFor="is_foreign" className="text-sm font-semibold text-foreground">
              {t('guest.foreignNational')}
            </label>
          </div>

          {isForeignNational && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-foreground mb-1.5">
                  {t('guest.nationality')} <span className="text-danger">*</span>
                </label>
                <input type="text" id="nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputClass} placeholder={t('guest.nationalityPlaceholder')} disabled={isLoading} />
              </div>

              <div>
                <label htmlFor="passport_number" className="block text-sm font-medium text-foreground mb-1.5">
                  {t('guest.passportNumber')} <span className="text-danger">*</span>
                </label>
                <input type="text" id="passport_number" value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} className={inputClass} placeholder={t('guest.passportNumberPlaceholder')} disabled={isLoading} />
              </div>

              <div>
                <label htmlFor="passport_image" className="block text-sm font-medium text-foreground mb-1.5">
                  {t('guest.passportImage')} <span className="text-danger">*</span>
                </label>
                <input type="file" id="passport_image" accept="image/jpeg,image/png,image/webp,image/heic" onChange={handleFileChange} className="block w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-border file:text-sm file:font-medium file:bg-surface-secondary file:text-foreground hover:file:bg-border file:cursor-pointer" disabled={isLoading} />
                <p className="mt-1 text-xs text-text-muted">{t('guest.passportImageNote')}</p>

                {passportPreview && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={passportPreview} alt="Passport" className="w-full max-h-48 object-contain bg-surface-secondary" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-danger/5 border border-danger/20 p-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <button type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? t('common.submitting') : isAlreadySubmitted ? t('guest.update') : t('guest.submit')}
        </button>
      </form>
    </div>
  );
}
