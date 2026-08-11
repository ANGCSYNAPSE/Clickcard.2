import { apiClient } from "@/lib/axiosClient";
import { PROFILE_ROUTES } from "@/apiRoutes";
import type { ApiResponse, FullProfile } from "@/types";
import { toApiProfile, fromApiProfile } from "./profileMapper";

export const profileService = {
  getFull: async () => {
    const res = await apiClient.get<ApiResponse>(PROFILE_ROUTES.full);
    return { ...res, data: { ...res.data, data: fromApiProfile(res.data?.data) } };
  },

  /** Create/update full profile. Sends multipart so an optional picture can ride along. */
  save: (profileData: FullProfile, profilePicture?: File | null) => {
    const form = new FormData();
    form.append("profileData", JSON.stringify(toApiProfile(profileData)));
    if (profilePicture) form.append("profilePicture", profilePicture);
    return apiClient.post<ApiResponse<FullProfile>>(
      PROFILE_ROUTES.create,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  uploadPicture: (file: File) => {
    const form = new FormData();
    form.append("profilePicture", file);
    return apiClient.post<ApiResponse<{ profilePicture: string }>>(
      PROFILE_ROUTES.uploadPicture,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  makePublic: () =>
    apiClient.post<ApiResponse>(PROFILE_ROUTES.makePublic),
  makePrivate: () =>
    apiClient.post<ApiResponse>(PROFILE_ROUTES.makePrivate),
  getVisibility: () =>
    apiClient.get<ApiResponse<{ isPublic: boolean }>>(
      PROFILE_ROUTES.visibility,
    ),

  getPdfUrl: () =>
    apiClient.get<ApiResponse<{ url: string }>>(PROFILE_ROUTES.pdfUrl),

  /* ----- digital card ----- */
  listCardTemplates: () =>
    apiClient.get<ApiResponse<{ templates: CardTemplate[] }>>(
      PROFILE_ROUTES.cardTemplates,
    ),

  downloadCardPdf: (input: CardRenderInput) =>
    apiClient.post<Blob>(PROFILE_ROUTES.cardPdf, input, {
      responseType: "blob",
    }),

  cardPreviewUrl: (input: CardRenderInput) => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const qs = new URLSearchParams(input as unknown as Record<string, string>).toString();
    return `${base}${PROFILE_ROUTES.cardPreview}?${qs}`;
  },
};

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
}

export interface CardRenderInput {
  templateId: string;
  primary: string;
  accent: string;
  theme: "light" | "dark";
}
