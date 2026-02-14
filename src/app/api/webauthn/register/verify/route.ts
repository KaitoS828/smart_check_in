import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { createClient } from '@/lib/supabase/server';
import { getChallenge, deleteChallenge } from '@/lib/webauthn/challenges';
import { expectedOrigin, expectedRPID } from '@/lib/webauthn/config';

/**
 * POST /api/webauthn/register/verify
 * Verify WebAuthn registration response and store passkey
 */
export async function POST(request: NextRequest) {
  try {
    const { challengeId, reservationId, credential } = await request.json();

    if (!challengeId || !reservationId || !credential) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Retrieve challenge from database
    const challenge = await getChallenge(challengeId);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge expired or not found' },
        { status: 400 }
      );
    }

    // Verify registration response
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin,
      expectedRPID,
    });

    // Delete challenge after use
    await deleteChallenge(challengeId);

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    const { credential: registeredCredential } = verification.registrationInfo;

    // Store passkey in database
    const supabase = await createClient();
    const { error: insertError } = await supabase.from('passkeys').insert({
      id: registeredCredential.id,
      reservation_id: reservationId,
      public_key: Buffer.from(registeredCredential.publicKey).toString('base64'),
      counter: registeredCredential.counter,
      transports: credential.response?.transports || [],
    });

    if (insertError) {
      console.error('Error storing passkey:', insertError);

      // Check if it's a duplicate key error
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Passkey already registered' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to store passkey' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      verified: true,
      message: 'Passkey registered successfully',
    });
  } catch (error) {
    console.error('Error verifying registration:', error);
    return NextResponse.json(
      { error: 'Failed to verify registration' },
      { status: 500 }
    );
  }
}
