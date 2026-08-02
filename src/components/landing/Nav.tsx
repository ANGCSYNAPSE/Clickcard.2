"use client";

import StaggeredMenu, {
  type StaggeredMenuItem,
  type StaggeredMenuSocialItem,
} from "./StaggeredMenu";
import { LOGIN_URL, WEBAPP_URL } from "@/lib/site";
import Img1 from "../../images/Untitled design (1).png";

const ITEMS: StaggeredMenuItem[] = [
  { label: "Features", ariaLabel: "Jump to features", link: "/#features" },
  { label: "Showcase", ariaLabel: "Jump to showcase", link: "/#showcase" },
  { label: "Wall of love", ariaLabel: "Read what people say", link: "/#love" },
  { label: "Pricing", ariaLabel: "See pricing", link: "/pricing" },
];

// The panel's bottom row. Upstream calls this the "socials" slot; we have no
// social handles to publish yet, so it carries the two CTAs the old pill nav
// used to show inline — otherwise they'd disappear from the site entirely.
const ACTIONS: StaggeredMenuSocialItem[] = [
  { label: "Log in", link: LOGIN_URL },
  { label: "Join the Beta", link: WEBAPP_URL },
];

export default function Nav() {
  return (
    <StaggeredMenu
      isFixed
      position="right"
      items={ITEMS}
      socialItems={ACTIONS}
      socialsTitle="Get started"
      displaySocials
      displayItemNumbering
      logoUrl={Img1.src}
      logoAlt="ClickCard logo"
      /* Brand palette: the two prelayers sweep in warm paper-tint then the
         secondary teal before the paper panel lands, so the reveal reads as
         ClickCard rather than the stock purple. Primary orange is the accent
         on item hover and the item numbering. The toggle stays dark green in
         both states because the panel behind it is light. */
      colors={["#F4E2C4", "#069494"]}
      accentColor="#BE5103"
      menuButtonColor="#0B2E2B"
      openMenuButtonColor="#0B2E2B"
    />
  );
}
