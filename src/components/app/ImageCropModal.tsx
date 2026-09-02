import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { X as CloseIcon, ZoomIn } from "lucide-react";
import Button from "@/components/ui/Button";

/** Crop a picked file to a fixed aspect/shape before it's used as an avatar or banner. */
export default function ImageCropModal({
  imageSrc,
  aspect = 1,
  cropShape = "round",
  title = "Crop photo",
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  aspect?: number;
  cropShape?: "round" | "rect";
  title?: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const confirm = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onConfirm(new File([blob], "cropped.jpg", { type: "image/jpeg" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-sm flex-col rounded-t-3xl bg-white shadow-soft-lg sm:rounded-3xl dark:bg-[#262626]"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h3 className="font-display text-base font-black text-ink dark:text-white">{title}</h3>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="relative mt-4 h-80 w-full bg-ink/5 dark:bg-black/30">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={cropShape === "rect"}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3 px-5 py-4">
          <ZoomIn size={16} className="shrink-0 text-ink/40 dark:text-white/40" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-brand-500"
            aria-label="Zoom"
          />
        </div>

        <div className="flex items-center gap-3 px-5 pb-5">
          <Button variant="outline" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button fullWidth loading={saving} onClick={confirm}>
            Use photo
          </Button>
        </div>
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getCroppedImageBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))), "image/jpeg", 0.92);
  });
}
