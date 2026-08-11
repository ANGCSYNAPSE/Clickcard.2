import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./index";
import { sessionRestored, fetchCurrentUser } from "./slices/authSlice";
import { fetchSubscription } from "./slices/billingSlice";
import { setTheme } from "./slices/uiSlice";
import { tokenService } from "@/lib/tokenService";
import Toaster from "@/components/system/Toaster";

/**
 * App-wide Redux provider. Creates one store instance per client and
 * bootstraps the session + theme on mount.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) storeRef.current = makeStore();

  useEffect(() => {
    const store = storeRef.current!;
    store.dispatch(sessionRestored());
    if (tokenService.isAuthenticated()) {
      store.dispatch(fetchCurrentUser());
      store.dispatch(fetchSubscription());
    }
    const saved =
      (typeof window !== "undefined" &&
        (localStorage.getItem("cc_theme") as "light" | "dark")) ||
      "light";
    store.dispatch(setTheme(saved));
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  return (
    <Provider store={storeRef.current}>
      {children}
      <Toaster />
    </Provider>
  );
}
