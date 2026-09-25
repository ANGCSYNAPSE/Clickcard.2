import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Palette,
  Sparkles,
  Image as ImageIcon,
  Square,
  Settings2,
  RotateCcw,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
} from "lucide-react";
import Button from "@/components/ui/Button";
import QRPreview, { type QRPreviewHandle } from "@/components/qr/QRPreview";
import { useAppDispatch } from "@/store/hooks";
import { pushToast } from "@/store/slices/uiSlice";
import { qrDesignService } from "@/services/qrDesignService";
import {
  DEFAULT_QR_SETTINGS,
  DOT_TYPES,
  CORNER_SQUARE_TYPES,
  CORNER_DOT_TYPES,
  COLOR_PRESETS,
  GRADIENT_PRESETS,
  MAX_LOGO_SIZE,
  MIN_LOGO_SIZE,
  isValidHex,
  validateQrSettings,
  compressLogoToDataUrl,
  LOGO_ACCEPT,
  type QrDesignSettings,
  type QrDotType,
} from "@/lib/qrStyling";

const SECTION_CLASS = "rounded-3xl border border-ink/[0.06] bg-white p-5 dark:border-white/[0.06] dark:bg-[#262626]";
const SECTION_TITLE_CLASS = "flex items-center gap-2 text-sm font-black text-ink dark:text-white";

/** A tiny 3×3 grid rendered with the same shape rules as the real pattern, so the swatch reads as a genuine preview rather than a generic icon. */
function PatternSwatch({ type }: { type: QrDotType }) {
  const shapeClass =
    type === "square"
      ? "rounded-none"
      : type === "dots"
      ? "rounded-full"
      : type === "rounded"
      ? "rounded-[3px]"
      : type === "extra-rounded"
      ? "rounded-[5px]"
      : type === "classy"
      ? "rounded-tl-[5px] rounded-br-[5px]"
      : "rounded-tl-[6px] rounded-br-[6px] rounded-tr-[1px] rounded-bl-[1px]";
  return (
    <div className="grid grid-cols-3 gap-[3px]">
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className={`h-2 w-2 bg-current ${shapeClass}`} />
      ))}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Palette; title: string }) {
  return (
    <div className={SECTION_TITLE_CLASS}>
      <Icon size={15} className="text-brand-500" />
      {title}
    </div>
  );
}

function HexField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const valid = isValidHex(draft);
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-ink/60 dark:text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isValidHex(draft) ? draft : "#000000"}
          onChange={(e) => {
            setDraft(e.target.value);
            onChange(e.target.value);
          }}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-ink/10 bg-transparent p-0 dark:border-white/10"
        />
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (isValidHex(e.target.value)) onChange(e.target.value);
          }}
          className={`h-9 w-full rounded-lg border bg-mist px-2.5 text-xs font-mono font-semibold text-ink outline-none dark:bg-white/[0.04] dark:text-white ${
            valid ? "border-ink/10 dark:border-white/10" : "border-rose-300 dark:border-rose-500/50"
          }`}
        />
      </div>
    </label>
  );
}

