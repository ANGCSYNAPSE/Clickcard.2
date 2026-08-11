import { apiClient } from "@/lib/axiosClient";
import { STUDIO_ROUTES } from "@/apiRoutes";
import type { ApiResponse } from "@/types";

export type StudioCategory = "resume" | "visiting_card" | "qr_poster";
export type StudioFormat = "pdf" | "png" | "svg";

export interface StudioTemplate {
  id: number;
  slug: string;
  name: string;
  category: StudioCategory;
  description: string;
  preview_url: string | null;
  width: number;
  height: number;
  primary_color: string;
  accent_color: string;
  is_premium: boolean;
}

export interface RenderInput {
  slug: string;
  format: StudioFormat;
  theme?: "light" | "dark";
  primary?: string;
  accent?: string;
}

export const studioService = {
  list: (category?: StudioCategory) =>
    apiClient.get<ApiResponse<StudioTemplate[]>>(
      `${STUDIO_ROUTES.templates}${category ? `?category=${category}` : ""}`,
    ),

  get: (slug: string) =>
    apiClient.get<ApiResponse<StudioTemplate>>(STUDIO_ROUTES.template(slug)),

  render: (input: RenderInput) =>
    apiClient.post<Blob>(STUDIO_ROUTES.render, input, {
      responseType: "blob",
    }),
};
