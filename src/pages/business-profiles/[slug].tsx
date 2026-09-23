import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { Upload, Loader2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import BusinessProfileModal, { type BusinessProfileFiles } from "@/components/app/BusinessProfileModal";
import BusinessShowcase from "@/components/business/BusinessShowcase";
import DocumentGrid from "@/components/business/DocumentGrid";
import SharePopup from "@/components/app/SharePopup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBusinessProfiles,
  updateBusinessProfile,
  deleteBusinessProfile,
  uploadBusinessDocument,
  removeBusinessDocument,
  uploadBusinessLogo,
  removeBusinessLogo,
  uploadBusinessCover,
  removeBusinessCover,
} from "@/store/slices/businessProfileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { SITE_URL } from "@/lib/config";
import type { BusinessProfileInput } from "@/services/businessProfileService";

export default function BusinessProfileDetailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const slug = String(router.query.slug || "");
  const { items, status, mutating } = useAppSelector((s) => s.businessProfiles);
  // Falls back to matching by numeric id too, so old /business-profiles/8-style
  // links (bookmarked before slugs existed) still resolve.
  const profile = items.find((p) => p.slug === slug || String(p.id) === slug);

  const [modalOpen, setModalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchBusinessProfiles());
  }, [dispatch, status]);

  // Once the list is loaded, replace a numeric-id link with the canonical slug URL.
  useEffect(() => {
    if (!router.isReady || !profile || !profile.slug || profile.slug === slug) return;
    router.replace(`/business-profiles/${profile.slug}`);
  }, [router, profile, slug]);

  const save = async (input: BusinessProfileInput, files: BusinessProfileFiles) => {
    if (!profile) return;
    const id = profile.id;
    const res = await dispatch(updateBusinessProfile({ id, input }));
    if (!updateBusinessProfile.fulfilled.match(res)) {
      dispatch(pushToast((res.payload as string) || "Could not save business profile", "error"));
      return;
    }

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
    // Uploaded one at a time — see onFilesChosen below for why.
    for (const file of files.documents) {
      const docRes = await dispatch(uploadBusinessDocument({ id, file }));
      if (!uploadBusinessDocument.fulfilled.match(docRes)) {
        dispatch(pushToast((docRes.payload as string) || `Could not upload ${file.name}`, "error"));
      }
    }

    dispatch(pushToast("Business profile updated", "success"));
    setModalOpen(false);
  };

  const saveAbout = async (about: string) => {
    if (!profile) return;
    setSavingAbout(true);
    const res = await dispatch(updateBusinessProfile({ id: profile.id, input: { about } }));
    setSavingAbout(false);
    if (updateBusinessProfile.fulfilled.match(res)) {
      dispatch(pushToast("About section updated", "success"));
    } else {
      dispatch(pushToast((res.payload as string) || "Could not save the About section", "error"));
    }
  };

  const remove = async () => {
    if (!profile) return;
    if (!confirm(`Delete "${profile.company_name}"? This also removes its uploaded documents.`)) return;
    const res = await dispatch(deleteBusinessProfile(profile.id));
    if (deleteBusinessProfile.fulfilled.match(res)) {
      dispatch(pushToast("Business profile deleted", "info"));
      router.push("/business-profiles");
    }
  };

  const onFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!profile || files.length === 0) return;
    const id = profile.id;
    setUploading(true);
    // Uploaded one at a time — each response carries the full, current
    // documents list, so sequencing here avoids a later response
    // clobbering an earlier upload's result if they raced.
    let uploaded = 0;
    for (const file of files) {
      const res = await dispatch(uploadBusinessDocument({ id, file }));
      if (uploadBusinessDocument.fulfilled.match(res)) uploaded++;
      else dispatch(pushToast((res.payload as string) || `Could not upload ${file.name}`, "error"));
    }
    setUploading(false);
    if (uploaded > 0) {
      dispatch(pushToast(uploaded === 1 ? "Document uploaded" : `${uploaded} documents uploaded`, "success"));
    }
  };

  const removeDoc = async (docId: string) => {
    if (!profile) return;
    const res = await dispatch(removeBusinessDocument({ id: profile.id, docId }));
    if (removeBusinessDocument.fulfilled.match(res)) {
      dispatch(pushToast("Document removed", "info"));
    }
  };

  if (status === "loading" && !profile) {
    return (
      <AppShell>
        <div className="grid place-items-center py-24">
          <Loader2 className="animate-spin text-brand-500" size={28} />
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <Head>
          <title>Business Profile · ClickCard</title>
        </Head>
        <div className="grid place-items-center rounded-3xl border border-dashed border-ink/15 py-16 text-center dark:border-white/10">
          <p className="font-bold text-ink dark:text-white">Business profile not found</p>
          <Link href="/business-profiles" className="mt-3 text-sm font-bold text-brand-600 hover:text-brand-700">
            Back to Business Profiles
          </Link>
        </div>
      </AppShell>
    );
  }

  const documentsSlot = (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft dark:border-white/5 dark:bg-[#262626]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-black text-ink dark:text-white">Documents</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 text-xs font-bold text-brand-600 transition hover:text-brand-700 disabled:opacity-50 dark:text-brand-300"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg"
          className="hidden"
          onChange={onFilesChosen}
        />
      </div>

      {profile.documents && profile.documents.length > 0 ? (
        <div className="mt-3">
          <DocumentGrid documents={profile.documents} onRemove={removeDoc} businessProfileId={profile.id} />
        </div>
      ) : (
        <p className="mt-3 text-xs text-ink/40 dark:text-white/40">No documents uploaded yet.</p>
      )}
    </div>
  );

  return (
    <AppShell>
      <Head>
        <title>{`${profile.company_name} · ClickCard`}</title>
      </Head>

      {/* Cancels AppShell main's own px-4/sm:px-6 so BusinessShowcase's cover
          bleeds edge to edge here — the public share page has no such
          padding, so it doesn't need (and must not get) this treatment. */}
      <div className="-mx-4 sm:-mx-6">
        <BusinessShowcase
          profile={profile}
          backHref="/business-profiles"
          onEdit={() => setModalOpen(true)}
          onShare={() => {
            if (!profile.slug) {
              dispatch(pushToast("This profile isn't shareable yet — try refreshing the page", "error"));
              return;
            }
            setShareOpen(true);
          }}
          onDelete={remove}
          documentsSlot={documentsSlot}
          onSaveAbout={saveAbout}
          savingAbout={savingAbout}
        />
      </div>

      {modalOpen && (
        <BusinessProfileModal
          profile={profile}
          saving={mutating}
          onSave={save}
          onClose={() => setModalOpen(false)}
        />
      )}

      {shareOpen && profile.slug && (
        <SharePopup
          profileUrl={`${SITE_URL}/business/${profile.slug}`}
          shareType="business"
          onClose={() => setShareOpen(false)}
        />
      )}
    </AppShell>
  );
}
