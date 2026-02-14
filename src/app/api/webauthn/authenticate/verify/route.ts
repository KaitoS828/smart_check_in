import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { createClient } from '@/lib/supabase/server';
import { getChallenge, deleteChallenge } from '@/lib/webauthn/challenges';
import { expectedOrigin, expectedRPID } from '@/lib/webauthn/config';

/**
 * POST /api/webauthn/authenticate/verify
 * Verify WebAuthn authentication and return reservation ID
 * This is the core of usernameless authentication
 */
export async function POST(request: NextRequest) {
  try {
    const { challengeId, credential } = await request.json();

    if (!challengeId || !credential) {
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

    // CRITICAL: Look up passkey by credentialID (usernameless flow)
    const supabase = await createClient();
    const { data: passkey, error: passkeyError } = await supabase
      .from('passkeys')
      .select('*, reservations(*)')
      .eq('id', credential.id)
      .single();

    if (passkeyError || !passkey) {
      await deleteChallenge(challengeId);
      return NextResponse.json(
        { error: 'Passkey not found. Please register your device first.' },
        { status: 404 }
      );
    }

    // Verify authentication response
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: passkey.id,
        publicKey: Buffer.from(passkey.public_key, 'base64'),
        counter: passkey.counter,
      },
    });

    // Delete challenge after use
    await deleteChallenge(challengeId);

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 400 }
      );
    }

    // Update counter to prevent replay attacks
    const { authenticationInfo } = verification;
    await supabase
      .from('passkeys')
      .update({ counter: authenticationInfo.newCounter })
      .eq('id', passkey.id);

    // Return reservation ID (user discovered through credentialID)
    return NextResponse.json({
      verified: true,
      reservationId: passkey.reservation_id,
    });
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return NextResponse.json(
      { error: 'Failed to verify authentication' },
      { status: 500 }
    );
  }
}
