const WORDS = [
  "One link",
  "Digital card",
  "Dynamic QR",
  "PDF resume",
  "Storefront",
  "Live analytics",
  "Referral rewards",
  "NFC ready",
];

export default function Marquee() {
  return (
    <div className="relative z-10 border-y border-line bg-dark py-4">
      <div className="marquee-pause flex overflow-hidden">
        <div className="flex min-w-full shrink-0 animate-marquee items-center text-sm font-bold uppercase tracking-[0.18em] text-white/80">
          {[0, 1].map((dup) =>
            WORDS.map((w) => (
              <span
                key={`${dup}-${w}`}
                className="mx-6 flex items-center gap-6 whitespace-nowrap"
              >
                {w}
                <span className="text-primary">✦</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
