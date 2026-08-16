"use client";

import { useEffect, useState } from "react";
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

/** Watches every `[data-nav-theme="dark"]` section (dark CTA/showcase/footer
 * blocks) and reports whether one is currently passing behind the fixed
 * header, so the hamburger icon can flip to white for contrast.
 *
 * Uses a plain scroll/resize check against a fixed pixel reference point
 * (not an IntersectionObserver rootMargin percentage) because a percentage
 * margin is relative to viewport height — on a short mobile viewport the
 * math collapses to a zero/negative-height strip and never fires. Measuring
 * getBoundingClientRect() against an absolute pixel point works the same at
 * every viewport size. */
function useIsOverDarkSection() {
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-nav-theme="dark"]'),
    );
    if (!targets.length) return;

    // A point inside the header's vertical span (header is ~52-56px tall).
    const probeY = 32;
    let ticking = false;

    const check = () => {
      ticking = false;
      const isDark = targets.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= probeY && r.bottom >= probeY;
      });
      setOverDark(isDark);
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return overDark;
}

/** Mirrors the `max-width: 640px` breakpoint StaggeredMenu.css treats as mobile. */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export default function Nav() {
  const overDark = useIsOverDarkSection();
  const isMobile = useIsMobile();
  // On mobile the toggle stays a fixed color regardless of what's behind the
  // header — only desktop/tablet gets the dark-section white-icon swap.
  const showWhiteIcon = overDark && !isMobile;

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
         on item hover and the item numbering. On desktop/tablet the toggle
         is dark green over light sections and switches to white while a
         dark section (CTA, showcase, footer) passes behind the fixed
         header; on mobile it stays dark green throughout. It always goes
         back to dark green once the panel opens, since the panel itself is
         light paper. */
      colors={["#F4E2C4", "#069494"]}
      accentColor="#BE5103"
      menuButtonColor={showWhiteIcon ? "#FFFFFF" : "#0B2E2B"}
      openMenuButtonColor="#0B2E2B"
    />
  );
}
