import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { saveChallenge } from '@/lib/webauthn/challenges';
import { rpID } from '@/lib/webauthn/config';

/**
 * POST /api/webauthn/authenticate/generate-options
 * Generate WebAuthn authentication options (usernameless)
 */
export async function POST() {
  try {
    // Generate authentication options without specifying allowCredentials
    // This enables usernameless authentication - the browser will search all passkeys
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'required',
      // CRITICAL: No allowCredentials array → usernameless authentication
    });

    // Save challenge to database
    const challengeId = await saveChallenge(options.challenge);

    return NextResponse.json({
      options,
      challengeId,
    });
  } catch (error) {
    console.error('Error generating authentication options:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 }
    );
  }
}
