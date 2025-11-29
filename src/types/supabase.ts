export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_details: {
        Row: {
          address: string;
          name: string | null;
          joined_at: string | null;
          total_win: number | null;
          active_tickets: number | null;
          game_played: number | null;
          win_rate: number | null;
        };
        Insert: {
          address: string;
          name?: string | null;
          joined_at?: string | null;
          total_win?: number | null;
          active_tickets?: number | null;
          game_played?: number | null;
          win_rate?: number | null;
        };
        Update: {
          address?: string;
          name?: string | null;
          joined_at?: string | null;
          total_win?: number | null;
          active_tickets?: number | null;
          game_played?: number | null;
          win_rate?: number | null;
        };
        Relationships: [];
      };
      lottery_history: {
        Row: {
          user_address: string;
          lottery_name: string;
          played_at: string;
          count: number | null;
          token_name: string | null;
          status: string | null;
        };
        Insert: {
          user_address: string;
          lottery_name: string;
          played_at?: string;
          count?: number | null;
          token_name?: string | null;
          status?: string | null;
        };
        Update: {
          user_address?: string;
          lottery_name?: string;
          played_at?: string;
          count?: number | null;
          token_name?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type UserDetails = Database["public"]["Tables"]["user_details"]["Row"];
export type UserDetailsInsert = Database["public"]["Tables"]["user_details"]["Insert"];
export type UserDetailsUpdate = Database["public"]["Tables"]["user_details"]["Update"];
export type LotteryHistory = Database["public"]["Tables"]["lottery_history"]["Row"];
export type LotteryHistoryInsert = Database["public"]["Tables"]["lottery_history"]["Insert"];
export type LotteryHistoryUpdate = Database["public"]["Tables"]["lottery_history"]["Update"];
