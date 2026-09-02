import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/profileSlice";
import { useRequireAuth } from "@/lib/authGuards";
import LiveProfileCard from "@/components/app/LiveProfileCard";

/** Standalone "View as" preview — the live profile card on its own page. */
export default function ProfilePreviewPage() {
  const { ready } = useRequireAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { draft, status } = useAppSelector((s) => s.profile);
  const { user } = useAppSelector((s) => s.auth);
  const design = useAppSelector((s) => s.design);

  useEffect(() => {
    if (status === "idle") dispatch(fetchProfile());
  }, [dispatch, status]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist dark:bg-[#1a1a1a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>View as · ClickCard</title>
      </Head>
      <div className="min-h-screen bg-mist dark:bg-[#1a1a1a] px-6 py-8">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="mb-6 flex w-full items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft transition hover:opacity-90 dark:bg-white/10 dark:text-white"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft dark:bg-white/10 dark:text-white">
              View as
            </span>
            <span className="w-[74px]" aria-hidden />
          </div>

          <LiveProfileCard
            {...design}
            name={draft.personal?.fullName || "Your name"}
            username={user?.username}
            avatarUrl={draft.personal?.profilePicture}
            bio={draft.personal?.bio}
            socialLinks={(draft.social || []).filter((s) => s.url)}
            contact={draft.contact}
            experience={draft.experience}
            education={draft.education}
            products={draft.products}
            business={draft.business}
          />
        </div>
      </div>
    </>
  );
}
