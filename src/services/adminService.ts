import { apiClient } from "@/lib/axiosClient";

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  newSignups: number;
  userGrowth: number;
  revenueGrowth: number;
  subscriptionGrowth: number;
  signupGrowth: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface UserGrowthData {
  date: string;
  users: number;
}

export interface AdminUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  signupDate: string;
  lastLogin: string;
  status: "active" | "blocked";
  moderationStatus: "approved" | "pending" | "rejected";
  cardCount: number;
  subscriptionPlan?: string;
  revenue?: number;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface UserDetails extends AdminUser {
  createdAt: string;
  updatedAt: string;
  totalCards: number;
  totalViews: number;
  totalClicks: number;
  totalDownloads: number;
  subscriptionActive: boolean;
  subscriptionPlan?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

export interface UserAnalytics {
  views: number;
  clicks: number;
  downloads: number;
  shares: number;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topCountries: Array<{
    country: string;
    count: number;
  }>;
}

export interface AdminLead {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "responded" | "resolved";
  createdAt: string;
}

export interface AdminSettings {
  maintenanceMode: boolean;
  registrationOpen: boolean;
  maxUsersPerDay: number;
  supportEmail: string;
  maxCardsPerUser: number;
}

export const adminService = {
  // Admin Authentication
  adminLogin: async (email: string, password?: string) => {
    const { data } = await apiClient.post("/api/users/admin/login", {
      email,
      ...(password ? { password } : {})
    });
    return data.data;
  },

  adminLoginInitiate: async (email: string) => {
    const { data } = await apiClient.post("/api/users/admin/login", { email });
    return data.data;
  },

  // Dashboard Stats
  getStats: async (): Promise<AdminStats> => {
    const { data } = await apiClient.get("/api/admin/stats");
    return data.data;
  },

  // Revenue Data
  getRevenue: async (period: "7d" | "30d" | "90d" = "30d") => {
    const { data } = await apiClient.get("/api/admin/revenue", {
      params: { period },
    });
    return data.data;
  },

  // Users Management
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: "active" | "blocked";
      moderationStatus?: "approved" | "pending" | "rejected";
      search?: string;
    }
  ): Promise<AdminUsersResponse> => {
    const { data } = await apiClient.get("/api/admin/users", {
      params: { page, limit, ...filters },
    });
    return data.data;
  },

  getUserDetails: async (userId: string): Promise<UserDetails> => {
    const { data } = await apiClient.get(`/api/admin/users/${userId}`);
    return data.data;
  },

  getUserAnalytics: async (userId: string): Promise<UserAnalytics> => {
    const { data } = await apiClient.get(
      `/api/admin/users/${userId}/analytics`
    );
    return data.data;
  },

  blockUser: async (userId: string, block: boolean): Promise<void> => {
    await apiClient.patch(`/api/admin/users/${userId}/block`, {
      blocked: block,
    });
  },

  moderateUser: async (
    userId: string,
    status: "approved" | "rejected" | "pending"
  ): Promise<void> => {
    await apiClient.patch(`/api/admin/users/${userId}/moderate`, {
      status,
    });
  },

  // Leads
  getLeads: async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: AdminLead[]; total: number }> => {
    const { data } = await apiClient.get("/api/admin/leads", {
      params: { page, limit },
    });
    return data.data;
  },

  // Subscriptions
  getSubscriptionPlans: async (): Promise<any[]> => {
    const { data } = await apiClient.get("/api/admin/subscriptions/plans");
    return data.data || [];
  },

  getUserSubscriptions: async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: any[]; total: number }> => {
    const { data } = await apiClient.get("/api/admin/subscriptions/users", {
      params: { page, limit },
    });
    return data.data || { data: [], total: 0 };
  },

  // Settings
  getSettings: async (): Promise<AdminSettings> => {
    const { data } = await apiClient.get("/api/admin/settings");
    return data.data;
  },

  updateSettings: async (settings: Partial<AdminSettings>): Promise<void> => {
    await apiClient.post("/api/admin/settings", settings);
  },

  // Bulk Actions
  bulkBlockUsers: async (userIds: string[], block: boolean): Promise<void> => {
    await Promise.all(
      userIds.map((id) => adminService.blockUser(id, block))
    );
  },

  bulkModerateUsers: async (
    userIds: string[],
    status: "approved" | "rejected" | "pending"
  ): Promise<void> => {
    await Promise.all(
      userIds.map((id) => adminService.moderateUser(id, status))
    );
  },
};
