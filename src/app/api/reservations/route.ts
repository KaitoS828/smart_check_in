import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSecretCode } from '@/lib/utils/secret-code';
import { z } from 'zod';

// Validation schema for creating a reservation
const CreateReservationSchema = z.object({
  door_pin: z.string().min(1, 'Door PIN is required'),
});

/**
 * GET /api/reservations
 * List all reservations
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reservations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reservations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reservations
 * Create a new reservation with auto-generated secret code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = CreateReservationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { door_pin } = validation.data;

    // Generate unique secret code
    let secret_code = generateSecretCode();
    const supabase = await createClient();

    // Retry if collision (unlikely but possible)
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('reservations')
        .select('id')
        .eq('secret_code', secret_code)
        .single();

      if (!existing) {
        break; // Unique code found
      }

      secret_code = generateSecretCode();
      attempts++;
    }

    if (attempts === maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique secret code' },
        { status: 500 }
      );
    }

    // Insert reservation
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        door_pin,
        secret_code,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reservation:', error);
      return NextResponse.json(
        { error: 'Failed to create reservation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
