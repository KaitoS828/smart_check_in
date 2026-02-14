import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { createClient } from '@/lib/supabase/server';
import { saveChallenge } from '@/lib/webauthn/challenges';
import { rpName, rpID } from '@/lib/webauthn/config';

/**
 * POST /api/webauthn/register/generate-options
 * Generate WebAuthn registration options for a reservation
 */
export async function POST(request: NextRequest) {
  try {
    const { reservationId } = await request.json();

    if (!reservationId) {
      return NextResponse.json(
        { error: 'Reservation ID is required' },
        { status: 400 }
      );
    }

    // Verify reservation exists
    const supabase = await createClient();
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('id, guest_name')
      .eq('id', reservationId)
      .single();

    if (error || !reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Check if passkey already exists for this reservation
    const { data: existingPasskey } = await supabase
      .from('passkeys')
      .select('id')
      .eq('reservation_id', reservationId)
      .single();

    if (existingPasskey) {
      return NextResponse.json(
        { error: 'Passkey already registered for this reservation' },
        { status: 409 }
      );
    }

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: reservationId,
      userName: reservation.guest_name || reservationId,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required', // CRITICAL: Enable discoverable credentials
        userVerification: 'required',
        authenticatorAttachment: 'platform', // Prefer platform authenticators (Touch ID, Face ID, Windows Hello)
      },
      excludeCredentials: [], // No existing credentials to exclude
    });

    // Save challenge to database
    const challengeId = await saveChallenge(options.challenge);

    return NextResponse.json({
      options,
      challengeId,
    });
  } catch (error) {
    console.error('Error generating registration options:', error);
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}
