import type { FullProfile } from "@/types";
import LiveProfileCard from "@/components/app/LiveProfileCard";
import { useAppSelector } from "@/store/hooks";
import { displayName } from "@/lib/personal";

/** The same Linktree-style live preview card used in the Studio design tool. */
export default function ProfilePreview({
  profile,
  avatarUrl,
  username,
}: {
  profile: FullProfile;
  avatarUrl?: string;
  username?: string | null;
}) {
  const design = useAppSelector((s) => s.design);
  const name = displayName(profile.personal);
  const bio = profile.personal?.bio;
  // Discord has no profile URL, so an entry with only a username (no numeric
  // User ID yet) still shows as a non-clickable badge instead of vanishing.
  const socialLinks = (profile.social || []).filter((s) => s.url || s.username);

  return (
    <LiveProfileCard
      {...design}
      name={name}
      username={username}
      avatarUrl={avatarUrl}
      bio={bio}
      socialLinks={socialLinks}
      contact={profile.contact}
      experience={profile.experience}
      education={profile.education}
      products={profile.products}
      business={profile.business}
    />
  );
}
