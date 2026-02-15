// Database types

export interface Reservation {
  id: string;
  guest_name: string | null;
  guest_name_kana: string | null;
  guest_address: string | null;
  guest_contact: string | null;
  guest_occupation: string | null;
  is_foreign_national: boolean;
  nationality: string | null;
  passport_number: string | null;
  passport_image_url: string | null;
  secret_code: string;
  door_pin: string;
  is_checked_in: boolean;
  is_archived: boolean;
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
