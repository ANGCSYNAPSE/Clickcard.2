/**
 * Centralized environment configuration
 * All env vars are defined here for consistency
 */

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://clickcard-backend.vercel.app";

// Site URLs
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clickcard-2.vercel.app";
export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "https://clickcard-2.vercel.app";
export const SHARE_BASE_URL = process.env.NEXT_PUBLIC_SHARE_BASE || "https://clickcard-2.vercel.app/s";

// Authentication
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
export const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "";
export const APPLE_REDIRECT_URI =
  process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || `${SITE_URL}/auth/apple/callback`;

// Environment
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
