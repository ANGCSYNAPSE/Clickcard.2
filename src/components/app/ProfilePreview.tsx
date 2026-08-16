import type { FullProfile } from "@/types";
import LiveProfileCard from "@/components/app/LiveProfileCard";
import { useAppSelector } from "@/store/hooks";

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
  const name = profile.personal?.fullName || "Your name";
  const bio = profile.personal?.bio;
  const socialLinks = (profile.social || []).filter((s) => s.url);

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
