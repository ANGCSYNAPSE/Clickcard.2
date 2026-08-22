import { tokenService } from "./tokenService";
import { store } from "@/store";
import { setAuthFromTokens } from "@/store/slices/authSlice";

/**
 * Development utility to enable admin access
 * Only works in development/localhost
 */
export const enableDevAdmin = () => {
  if (typeof window === "undefined") return;
  if (window.location.hostname !== "localhost") return;

  // Set a dummy token - backend will accept it in dev mode
  const devTokens = {
    accessToken: "dev_admin_token_" + Date.now(),
    refreshToken: "dev_refresh_token_" + Date.now(),
    email: "admin@clickcard.com",
    username: "admin",
    userId: 1,
  };

  tokenService.setTokens(devTokens.accessToken, devTokens.refreshToken);
  store.dispatch(
    setAuthFromTokens({
      accessToken: devTokens.accessToken,
      refreshToken: devTokens.refreshToken,
      email: devTokens.email,
      username: devTokens.username,
      userId: devTokens.userId,
    })
  );

  console.log(
    "%c✨ Admin Mode Enabled",
    "color: #BE5103; font-weight: bold; font-size: 14px;"
  );
  console.log(
    "%cMaking requests to /api/admin endpoints...",
    "color: #069494; font-size: 12px;"
  );
};

/**
 * Logout from dev admin
 */
export const disableDevAdmin = () => {
  tokenService.clear();
  console.log(
    "%c✋ Admin Mode Disabled",
    "color: #666; font-weight: bold; font-size: 14px;"
  );
};
