import { apiClient } from "@/lib/axiosClient";
import { BUSINESS_PROFILE_ROUTES } from "@/apiRoutes";
import type { ApiResponse, BusinessLocation, BusinessProfile } from "@/types";

export interface BusinessProfileInput {
  company_name: string;
  category?: string;
  description?: string;
  about?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  founded?: string;
  funding?: string;
  founder?: string;
  employee_count?: string;
  revenue?: string;
  rating?: number | string;
  review_count?: number | string;
  gender_male_percent?: number | string;
  gender_female_percent?: number | string;
  locations?: BusinessLocation[];
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
}

export const businessProfileService = {
  list: () => apiClient.get<ApiResponse<BusinessProfile[]>>(BUSINESS_PROFILE_ROUTES.list),

  get: (id: number) => apiClient.get<ApiResponse<BusinessProfile>>(BUSINESS_PROFILE_ROUTES.get(id)),

  create: (data: BusinessProfileInput) =>
    apiClient.post<ApiResponse<BusinessProfile>>(BUSINESS_PROFILE_ROUTES.create, data),

  update: (id: number, data: Partial<BusinessProfileInput> & { status?: string }) =>
    apiClient.patch<ApiResponse<BusinessProfile>>(BUSINESS_PROFILE_ROUTES.update(id), data),

  remove: (id: number) => apiClient.delete<ApiResponse<{ id: number }>>(BUSINESS_PROFILE_ROUTES.remove(id)),

  // See profileService.save for why Content-Type must be cleared, not set, for multipart.
  uploadDocument: (id: number, file: File) => {
    const form = new FormData();
    form.append("document", file);
    return apiClient.post<ApiResponse<BusinessProfile>>(BUSINESS_PROFILE_ROUTES.uploadDocument(id), form, {
      headers: { "Content-Type": undefined },
    });
  },

  removeDocument: (id: number, docId: string) =>
    apiClient.delete<ApiResponse<BusinessProfile>>(BUSINESS_PROFILE_ROUTES.removeDocument(id, docId)),

  // Proxied through our own backend (auth'd, same-origin CORS-wise) instead of
  // fetching the Cloudinary URL directly from the browser — sidesteps any
  // cross-origin/Content-Disposition quirks on Cloudinary's raw delivery.
  downloadDocument: (id: number, docId: string) =>
    apiClient.get<Blob>(BUSINESS_PROFILE_ROUTES.downloadDocument(id, docId), { responseType: "blob" }),

  uploadLogo: (id: number, file: File) => {
    const form = new FormData();
    form.append("logo", file);
    return apiClient.post<ApiResponse<BusinessProfile>>(BUSINESS_PROFILE_ROUTES.uploadLogo(id), form, {
      headers: { "Content-Type": undefined },
    });
  },

  removeLogo: (id: number) =>
    apiClient.delete<ApiResponse<BusinessProfile>>(BUSINESS_PROFILE_ROUTES.removeLogo(id)),

  uploadCover: (id: number, file: File) => {
    const form = new FormData();
    form.append("cover", file);
    return apiClient.post<ApiResponse<BusinessProfile>>(BUSINESS_PROFILE_ROUTES.uploadCover(id), form, {
      headers: { "Content-Type": undefined },
    });
  },

  removeCover: (id: number) =>
    apiClient.delete<ApiResponse<BusinessProfile>>(BUSINESS_PROFILE_ROUTES.removeCover(id)),
};
