// Database types - will be auto-generated later with Supabase CLI
// For now, manual type definitions

export interface Reservation {
  id: string;
  guest_name: string | null;
  guest_address: string | null;
  guest_contact: string | null;
  secret_code: string;
  door_pin: string;
  is_checked_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface Passkey {
  id: string; // credentialID
  reservation_id: string;
  public_key: string;
  counter: number;
  transports: string[] | null;
  created_at: string;
}

export interface Challenge {
  id: string;
  challenge: string;
  created_at: string;
  expires_at: string;
}

export interface Database {
  public: {
    Tables: {
      reservations: {
        Row: Reservation;
        Insert: Omit<Reservation, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Reservation>;
      };
      passkeys: {
        Row: Passkey;
        Insert: Omit<Passkey, 'created_at'> & { created_at?: string };
        Update: Partial<Passkey>;
      };
      challenges: {
        Row: Challenge;
        Insert: Omit<Challenge, 'id' | 'created_at' | 'expires_at'> & {
          id?: string;
          created_at?: string;
          expires_at?: string;
        };
        Update: Partial<Challenge>;
      };
    };
  };
}
