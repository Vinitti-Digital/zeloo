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
      activity_logs: {
        Row: {
          id: string;
          user_group_id: string;
          entity_type: Database["public"]["Enums"]["activity_entity_type"];
          entity_id: string;
          action: Database["public"]["Enums"]["activity_action"];
          actor_user_id: string | null;
          actor_display_name: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_group_id: string;
          entity_type: Database["public"]["Enums"]["activity_entity_type"];
          entity_id: string;
          action: Database["public"]["Enums"]["activity_action"];
          actor_user_id?: string | null;
          actor_display_name: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Insert"]>;
        Relationships: [];
      };
      execution_reschedules: {
        Row: {
          id: string;
          execution_id: string;
          previous_due_date: string;
          new_due_date: string;
          changed_by_user_id: string | null;
          changed_by_display_name: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          execution_id: string;
          previous_due_date: string;
          new_due_date: string;
          changed_by_user_id?: string | null;
          changed_by_display_name: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["execution_reschedules"]["Insert"]>;
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          user_group_id: string;
          email: string;
          invited_by_user_id: string | null;
          invited_by_display_name: string;
          status: Database["public"]["Enums"]["invitation_status"];
          token: string;
          expires_at: string;
          accepted_at: string | null;
          accepted_by_user_id: string | null;
          cancelled_at: string | null;
          cancelled_by_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_group_id: string;
          email: string;
          invited_by_user_id?: string | null;
          invited_by_display_name: string;
          status?: Database["public"]["Enums"]["invitation_status"];
          token?: string;
          expires_at?: string;
          accepted_at?: string | null;
          accepted_by_user_id?: string | null;
          cancelled_at?: string | null;
          cancelled_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invitations"]["Insert"]>;
        Relationships: [];
      };
      maintenance_groups: {
        Row: {
          id: string;
          user_group_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          created_by_user_id: string | null;
          created_at: string;
          updated_by_user_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_group_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          created_by_user_id?: string | null;
          created_at?: string;
          updated_by_user_id?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["maintenance_groups"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      service_executions: {
        Row: {
          id: string;
          service_id: string;
          scheduled_date: string;
          due_date: string;
          status: Database["public"]["Enums"]["execution_status"];
          completed_at: string | null;
          completed_by_user_id: string | null;
          completed_by_display_name: string | null;
          cancelled_at: string | null;
          cancelled_by_user_id: string | null;
          cancelled_by_display_name: string | null;
          cancel_reason: string | null;
          actual_cost: number | null;
          notes: string | null;
          is_one_off: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          scheduled_date: string;
          due_date: string;
          status?: Database["public"]["Enums"]["execution_status"];
          completed_at?: string | null;
          completed_by_user_id?: string | null;
          completed_by_display_name?: string | null;
          cancelled_at?: string | null;
          cancelled_by_user_id?: string | null;
          cancelled_by_display_name?: string | null;
          cancel_reason?: string | null;
          actual_cost?: number | null;
          notes?: string | null;
          is_one_off?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_executions"]["Insert"]>;
        Relationships: [];
      };
      service_routines: {
        Row: {
          id: string;
          service_id: string;
          frequency: Database["public"]["Enums"]["routine_frequency"];
          interval_value: number;
          base_date: string;
          end_date: string | null;
          weekdays: number[] | null;
          month_day: number | null;
          is_active: boolean;
          created_by_user_id: string | null;
          created_at: string;
          updated_by_user_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          frequency: Database["public"]["Enums"]["routine_frequency"];
          interval_value?: number;
          base_date: string;
          end_date?: string | null;
          weekdays?: number[] | null;
          month_day?: number | null;
          is_active?: boolean;
          created_by_user_id?: string | null;
          created_at?: string;
          updated_by_user_id?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_routines"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          maintenance_group_id: string;
          title: string;
          description: string | null;
          priority: Database["public"]["Enums"]["service_priority"] | null;
          responsible_user_id: string | null;
          location: string | null;
          estimated_cost: number | null;
          notes: string | null;
          status: Database["public"]["Enums"]["service_status"];
          created_by_user_id: string | null;
          created_at: string;
          updated_by_user_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          maintenance_group_id: string;
          title: string;
          description?: string | null;
          priority?: Database["public"]["Enums"]["service_priority"] | null;
          responsible_user_id?: string | null;
          location?: string | null;
          estimated_cost?: number | null;
          notes?: string | null;
          status?: Database["public"]["Enums"]["service_status"];
          created_by_user_id?: string | null;
          created_at?: string;
          updated_by_user_id?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      user_group_members: {
        Row: {
          id: string;
          user_group_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["member_role"];
          status: Database["public"]["Enums"]["member_status"];
          joined_at: string;
          left_at: string | null;
          removed_at: string | null;
          removed_by_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_group_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["member_role"];
          status?: Database["public"]["Enums"]["member_status"];
          joined_at?: string;
          left_at?: string | null;
          removed_at?: string | null;
          removed_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_group_members"]["Insert"]>;
        Relationships: [];
      };
      user_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by_user_id: string | null;
          created_at: string;
          updated_by_user_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by_user_id?: string | null;
          created_at?: string;
          updated_by_user_id?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_groups"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invitation: {
        Args: { p_invitation_id: string };
        Returns: Database["public"]["Tables"]["user_group_members"]["Row"];
      };
      cancel_execution: {
        Args: { p_execution_id: string; p_reason?: string };
        Returns: Database["public"]["Tables"]["service_executions"]["Row"];
      };
      cancel_invitation: {
        Args: { p_invitation_id: string };
        Returns: Database["public"]["Tables"]["invitations"]["Row"];
      };
      complete_execution: {
        Args: {
          p_execution_id: string;
          p_actual_cost?: number;
          p_notes?: string;
        };
        Returns: Database["public"]["Tables"]["service_executions"]["Row"];
      };
      create_invitation: {
        Args: { p_user_group_id: string; p_email: string };
        Returns: Database["public"]["Tables"]["invitations"]["Row"];
      };
      create_maintenance_group: {
        Args: {
          p_user_group_id: string;
          p_name: string;
          p_description?: string;
        };
        Returns: Database["public"]["Tables"]["maintenance_groups"]["Row"];
      };
      create_one_off_execution: {
        Args: {
          p_service_id: string;
          p_due_date: string;
          p_notes?: string;
        };
        Returns: Database["public"]["Tables"]["service_executions"]["Row"];
      };
      create_service: {
        Args: {
          p_maintenance_group_id: string;
          p_title: string;
          p_description?: string;
          p_priority?: Database["public"]["Enums"]["service_priority"];
          p_responsible_user_id?: string;
          p_location?: string;
          p_estimated_cost?: number;
          p_notes?: string;
        };
        Returns: Database["public"]["Tables"]["services"]["Row"];
      };
      create_service_routine: {
        Args: {
          p_service_id: string;
          p_frequency: Database["public"]["Enums"]["routine_frequency"];
          p_interval_value: number;
          p_base_date: string;
          p_end_date?: string;
          p_weekdays?: number[];
          p_month_day?: number;
          p_is_active?: boolean;
        };
        Returns: Database["public"]["Tables"]["service_routines"]["Row"];
      };
      create_user_group: {
        Args: { p_name: string; p_description?: string };
        Returns: Database["public"]["Tables"]["user_groups"]["Row"];
      };
      delete_maintenance_group: {
        Args: { p_maintenance_group_id: string };
        Returns: Database["public"]["Tables"]["maintenance_groups"]["Row"];
      };
      delete_service: {
        Args: { p_service_id: string };
        Returns: Database["public"]["Tables"]["services"]["Row"];
      };
      delete_service_routine: {
        Args: { p_routine_id: string };
        Returns: Database["public"]["Tables"]["service_routines"]["Row"];
      };
      reschedule_execution: {
        Args: {
          p_execution_id: string;
          p_new_due_date: string;
          p_reason?: string;
        };
        Returns: Database["public"]["Tables"]["service_executions"]["Row"];
      };
      update_service: {
        Args: {
          p_service_id: string;
          p_title: string;
          p_description?: string;
          p_priority?: Database["public"]["Enums"]["service_priority"];
          p_responsible_user_id?: string;
          p_location?: string;
          p_estimated_cost?: number;
          p_notes?: string;
          p_status?: Database["public"]["Enums"]["service_status"];
        };
        Returns: Database["public"]["Tables"]["services"]["Row"];
      };
      is_active_group_member: {
        Args: { p_user_group_id: string };
        Returns: boolean;
      };
      is_group_owner: {
        Args: { p_user_group_id: string };
        Returns: boolean;
      };
      leave_user_group: {
        Args: { p_user_group_id: string };
        Returns: Database["public"]["Tables"]["user_group_members"]["Row"];
      };
      remove_group_member: {
        Args: { p_user_group_id: string; p_member_user_id: string };
        Returns: Database["public"]["Tables"]["user_group_members"]["Row"];
      };
      update_maintenance_group: {
        Args: {
          p_maintenance_group_id: string;
          p_name: string;
          p_description?: string;
        };
        Returns: Database["public"]["Tables"]["maintenance_groups"]["Row"];
      };
      recalculate_future_executions: {
        Args: { p_routine_id: string };
        Returns: number;
      };
      update_service_routine: {
        Args: {
          p_routine_id: string;
          p_frequency: Database["public"]["Enums"]["routine_frequency"];
          p_interval_value: number;
          p_base_date: string;
          p_end_date?: string;
          p_weekdays?: number[];
          p_month_day?: number;
          p_is_active?: boolean;
        };
        Returns: Database["public"]["Tables"]["service_routines"]["Row"];
      };
      compute_next_occurrence: {
        Args: {
          p_base_date: string;
          p_frequency: Database["public"]["Enums"]["routine_frequency"];
          p_interval: number;
          p_after_date: string;
          p_weekdays?: number[];
          p_month_day?: number;
          p_end_date?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      activity_action:
        | "CREATED"
        | "UPDATED"
        | "DELETED"
        | "COMPLETED"
        | "RESCHEDULED"
        | "CANCELLED"
        | "INVITED"
        | "INVITE_ACCEPTED"
        | "INVITE_CANCELLED"
        | "INVITE_RESENT"
        | "MEMBER_LEFT"
        | "MEMBER_REMOVED"
        | "OWNER_SUCCEEDED"
        | "ROUTINE_RECALCULATED";
      activity_entity_type:
        | "USER_GROUP"
        | "MEMBERSHIP"
        | "INVITATION"
        | "MAINTENANCE_GROUP"
        | "SERVICE"
        | "ROUTINE"
        | "EXECUTION";
      execution_status: "PENDING" | "COMPLETED" | "CANCELLED";
      invitation_status: "PENDING" | "ACCEPTED" | "CANCELLED" | "EXPIRED";
      member_role: "OWNER" | "MEMBER";
      member_status: "ACTIVE" | "LEFT" | "REMOVED";
      routine_frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
      service_priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      service_status: "ACTIVE" | "COMPLETED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
