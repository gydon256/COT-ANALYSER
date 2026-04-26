export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          role: string;
          plan: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          role?: string;
          plan?: string;
          created_at?: string;
        };
        Update: {
          username?: string | null;
          full_name?: string | null;
          role?: string;
          plan?: string;
        };
        Relationships: [];
      };
      assets: {
        Row: {
          id: number;
          symbol: string;
          display_name: string;
          cftc_market_name: string;
          exchange: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          symbol: string;
          display_name: string;
          cftc_market_name: string;
          exchange?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          symbol?: string;
          display_name?: string;
          cftc_market_name?: string;
          exchange?: string | null;
          category?: string | null;
        };
        Relationships: [];
      };
      cot_reports: {
        Row: {
          id: number;
          asset_id: number;
          report_date: string;
          open_interest: number | null;
          non_commercial_long: number | null;
          non_commercial_short: number | null;
          non_commercial_net: number | null;
          commercial_long: number | null;
          commercial_short: number | null;
          commercial_net: number | null;
          non_reportable_long: number | null;
          non_reportable_short: number | null;
          non_reportable_net: number | null;
          created_at: string;
        };
        Insert: {
          asset_id: number;
          report_date: string;
          open_interest?: number | null;
          non_commercial_long?: number | null;
          non_commercial_short?: number | null;
          non_commercial_net?: number | null;
          commercial_long?: number | null;
          commercial_short?: number | null;
          commercial_net?: number | null;
          non_reportable_long?: number | null;
          non_reportable_short?: number | null;
          non_reportable_net?: number | null;
          created_at?: string;
        };
        Update: {
          open_interest?: number | null;
          non_commercial_long?: number | null;
          non_commercial_short?: number | null;
          non_commercial_net?: number | null;
          commercial_long?: number | null;
          commercial_short?: number | null;
          commercial_net?: number | null;
          non_reportable_long?: number | null;
          non_reportable_short?: number | null;
          non_reportable_net?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "cot_reports_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          }
        ];
      };
      asset_aliases: {
        Row: {
          id: number;
          asset_id: number;
          alias: string;
          normalized_alias: string;
          kind: string;
          created_at: string;
        };
        Insert: {
          asset_id: number;
          alias: string;
          normalized_alias: string;
          kind?: string;
          created_at?: string;
        };
        Update: {
          alias?: string;
          normalized_alias?: string;
          kind?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_aliases_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          }
        ];
      };
      watchlists: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      watchlist_items: {
        Row: {
          id: number;
          watchlist_id: number;
          asset_id: number;
          created_at: string;
          notes: string;
          bias_label: string;
          checklist: Json;
          updated_at: string;
        };
        Insert: {
          watchlist_id: number;
          asset_id: number;
          created_at?: string;
          notes?: string;
          bias_label?: string;
          checklist?: Json;
          updated_at?: string;
        };
        Update: {
          watchlist_id?: number;
          asset_id?: number;
          notes?: string;
          bias_label?: string;
          checklist?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watchlist_items_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey";
            columns: ["watchlist_id"];
            isOneToOne: false;
            referencedRelation: "watchlists";
            referencedColumns: ["id"];
          }
        ];
      };
      alerts: {
        Row: {
          id: number;
          user_id: string;
          asset_id: number;
          alert_type: string | null;
          condition: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          asset_id: number;
          alert_type?: string | null;
          condition?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          alert_type?: string | null;
          condition?: string | null;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "alerts_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          }
        ];
      };
      ingestion_runs: {
        Row: {
          id: number;
          started_at: string;
          finished_at: string | null;
          status: string;
          source: string;
          assets_checked: number;
          reports_upserted: number;
          latest_report_date: string | null;
          error_message: string | null;
          created_by: string | null;
        };
        Insert: {
          started_at?: string;
          finished_at?: string | null;
          status?: string;
          source?: string;
          assets_checked?: number;
          reports_upserted?: number;
          latest_report_date?: string | null;
          error_message?: string | null;
          created_by?: string | null;
        };
        Update: {
          finished_at?: string | null;
          status?: string;
          assets_checked?: number;
          reports_upserted?: number;
          latest_report_date?: string | null;
          error_message?: string | null;
        };
        Relationships: [];
      };
      ingestion_asset_results: {
        Row: {
          id: number;
          run_id: number | null;
          asset_id: number | null;
          symbol: string | null;
          cftc_market_name: string;
          status: string;
          rows_upserted: number;
          latest_report_date: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          run_id?: number | null;
          asset_id?: number | null;
          symbol?: string | null;
          cftc_market_name: string;
          status: string;
          rows_upserted?: number;
          latest_report_date?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          run_id?: number | null;
          asset_id?: number | null;
          symbol?: string | null;
          cftc_market_name?: string;
          status?: string;
          rows_upserted?: number;
          latest_report_date?: string | null;
          error_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ingestion_asset_results_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingestion_asset_results_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "ingestion_runs";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
