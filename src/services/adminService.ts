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
    try {
      const { data } = await apiClient.get("/api/admin/stats");
      return data.data;
    } catch (err) {
      console.warn("Stats endpoint not available");
      return {
        totalUsers: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        newSignups: 0,
        userGrowth: 0,
        revenueGrowth: 0,
        subscriptionGrowth: 0,
        signupGrowth: 0,
      };
    }
  },

  // Revenue Data
  getRevenue: async (period: "7d" | "30d" | "90d" = "30d") => {
    try {
      const { data } = await apiClient.get("/api/admin/revenue", {
        params: { period },
      });
      return data.data;
    } catch (err) {
      console.warn("Revenue endpoint not available");
      return [];
    }
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
    try {
      const { data } = await apiClient.get("/api/admin/users", {
        params: { page, limit, ...filters },
      });
      return data.data;
    } catch (err) {
      console.warn("Users endpoint not available");
      return { data: [], total: 0, page, limit };
    }
  },

  getUserDetails: async (userId: string): Promise<UserDetails> => {
    try {
      const { data } = await apiClient.get(`/api/admin/users/${userId}`);
      return data.data;
    } catch (err) {
      console.warn("User details endpoint not available");
      throw err;
    }
  },

  getUserAnalytics: async (userId: string): Promise<UserAnalytics> => {
    try {
      const { data } = await apiClient.get(
        `/api/admin/users/${userId}/analytics`
      );
      return data.data;
    } catch (err) {
      console.warn("User analytics endpoint not available");
      return {
        views: 0,
        clicks: 0,
        downloads: 0,
        shares: 0,
        devices: { mobile: 0, desktop: 0, tablet: 0 },
        topCountries: [],
      };
    }
  },

  blockUser: async (userId: string, block: boolean): Promise<void> => {
    try {
      await apiClient.patch(`/api/admin/users/${userId}/block`, {
        blocked: block,
      });
    } catch (err) {
      console.warn("Block user endpoint not available");
    }
  },

  moderateUser: async (
    userId: string,
    status: "approved" | "rejected" | "pending"
  ): Promise<void> => {
    try {
      await apiClient.patch(`/api/admin/users/${userId}/moderate`, {
        status,
      });
    } catch (err) {
      console.warn("Moderate user endpoint not available");
    }
  },

  // Leads
  getLeads: async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: AdminLead[]; total: number }> => {
    try {
      const { data } = await apiClient.get("/api/admin/leads", {
        params: { page, limit },
      });
      return data.data;
    } catch (err) {
      console.warn("Leads endpoint not available");
      return { data: [], total: 0 };
    }
  },

  // Subscriptions
  getSubscriptionPlans: async (): Promise<any[]> => {
    try {
      const { data } = await apiClient.get("/api/admin/subscriptions/plans");
      return data.data || [];
    } catch (err) {
      console.warn("Subscription plans endpoint not available");
      return [];
    }
  },

  getUserSubscriptions: async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: any[]; total: number }> => {
    try {
      const { data } = await apiClient.get("/api/admin/subscriptions/users", {
        params: { page, limit },
      });
      return data.data || { data: [], total: 0 };
    } catch (err) {
      console.warn("User subscriptions endpoint not available");
      return { data: [], total: 0 };
    }
  },

  // Settings
  getSettings: async (): Promise<AdminSettings> => {
    try {
      const { data } = await apiClient.get("/api/admin/settings");
      return data.data;
    } catch (err) {
      console.warn("Settings endpoint not available");
      return {
        maintenanceMode: false,
        registrationOpen: true,
        maxUsersPerDay: 100,
        supportEmail: "support@example.com",
        maxCardsPerUser: 10,
      };
    }
  },

  updateSettings: async (settings: Partial<AdminSettings>): Promise<void> => {
    try {
      await apiClient.post("/api/admin/settings", settings);
    } catch (err) {
      console.warn("Failed to update settings:", err);
    }
  },

  // Bulk Actions
  bulkBlockUsers: async (userIds: string[], block: boolean): Promise<void> => {
    try {
      await Promise.all(
        userIds.map((id) => adminService.blockUser(id, block))
      );
    } catch (err) {
      console.warn("Bulk block users failed:", err);
    }
  },

  bulkModerateUsers: async (
    userIds: string[],
    status: "approved" | "rejected" | "pending"
  ): Promise<void> => {
    try {
      await Promise.all(
        userIds.map((id) => adminService.moderateUser(id, status))
      );
    } catch (err) {
      console.warn("Bulk moderate users failed:", err);
    }
  },
};
