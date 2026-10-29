export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      project_images: {
        Row: {
          caption_en: string
          caption_fa: string
          created_at: string
          id: string
          kind: string
          project_id: string
          sort_order: number
          url: string
        }
        Insert: {
          caption_en?: string
          caption_fa?: string
          created_at?: string
          id?: string
          kind?: string
          project_id: string
          sort_order?: number
          url: string
        }
        Update: {
          caption_en?: string
          caption_fa?: string
          created_at?: string
          id?: string
          kind?: string
          project_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string
          cover_url: string
          created_at: string
          desc_en: string
          desc_fa: string
          extra_desc_en: string
          extra_desc_fa: string
          features_en: string
          features_fa: string
          gallery_desc_en: string
          gallery_desc_fa: string
          id: string
          implementation_en: string
          implementation_fa: string
          link_url: string
          published: boolean
          release_url: string
          sort_order: number
          tag_en: string
          tag_fa: string
          tech: string
          title_en: string
          title_fa: string
          updated_at: string
          video_url: string
        }
        Insert: {
          category?: string
          cover_url?: string
          created_at?: string
          desc_en?: string
          desc_fa?: string
          extra_desc_en?: string
          extra_desc_fa?: string
          features_en?: string
          features_fa?: string
          gallery_desc_en?: string
          gallery_desc_fa?: string
          id?: string
          implementation_en?: string
          implementation_fa?: string
          link_url?: string
          published?: boolean
          release_url?: string
          sort_order?: number
          tag_en?: string
          tag_fa?: string
          tech?: string
          title_en?: string
          title_fa?: string
          updated_at?: string
          video_url?: string
        }
        Update: {
          category?: string
          cover_url?: string
          created_at?: string
          desc_en?: string
          desc_fa?: string
          extra_desc_en?: string
          extra_desc_fa?: string
          features_en?: string
          features_fa?: string
          gallery_desc_en?: string
          gallery_desc_fa?: string
          id?: string
          implementation_en?: string
          implementation_fa?: string
          link_url?: string
          published?: boolean
          release_url?: string
          sort_order?: number
          tag_en?: string
          tag_fa?: string
          tech?: string
          title_en?: string
          title_fa?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          avatar_url: string
          badge1_en: string
          badge1_fa: string
          badge2_en: string
          badge2_fa: string
          contact_subtitle_en: string
          contact_subtitle_fa: string
          contact_title_en: string
          contact_title_fa: string
          email: string
          headline_en: string
          headline_fa: string
          id: number
          name_en: string
          name_fa: string
          phone: string
          role_en: string
          role_fa: string
          show_status: boolean
          skills_design_title_en: string
          skills_design_title_fa: string
          skills_dev_title_en: string
          skills_dev_title_fa: string
          skills_subtitle_en: string
          skills_subtitle_fa: string
          skills_title_en: string
          skills_title_fa: string
          status_en: string
          status_fa: string
          subtext_en: string
          subtext_fa: string
          updated_at: string
          works_subtitle_en: string
          works_subtitle_fa: string
          works_title_en: string
          works_title_fa: string
        }
        Insert: {
          avatar_url?: string
          badge1_en?: string
          badge1_fa?: string
          badge2_en?: string
          badge2_fa?: string
          contact_subtitle_en?: string
          contact_subtitle_fa?: string
          contact_title_en?: string
          contact_title_fa?: string
          email?: string
          headline_en?: string
          headline_fa?: string
          id?: number
          name_en?: string
          name_fa?: string
          phone?: string
          role_en?: string
          role_fa?: string
          show_status?: boolean
          skills_design_title_en?: string
          skills_design_title_fa?: string
          skills_dev_title_en?: string
          skills_dev_title_fa?: string
          skills_subtitle_en?: string
          skills_subtitle_fa?: string
          skills_title_en?: string
          skills_title_fa?: string
          status_en?: string
          status_fa?: string
          subtext_en?: string
          subtext_fa?: string
          updated_at?: string
          works_subtitle_en?: string
          works_subtitle_fa?: string
          works_title_en?: string
          works_title_fa?: string
        }
        Update: {
          avatar_url?: string
          badge1_en?: string
          badge1_fa?: string
          badge2_en?: string
          badge2_fa?: string
          contact_subtitle_en?: string
          contact_subtitle_fa?: string
          contact_title_en?: string
          contact_title_fa?: string
          email?: string
          headline_en?: string
          headline_fa?: string
          id?: number
          name_en?: string
          name_fa?: string
          phone?: string
          role_en?: string
          role_fa?: string
          show_status?: boolean
          skills_design_title_en?: string
          skills_design_title_fa?: string
          skills_dev_title_en?: string
          skills_dev_title_fa?: string
          skills_subtitle_en?: string
          skills_subtitle_fa?: string
          skills_title_en?: string
          skills_title_fa?: string
          status_en?: string
          status_fa?: string
          subtext_en?: string
          subtext_fa?: string
          updated_at?: string
          works_subtitle_en?: string
          works_subtitle_fa?: string
          works_title_en?: string
          works_title_fa?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          group_key: string
          id: string
          label_en: string
          label_fa: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          group_key?: string
          id?: string
          label_en?: string
          label_fa?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          group_key?: string
          id?: string
          label_en?: string
          label_fa?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
