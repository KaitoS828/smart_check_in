import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for updating guest info
const UpdateGuestInfoSchema = z.object({
  guest_name: z.string().min(1, 'Guest name is required'),
  guest_address: z.string().min(1, 'Address is required'),
  guest_contact: z.string().min(1, 'Contact information is required'),
});

/**
 * GET /api/reservations/[id]
 * Get a specific reservation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reservations/[id]
 * Update guest information for a reservation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = UpdateGuestInfoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { guest_name, guest_address, guest_contact } = validation.data;
    const supabase = await createClient();

    // Update reservation
    const { data: reservation, error } = await supabase
      .from('reservations')
      .update({
        guest_name,
        guest_address,
        guest_contact,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !reservation) {
      console.error('Error updating reservation:', error);
      return NextResponse.json(
        { error: 'Failed to update reservation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
