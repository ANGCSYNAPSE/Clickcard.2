"use client";

import Img1 from "../../images/img1.png";
import Img2 from "../../images/img2.png";
import Img3 from "../../images/img3.png";
import Img4 from "../../images/img4.png";

type Card = { src: string; heightClass: string };

// Fixed pixel heights don't scale down for narrow screens, so each card's
// height is a responsive Tailwind class instead — shorter on mobile,
// taller from sm/lg up.
const H = "h-32 sm:h-40 lg:h-80";

const COLUMN_1: Card[] = [
  { src: Img1.src, heightClass: H },
  { src: Img2.src, heightClass: H },
  { src: Img3.src, heightClass: H },
  { src: Img4.src, heightClass: H },
  { src: Img1.src, heightClass: H },
];

const COLUMN_2: Card[] = [
  { src: Img2.src, heightClass: H },
  { src: Img3.src, heightClass: H },
  { src: Img4.src, heightClass: H },
  { src: Img1.src, heightClass: H },
  { src: Img2.src, heightClass: H },
];

const COLUMN_3: Card[] = [
  { src: Img3.src, heightClass: H },
  { src: Img4.src, heightClass: H },
  { src: Img1.src, heightClass: H },
  { src: Img2.src, heightClass: H },
  { src: Img3.src, heightClass: H },
];

const COLUMNS: { items: Card[]; duration: string; offset: boolean; reverse: boolean }[] = [
  { items: COLUMN_1, duration: "40s", offset: false, reverse: false },
  { items: COLUMN_2, duration: "50s", offset: true, reverse: true },
  { items: COLUMN_3, duration: "40s", offset: false, reverse: false },
];

function ImageCard({ src, heightClass }: Card) {
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-line bg-white shadow-soft ${heightClass}`}
    >
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

export default function TemplateCarousel() {
  return (
    <div className="relative mx-auto h-[480px] w-full overflow-hidden sm:h-[560px] lg:h-[590px]">
      {/* blur masks so rows fade into a soft blur at the top and bottom edges */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 backdrop-blur-md"
        style={{
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 backdrop-blur-md"
        style={{
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />

      <div className="grid h-full grid-cols-3 gap-3">
        {COLUMNS.map((col, ci) => (
          <div key={ci} className="marquee-pause overflow-hidden">
            <div className={col.offset ? "pt-16" : ""}>
              <div
                className="flex flex-col gap-3 animate-marquee-y"
                style={{
                  animationDuration: col.duration,
                  animationDirection: col.reverse ? "reverse" : "normal",
                }}
              >
                {[0, 1].map((dup) =>
                  col.items.map((card, i) => (
                    <ImageCard key={`${dup}-${ci}-${i}`} {...card} />
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
