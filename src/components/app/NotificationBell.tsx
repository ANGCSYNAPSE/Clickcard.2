import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Gift,
  UserPlus,
  Sparkles,
  CheckCheck,
  Inbox,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  markRead,
  markAllRead,
  receiveNotification,
} from "@/store/slices/notificationSlice";
import { connectNotifications, disconnectNotifications } from "@/lib/socketClient";

const ICONS: Record<string, typeof Bell> = {
  referral: Gift,
  new_user: UserPlus,
  feature: Sparkles,
  announcement: Sparkles,
};

const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const { items, unread } = useAppSelector((s) => s.notifications);
  const userId = useAppSelector((s) => s.auth.user?.id ?? s.auth.user?.userId);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Live socket stream.
  useEffect(() => {
    if (!userId) return;
    connectNotifications(
      userId,
      (n) => dispatch(receiveNotification(n)),
      () => dispatch(fetchNotifications()),
    );
    return () => disconnectNotifications();
  }, [userId, dispatch]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-ink/70 transition hover:bg-ink/5 hover:text-ink dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-candy-pink px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-[#1a1a1a]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-soft-lg dark:border-white/[0.06] dark:bg-[#262626] sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-80 lg:w-96">
          <div className="flex items-center justify-between border-b border-ink/[0.06] px-4 py-3 dark:border-white/[0.06]">
            <p className="font-display text-sm font-black text-ink dark:text-white">
              Notifications
            </p>
            {unread > 0 && (
              <button
                onClick={() => dispatch(markAllRead())}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="grid place-items-center gap-2 py-12 text-center">
                <Inbox className="text-ink/25" />
                <p className="text-sm text-ink/45 dark:text-white/45">
                  You&apos;re all caught up
                </p>
              </div>
            ) : (
              items.map((n) => {
                const Icon = ICONS[n.type] || Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.is_read && dispatch(markRead(n.id))}
                    className={`flex w-full items-start gap-3 border-b border-ink/[0.04] px-4 py-3 text-left transition hover:bg-brand-50/50 dark:border-white/[0.04] dark:hover:bg-white/5 ${
                      n.is_read ? "" : "bg-brand-50/40 dark:bg-white/[0.03]"
                    }`}
                  >
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-white">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink dark:text-white">
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-ink/60 dark:text-white/60">
                          {n.message}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-ink/40">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-candy-pink" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
