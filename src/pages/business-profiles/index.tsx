import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Building2, Plus, ChevronRight, Trash2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import Button from "@/components/ui/Button";
import BusinessProfileModal, { type BusinessProfileFiles } from "@/components/app/BusinessProfileModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBusinessProfiles,
  createBusinessProfile,
  deleteBusinessProfile,
  uploadBusinessLogo,
  uploadBusinessCover,
  uploadBusinessDocument,
} from "@/store/slices/businessProfileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import type { BusinessProfile } from "@/types";
import type { BusinessProfileInput } from "@/services/businessProfileService";

export default function BusinessProfilesPage() {
  const dispatch = useAppDispatch();
  const { items, status, mutating } = useAppSelector((s) => s.businessProfiles);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (status === "idle") dispatch(fetchBusinessProfiles());
  }, [dispatch, status]);

  const save = async (input: BusinessProfileInput, files: BusinessProfileFiles) => {
    const res = await dispatch(createBusinessProfile(input));
    if (!createBusinessProfile.fulfilled.match(res)) {
      dispatch(pushToast((res.payload as string) || "Could not save business profile", "error"));
      return;
    }
    const id = res.payload.id;

    if (files.logo || files.cover || files.documents.length > 0) {
      setUploadingFiles(true);
      if (files.logo) {
        const logoRes = await dispatch(uploadBusinessLogo({ id, file: files.logo }));
        if (!uploadBusinessLogo.fulfilled.match(logoRes)) {
          dispatch(pushToast((logoRes.payload as string) || "Logo upload failed", "error"));
        }
      }
      if (files.cover) {
        const coverRes = await dispatch(uploadBusinessCover({ id, file: files.cover }));
        if (!uploadBusinessCover.fulfilled.match(coverRes)) {
          dispatch(pushToast((coverRes.payload as string) || "Cover image upload failed", "error"));
        }
      }
      // Uploaded one at a time — each response carries the full, current
      // documents list, so sequencing avoids a later response clobbering
      // an earlier upload's result if they raced.
      for (const file of files.documents) {
        const docRes = await dispatch(uploadBusinessDocument({ id, file }));
        if (!uploadBusinessDocument.fulfilled.match(docRes)) {
          dispatch(pushToast((docRes.payload as string) || `Could not upload ${file.name}`, "error"));
        }
      }
      setUploadingFiles(false);
    }

    dispatch(pushToast("Business profile created", "success"));
    setModalOpen(false);
  };

  const remove = async (e: React.MouseEvent, profile: BusinessProfile) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${profile.company_name}"? This also removes its uploaded documents.`)) return;
    const res = await dispatch(deleteBusinessProfile(profile.id));
    if (deleteBusinessProfile.fulfilled.match(res)) {
      dispatch(pushToast("Business profile deleted", "info"));
    }
  };

  return (
    <AppShell>
      <Head>
        <title>Business Profiles · ClickCard</title>
      </Head>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-ink dark:text-white">
            Business Profiles
          </h1>
          <p className="text-sm text-ink/55 dark:text-white/55">
            Create one or more company profiles and attach registration documents.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={18} /> New business profile
        </Button>
      </div>

      <div className="mt-6 space-y-5">
        {status === "loading" && items.length === 0 && (
          <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl border border-ink/5 bg-white dark:border-white/5 dark:bg-[#262626]" />
            ))}
          </div>
        )}

        {status !== "loading" && items.length === 0 && (
          <div className="grid place-items-center rounded-3xl border border-dashed border-ink/15 py-16 text-center dark:border-white/10">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-white/5">
              <Building2 size={28} />
            </span>
            <p className="mt-4 font-bold text-ink dark:text-white">No business profiles yet</p>
            <p className="text-sm text-ink/55 dark:text-white/55">
              Add your company to get started — you can create more than one.
            </p>
            <Button className="mt-5" onClick={() => setModalOpen(true)}>
              <Plus size={18} /> New business profile
            </Button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((profile) => (
            <Link
              key={profile.id}
              href={`/business-profiles/${profile.slug || profile.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-ink/5 bg-white p-4 transition hover:border-brand-200 hover:shadow-soft dark:border-white/5 dark:bg-[#262626] dark:hover:border-brand-500/30"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
                {profile.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Building2 size={20} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink dark:text-white">{profile.company_name}</p>
                {profile.category && (
                  <span className="mt-1 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    {profile.category}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => remove(e, profile)}
                aria-label="Delete"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/30 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:text-white/30 dark:hover:bg-rose-500/10"
              >
                <Trash2 size={15} />
              </button>
              <ChevronRight size={18} className="shrink-0 text-ink/30 dark:text-white/30" />
            </Link>
          ))}
        </div>
      </div>

      {modalOpen && (
        <BusinessProfileModal
          saving={mutating || uploadingFiles}
          onSave={save}
          onClose={() => setModalOpen(false)}
        />
      )}
    </AppShell>
  );
}