export default function QRCustomizer({
  data,
  fileName,
  onSaved,
}: {
  data: string;
  fileName: string;
  onSaved?: (settings: QrDesignSettings) => void;
}) {
  const dispatch = useAppDispatch();
  const [settings, setSettings] = useState<QrDesignSettings>(DEFAULT_QR_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showReadyBanner, setShowReadyBanner] = useState(false);
  const previewRef = useRef<QRPreviewHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let cancelled = false;
    qrDesignService
      .getMine()
      .then(({ data: res }) => {
        if (cancelled) return;
        if (res.data?.settings) setSettings({ ...DEFAULT_QR_SETTINGS, ...res.data.settings });
        // Only reopen the banner if this design was actually saved less
        // than a minute ago — otherwise every time you revisit or reopen
        // this panel, the mount-time effect would show it again, which
        // looked like it "never" went away.
        const savedAt = res.data?.updatedAt ? new Date(res.data.updatedAt).getTime() : 0;
        const remaining = 60_000 - (Date.now() - savedAt);
        if (savedAt && remaining > 0) {
          setShowReadyBanner(true);
          readyTimerRef.current = setTimeout(() => setShowReadyBanner(false), remaining);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(readyTimerRef.current), []);

  const patch = (p: Partial<QrDesignSettings>) => setSettings((s) => ({ ...s, ...p }));

  const warnings = useMemo(() => validateQrSettings(settings), [settings]);
  // The reassuring "ready to scan" note only matters right after you create
  // or save a design — left up indefinitely it's just clutter. Actual
  // problems (the "warning" level) stay visible the whole time.
  const actionableWarnings = warnings.filter((w) => w.level === "warning");

  const save = async () => {
    setSaving(true);
    try {
      await qrDesignService.saveMine(settings);
      dispatch(pushToast("QR design saved", "success"));
      onSaved?.(settings);
      setShowReadyBanner(true);
      clearTimeout(readyTimerRef.current);
      readyTimerRef.current = setTimeout(() => setShowReadyBanner(false), 60_000);
    } catch {
      dispatch(pushToast("Could not save QR design", "error"));
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setSettings(DEFAULT_QR_SETTINGS);

  const onLogoFile = async (file: File) => {
    setUploadingLogo(true);
    try {
      const dataUrl = await compressLogoToDataUrl(file);
      patch({ logoUrl: dataUrl });
    } catch (e) {
      dispatch(pushToast(e instanceof Error ? e.message : "Could not process that image", "error"));
    } finally {
      setUploadingLogo(false);
    }
  };

  const download = async (extension: "png" | "svg") => {
    try {
      await previewRef.current?.download(extension);
    } catch {
      dispatch(pushToast("Download failed — please try again", "error"));
    }
  };

  if (loading) {
    return (
      <div className={`${SECTION_CLASS} grid place-items-center py-16`}>
        <Loader2 className="animate-spin text-brand-500" size={24} />
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      {/* controls */}
      <div className="space-y-4 lg:order-1">
        {/* pattern */}
        <div className={SECTION_CLASS}>
          <SectionHeader icon={Square} title="Pattern style" />
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {DOT_TYPES.map((d) => (
              <button
                key={d.value}
                onClick={() => patch({ patternStyle: d.value })}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition ${
                  settings.patternStyle === d.value
                    ? "border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-white"
                    : "border-ink/10 text-ink/60 hover:border-brand-200 dark:border-white/10 dark:text-white/60"
                }`}
              >
                <PatternSwatch type={d.value} />
                <span className="text-[10px] font-bold">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* colors */}
        <div className={SECTION_CLASS}>
          <SectionHeader icon={Palette} title="Colors" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <HexField label="QR color" value={settings.fgColor} onChange={(v) => patch({ fgColor: v })} />
            <HexField label="Background" value={settings.bgColor} onChange={(v) => patch({ bgColor: v })} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                title={p.name}
                onClick={() => patch({ fgColor: p.fg, bgColor: p.bg, gradient: { ...settings.gradient, enabled: false } })}
                className="h-8 w-8 shrink-0 rounded-full border-2 border-white shadow-soft ring-1 ring-ink/10 transition hover:scale-110 dark:ring-white/10"
                style={{ background: `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)` }}
              />
            ))}
            <button
              onClick={() => patch({ fgColor: DEFAULT_QR_SETTINGS.fgColor, bgColor: DEFAULT_QR_SETTINGS.bgColor })}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-ink/5 px-3 text-[11px] font-bold text-ink/60 dark:bg-white/10 dark:text-white/60"
            >
              <RotateCcw size={11} /> Reset
            </button>
          </div>
        </div>

        {/* gradient */}
        <div className={SECTION_CLASS}>
          <div className="flex items-center justify-between">
            <SectionHeader icon={Sparkles} title="Gradient" />
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.gradient.enabled}
                onChange={(e) => patch({ gradient: { ...settings.gradient, enabled: e.target.checked } })}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-ink/15 transition peer-checked:bg-brand-500 dark:bg-white/15" />
              <div className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
          {settings.gradient.enabled && (
            <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                {(["linear", "radial"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => patch({ gradient: { ...settings.gradient, type: t } })}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition ${
                      settings.gradient.type === t
                        ? "bg-ink text-white dark:bg-white dark:text-ink"
                        : "bg-ink/5 text-ink/60 dark:bg-white/10 dark:text-white/60"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <HexField
                  label="Start"
                  value={settings.gradient.start}
                  onChange={(v) => patch({ gradient: { ...settings.gradient, start: v } })}
                />
                <HexField
                  label="End"
                  value={settings.gradient.end}
                  onChange={(v) => patch({ gradient: { ...settings.gradient, end: v } })}
                />
              </div>
              {settings.gradient.type === "linear" && (
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-ink/60 dark:text-white/60">
                    Angle — {settings.gradient.angle}°
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={settings.gradient.angle}
                    onChange={(e) => patch({ gradient: { ...settings.gradient, angle: Number(e.target.value) } })}
                    className="w-full accent-brand-500"
                  />
                </label>
              )}
              <div className="flex flex-wrap gap-2">
                {GRADIENT_PRESETS.map((g) => (
                  <button
                    key={g.name}
                    title={g.name}
                    onClick={() => patch({ gradient: { ...settings.gradient, enabled: true, start: g.start, end: g.end } })}
                    className="h-8 w-8 shrink-0 rounded-full border-2 border-white shadow-soft ring-1 ring-ink/10 transition hover:scale-110 dark:ring-white/10"
                    style={{ background: `linear-gradient(135deg, ${g.start}, ${g.end})` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* logo */}
        <div className={SECTION_CLASS}>
          <SectionHeader icon={ImageIcon} title="Center logo" />
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-dashed border-ink/15 bg-mist dark:border-white/15 dark:bg-white/[0.04]">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoUrl} alt="" className="h-full w-full rounded-2xl object-contain p-1.5" />
              ) : (
                <ImageIcon size={20} className="text-ink/30 dark:text-white/30" />
              )}
            </div>
            <div className="flex flex-1 flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={LOGO_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onLogoFile(file);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} loading={uploadingLogo}>
                <Upload size={14} /> {settings.logoUrl ? "Replace" : "Upload"}
              </Button>
              {settings.logoUrl && (
                <Button variant="ghost" size="sm" onClick={() => patch({ logoUrl: undefined })}>
                  <X size={14} /> Remove
                </Button>
              )}
            </div>
          </div>
          {settings.logoUrl && (
            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-bold text-ink/60 dark:text-white/60">
                Logo size — {Math.round(settings.logoSize * 100)}%
              </span>
              <input
                type="range"
                min={MIN_LOGO_SIZE * 100}
                max={MAX_LOGO_SIZE * 100}
                value={settings.logoSize * 100}
                onChange={(e) => patch({ logoSize: Number(e.target.value) / 100 })}
                className="w-full accent-brand-500"
              />
            </label>
          )}
        </div>

        {/* eye styles */}
        <div className={SECTION_CLASS}>
          <SectionHeader icon={Square} title="Eye (corner) styles" />
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-xs font-bold text-ink/60 dark:text-white/60">Outer shape</span>
              <div className="flex flex-wrap gap-2">
                {CORNER_SQUARE_TYPES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => patch({ cornerSquareType: c.value })}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      settings.cornerSquareType === c.value
                        ? "bg-ink text-white dark:bg-white dark:text-ink"
                        : "bg-ink/5 text-ink/60 dark:bg-white/10 dark:text-white/60"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-bold text-ink/60 dark:text-white/60">Inner shape</span>
              <div className="flex flex-wrap gap-2">
                {CORNER_DOT_TYPES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => patch({ cornerDotType: c.value })}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      settings.cornerDotType === c.value
                        ? "bg-ink text-white dark:bg-white dark:text-ink"
                        : "bg-ink/5 text-ink/60 dark:bg-white/10 dark:text-white/60"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-xs font-bold text-ink/70 dark:text-white/70">
            <input
              type="checkbox"
              checked={settings.useCustomCornerColor}
              onChange={(e) => patch({ useCustomCornerColor: e.target.checked })}
              className="h-4 w-4 accent-brand-500"
            />
            Use a separate color for the eyes
          </label>
          {settings.useCustomCornerColor && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <HexField label="Outer color" value={settings.cornerSquareColor} onChange={(v) => patch({ cornerSquareColor: v })} />
              <HexField label="Inner color" value={settings.cornerDotColor} onChange={(v) => patch({ cornerDotColor: v })} />
            </div>
          )}
        </div>

        {/* advanced */}
        <div className={SECTION_CLASS}>
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <SectionHeader icon={Settings2} title="Advanced" />
            <span className="text-xs font-bold text-ink/40 dark:text-white/40">{advancedOpen ? "Hide" : "Show"}</span>
          </button>
          {advancedOpen && (
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-ink/70 dark:text-white/70">
                <input
                  type="checkbox"
                  checked={settings.hideBackgroundDots}
                  onChange={(e) => patch({ hideBackgroundDots: e.target.checked })}
                  className="h-4 w-4 accent-brand-500"
                />
                Hide modules behind the logo
              </label>
              {settings.logoUrl && (
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-ink/60 dark:text-white/60">
                    Logo padding — {settings.logoMargin}px
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={24}
                    value={settings.logoMargin}
                    onChange={(e) => patch({ logoMargin: Number(e.target.value) })}
                    className="w-full accent-brand-500"
                  />
                </label>
              )}
              <p className="text-[11px] leading-relaxed text-ink/45 dark:text-white/45">
                Error correction is automatically raised to level H whenever a logo is set, so the QR stays
                readable even with part of the pattern covered. The quiet zone (blank margin) around the code
                is preserved and can't be removed, to protect scan reliability.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw size={15} /> Reset all
          </Button>
          <Button onClick={save} loading={saving}>
            <Save size={15} /> Save
          </Button>
        </div>
      </div>

      {/* preview */}
      <div className="lg:order-2">
        <div className={`${SECTION_CLASS} sticky top-20 flex flex-col items-center gap-4 text-center`}>
          <div className="rounded-2xl bg-white p-3 shadow-soft ring-1 ring-ink/5 dark:ring-white/10">
            <QRPreview ref={previewRef} data={data} settings={settings} size={220} fileName={fileName} />
          </div>
          <p className="truncate text-xs font-mono text-ink/45 dark:text-white/45">{data}</p>

          <div className="w-full space-y-1.5 text-left">
            {actionableWarnings.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {w.message}
              </div>
            ))}
            {showReadyBanner && actionableWarnings.length === 0 && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                Your QR code is ready to scan.
              </div>
            )}
          </div>

          <div className="grid w-full grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => download("png")}>
              <Download size={14} /> PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => download("svg")}>
              <Download size={14} /> SVG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
