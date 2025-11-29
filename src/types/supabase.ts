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
      pool_create: {
        Row: {
          id: string;
          name: string;
          min: number;
          max: number;
          pool: number;
          total: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          min: number;
          max: number;
          pool: number;
          total?: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          min?: number;
          max?: number;
          pool?: number;
          total?: number;
          created_at?: string | null;
        };
        Relationships: [];
      };
      chart_data: {
        Row: {
          id: string;
          pool_id: string | null;
          action: "buy" | "sell";
          amount: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          pool_id?: string | null;
          action: "buy" | "sell";
          amount: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          pool_id?: string | null;
          action?: "buy" | "sell";
          amount?: number;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chart_data_pool_id_fkey";
            columns: ["pool_id"];
            referencedRelation: "pool_create";
            referencedColumns: ["id"];
          }
        ];
      };
      top_holders: {
        Row: {
          id: string;
          pool_id: string | null;
          address: string;
          ticket_count: number;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          pool_id?: string | null;
          address: string;
          ticket_count?: number;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          pool_id?: string | null;
          address?: string;
          ticket_count?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "top_holders_pool_id_fkey";
            columns: ["pool_id"];
            referencedRelation: "pool_create";
            referencedColumns: ["id"];
          }
        ];
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

// Pool types
export type PoolCreate = Database["public"]["Tables"]["pool_create"]["Row"];
export type PoolCreateInsert = Database["public"]["Tables"]["pool_create"]["Insert"];
export type PoolCreateUpdate = Database["public"]["Tables"]["pool_create"]["Update"];

// Chart data types
export type ChartData = Database["public"]["Tables"]["chart_data"]["Row"];
export type ChartDataInsert = Database["public"]["Tables"]["chart_data"]["Insert"];

// Top holders types
export type TopHolder = Database["public"]["Tables"]["top_holders"]["Row"];
export type TopHolderInsert = Database["public"]["Tables"]["top_holders"]["Insert"];
export type TopHolderUpdate = Database["public"]["Tables"]["top_holders"]["Update"];
