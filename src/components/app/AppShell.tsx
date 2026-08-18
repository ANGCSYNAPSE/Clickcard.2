import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  User,
  CreditCard,
  SlidersHorizontal,
  Share2,
  BarChart3,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Search,
  ChevronDown,
  Crown,
  Zap,
  FileText,
  LayoutGrid,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { fetchProfile } from "@/store/slices/profileSlice";
import { setSidebar } from "@/store/slices/uiSlice";
import { useRequireAuth } from "@/lib/authGuards";
import { useEntitlement } from "@/lib/useEntitlement";
import NotificationBell from "@/components/app/NotificationBell";
import { SITE_URL } from "@/lib/config";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Profile", href: "/profile", icon: User },
      { label: "Customize", href: "/customize", icon: SlidersHorizontal },
      { label: "Card", href: "/card", icon: CreditCard },
      { label: "CV", href: "/cv", icon: FileText },
      // { label: "Portfolio", href: "/portfolio", icon: LayoutGrid },
    ],
  },
  {
    label: "Grow",
    items: [
      { label: "Share & QR", href: "/share", icon: Share2 },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Billing", href: "/billing", icon: Receipt },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function AppShell({
  children,
  title,
  fullHeight,
}: {
  children: React.ReactNode;
  title?: string;
  /**
   * Pins the page to exactly one viewport so it never scrolls. Only applied
   * from `lg` up — below that there isn't the room, and the page scrolls
   * normally. Children own their own internal overflow.
   */
  fullHeight?: boolean;
}) {
  const { ready } = useRequireAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const profilePicture = useAppSelector((s) => s.profile.draft.personal?.profilePicture);
  const profileStatus = useAppSelector((s) => s.profile.status);
  const { planName, isPaid } = useEntitlement();
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(setSidebar(false));
    setMenuOpen(false);
  }, [router.asPath, dispatch]);

  // Pages that don't already fetch the profile themselves (billing, analytics,
  // etc.) still need it here so the sidebar/header avatar can show the real
  // profile picture instead of always falling back to the initial.
  useEffect(() => {
    if (profileStatus === "idle") dispatch(fetchProfile());
  }, [profileStatus, dispatch]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist dark:bg-[#0b2e2b]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }

  const handleLogout = async () => {
    await dispatch(logout());
    // Redirect to marketing website home page after logout
    if (typeof window !== "undefined") {
      window.location.href = SITE_URL;
    }
  };

  const initial = (user?.username || user?.email || "U")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-mist dark:bg-[#0b2e2b]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch(setSidebar(false))}
        />
      )}

      {/* ───────── sidebar ───────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(270px,calc(100vw-3rem))] flex-col overflow-y-auto border-r border-ink/[0.06] bg-white px-4 py-5 transition-transform dark:border-white/[0.06] dark:bg-[#12403c] lg:w-[270px] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Logo solid />
          <button
            className="text-ink dark:text-white transition hover:opacity-80 lg:hidden"
            onClick={() => dispatch(setSidebar(false))}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* profile mini-card */}
        <div className="mt-5 rounded-2xl bg-mist p-3 dark:bg-white/[0.04]">
          <div className="flex items-center gap-3">
            {profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profilePicture}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-candy-pink text-sm font-black text-white">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink dark:text-white">
                {user?.username ? `@${user.username}` : "Your account"}
              </p>
              <p className="truncate text-xs text-ink/50 dark:text-white/50">
                {user?.email || "—"}
              </p>
            </div>
          </div>
          <Link
            href="/billing"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-brand-100/70 py-2 text-xs font-bold text-brand-600 transition hover:bg-brand-100 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
          >
            <Crown size={13} />
            {isPaid ? `${planName} plan` : "Free plan · Upgrade"}
          </Link>
        </div>

        {/* grouped nav */}
        <nav className="mt-5 flex-1 space-y-5 overflow-y-auto no-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink/35 dark:text-white/30">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    router.pathname === item.href ||
                    router.pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-brand-50 text-brand-600 dark:bg-white/10 dark:text-white"
                          : "text-ink/65 hover:bg-brand-50/60 hover:text-brand-600 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-y-1.5 -left-1 w-1 rounded-full bg-brand-500" />
                      )}
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {user?.username && (
          <Link
            href="/profile/preview"
            className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-ink/10 px-3 py-2.5 text-xs font-bold text-ink/70 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-white/70"
          >
            <ExternalLink size={14} /> View public page
          </Link>
        )}
      </aside>

      {/* ───────── main ───────── */}
      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink/[0.06] bg-white/75 px-4 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0b2e2b]/75 sm:px-6">
          <button
            className="text-ink dark:text-white transition hover:opacity-80 lg:hidden"
            onClick={() => dispatch(setSidebar(true))}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* search */}
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 dark:text-white/35"
            />
            <input
              placeholder="Search…"
              className="h-11 w-full rounded-2xl border border-ink/[0.07] bg-mist pl-10 pr-3 text-sm font-medium text-ink outline-none transition placeholder:text-ink/40 focus:border-brand-300 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            {!isPaid && (
            <Link
              href="/billing"
              className="hidden items-center gap-1.5 rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-soft transition hover:bg-brand-600 sm:flex"
            >
              <Zap size={13} /> Upgrade
            </Link>
            )}
            <NotificationBell />
            <ThemeToggle />

            {/* avatar menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full transition hover:opacity-80"
              >
                {profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePicture} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-candy-pink text-sm font-black text-white">
                    {initial}
                  </span>
                )}
                <ChevronDown size={14} className="text-ink/50 dark:text-white/50" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-ink/[0.06] bg-white py-1.5 shadow-card dark:border-white/[0.06] dark:bg-[#12403c]">
                  <div className="border-b border-ink/[0.06] px-4 py-3 dark:border-white/[0.06]">
                    <p className="truncate text-sm font-bold text-ink dark:text-white">
                      {user?.username ? `@${user.username}` : "Account"}
                    </p>
                    <p className="truncate text-xs text-ink/50 dark:text-white/50">
                      {user?.email}
                    </p>
                  </div>
                  <MenuLink href="/settings" icon={Settings} label="Settings" />
                  {user?.username && (
                    <Link
                      href="/profile/preview"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-brand-50 dark:text-white/70 dark:hover:bg-white/5"
                    >
                      <ExternalLink size={16} /> Public page
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className={
            fullHeight
              ? "mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:flex lg:h-[calc(100dvh-4rem)] lg:flex-col lg:overflow-hidden lg:py-5"
              : "mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
          }
        >
          {title && (
            <h1 className="mb-6 font-display text-2xl font-black text-ink dark:text-white">
              {title}
            </h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Settings;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-brand-50 dark:text-white/70 dark:hover:bg-white/5"
    >
      <Icon size={16} /> {label}
    </Link>
  );
}
