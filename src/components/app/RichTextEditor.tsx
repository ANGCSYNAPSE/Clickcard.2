import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import { FONT_ITEMS, loadGoogleFont } from "@/lib/fonts";

/** Tiptap ships Color/TextStyle but no font-size mark — this adds one the
 * same way, via a "fontSize" attribute on the shared TextStyle mark. */
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: { fontSize?: string | null }) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

/** Basic, always-available system fonts — no network load needed. */
const SYSTEM_FONTS = [
  { label: "Default", value: "" },
  { label: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Garamond", value: "Garamond, serif" },
  { label: "Palatino", value: "'Palatino Linotype', Palatino, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
  { label: "Impact", value: "Impact, sans-serif" },
];

/** The same Google Fonts catalog used by the CV/Customize font pickers —
 * loaded on demand (only when actually selected), same as there. */
const GOOGLE_FONTS = FONT_ITEMS.map((f) => ({ label: f.name, value: `"${f.name}", sans-serif` }));

const ALL_FONTS = [...SYSTEM_FONTS, ...GOOGLE_FONTS];

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"];

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      ImageExtension,
      Placeholder.configure({ placeholder: placeholder || "Write something…" }),
    ],
    content: value || "",
    autofocus: autoFocus ? "end" : false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-[160px] max-w-none px-4 py-3 text-sm leading-relaxed text-ink dark:text-white focus:outline-none " +
          "[&_p]:mb-2 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-black [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold " +
          "[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 " +
          "[&_a]:text-brand-600 [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl",
      },
    },
  });

  // Keep the editor in sync if `value` is replaced from outside (e.g. Cancel
  // resetting the draft back to the saved content).
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-brand-100 bg-white dark:border-white/10 dark:bg-white/5">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  // ── Synced state (colour + font-size) ──────────────────────────────────────
  const isDark =
    typeof window !== "undefined" && document.documentElement.classList.contains("dark");
  const [color, setColor] = useState(isDark ? "#ffffff" : "#0b2e2b");
  const [fontSize, setFontSize] = useState("16px");
  const [activeFont, setActiveFont] = useState("Font");

  // Sync toolbar controls whenever the cursor moves or selection changes.
  useEffect(() => {
    const update = () => {
      // Color
      const editorColor = editor.getAttributes("textStyle").color as string | undefined;
      if (editorColor && editorColor !== color) setColor(editorColor);

      // Font size
      const editorSize = editor.getAttributes("textStyle").fontSize as string | undefined;
      setFontSize(editorSize || "16px");

      // Font family — find label for current value
      const editorFont = editor.getAttributes("textStyle").fontFamily as string | undefined;
      if (editorFont) {
        const found = ALL_FONTS.find((f) => f.value === editorFont);
        setActiveFont(found ? found.label : "Font");
      } else {
        setActiveFont("Font");
      }
    };

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Prevent the toolbar button from stealing focus/selection from the editor. */
  const keepFocus = (e: React.MouseEvent) => e.preventDefault();

  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  /** Toolbar button class — highlights when the mark/node is active. */
  const btn = (active: boolean) =>
    `grid h-8 w-8 shrink-0 place-items-center rounded-lg transition ${
      active
        ? "bg-brand-100 text-brand-700 dark:bg-white/15 dark:text-white"
        : "text-ink/60 hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
    }`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 bg-paper-soft/60 px-2 py-1.5 dark:border-white/10 dark:bg-black/20">
      {/* ── Font family ── */}
      <FontFamilyDropdown
        activeLabel={activeFont}
        onSelect={(v) => {
          if (!v) {
            editor.chain().focus().unsetFontFamily().run();
            return;
          }
          // Google Fonts entries are wrapped in double quotes — load on demand.
          const match = /^"([^"]+)"/.exec(v);
          if (match) loadGoogleFont(match[1]);
          editor.chain().focus().setFontFamily(v).run();
        }}
      />

      {/* ── Font size ── */}
      <select
        aria-label="Font size"
        className="h-8 rounded-lg border border-ink/10 bg-white px-1.5 text-xs font-medium text-ink outline-none dark:border-white/10 dark:bg-[#262626] dark:text-white"
        value={fontSize}
        onChange={(e) => {
          const v = e.target.value;
          if (v) (editor.commands as any).setFontSize(v);
          else (editor.commands as any).unsetFontSize();
          editor.view.focus();
        }}
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <span className="mx-1 h-5 w-px bg-ink/10 dark:bg-white/10" />

      {/* ── Bold / Italic / Underline ── */}
      <button
        type="button"
        aria-label="Bold"
        onMouseDown={keepFocus}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
      >
        <Bold size={15} />
      </button>
      <button
        type="button"
        aria-label="Italic"
        onMouseDown={keepFocus}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
      >
        <Italic size={15} />
      </button>
      <button
        type="button"
        aria-label="Underline"
        onMouseDown={keepFocus}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btn(editor.isActive("underline"))}
      >
        <UnderlineIcon size={15} />
      </button>

      {/* ── Color picker ── */}
      <label className="relative grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-ink/60 hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10">
        <span
          className="h-4 w-4 rounded-full border border-ink/20 dark:border-white/20"
          style={{ backgroundColor: color }}
        />
        <input
          type="color"
          aria-label="Text color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            editor.chain().focus().setColor(e.target.value).run();
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>

      <span className="mx-1 h-5 w-px bg-ink/10 dark:bg-white/10" />

      {/* ── Alignment ── */}
      <button
        type="button"
        aria-label="Align left"
        onMouseDown={keepFocus}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={btn(editor.isActive({ textAlign: "left" }))}
      >
        <AlignLeft size={15} />
      </button>
      <button
        type="button"
        aria-label="Align center"
        onMouseDown={keepFocus}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={btn(editor.isActive({ textAlign: "center" }))}
      >
        <AlignCenter size={15} />
      </button>
      <button
        type="button"
        aria-label="Align right"
        onMouseDown={keepFocus}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={btn(editor.isActive({ textAlign: "right" }))}
      >
        <AlignRight size={15} />
      </button>
      <button
        type="button"
        aria-label="Align justify"
        onMouseDown={keepFocus}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={btn(editor.isActive({ textAlign: "justify" }))}
      >
        <AlignJustify size={15} />
      </button>

      {/* ── Lists ── */}
      <button
        type="button"
        aria-label="Bullet list"
        onMouseDown={keepFocus}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
      >
        <List size={15} />
      </button>
      <button
        type="button"
        aria-label="Ordered list"
        onMouseDown={keepFocus}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
      >
        <ListOrdered size={15} />
      </button>

      <span className="mx-1 h-5 w-px bg-ink/10 dark:bg-white/10" />

      {/* ── Link / Image ── */}
      <button
        type="button"
        aria-label="Insert link"
        onMouseDown={keepFocus}
        onClick={setLink}
        className={btn(editor.isActive("link"))}
      >
        <LinkIcon size={15} />
      </button>
      <button
        type="button"
        aria-label="Insert image"
        onMouseDown={keepFocus}
        onClick={addImage}
        className={btn(false)}
      >
        <ImageIcon size={15} />
      </button>
    </div>
  );
}

/** Custom dropdown instead of a plain <select> — the browser's native
 * option-list popup can't be restyled (its scrollbar included), and with
 * ~70 fonts across two groups it always shows one. */
function FontFamilyDropdown({
  activeLabel,
  onSelect,
}: {
  activeLabel: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const pick = (value: string) => {
    onSelect(value);
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()} // don't blur the editor
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-8 max-w-[90px] items-center gap-1 rounded-lg border border-ink/10 bg-white pl-1.5 pr-1 text-xs font-medium text-ink outline-none dark:border-white/10 dark:bg-[#262626] dark:text-white"
        title={activeLabel}
      >
        <span className="flex-1 truncate">{activeLabel}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-ink/40 transition-transform dark:text-white/40 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="no-scrollbar absolute left-0 top-[calc(100%+4px)] z-50 max-h-64 w-52 overflow-y-auto rounded-xl border border-ink/10 bg-white p-1 shadow-lift dark:border-white/10 dark:bg-[#262626]"
        >
          <li className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-ink/35 dark:text-white/35">
            Basic
          </li>
          {SYSTEM_FONTS.map((f) => (
            <FontOption
              key={f.label}
              label={f.label}
              active={activeLabel === f.label}
              onClick={() => pick(f.value)}
            />
          ))}
          <li className="mt-1 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-ink/35 dark:text-white/35">
            More fonts
          </li>
          {GOOGLE_FONTS.map((f) => (
            <FontOption
              key={f.label}
              label={f.label}
              active={activeLabel === f.label}
              onClick={() => pick(f.value)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FontOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`block w-full truncate rounded-lg px-2 py-1.5 text-left text-xs font-medium transition ${
          active
            ? "bg-brand-100 text-brand-700 dark:bg-white/15 dark:text-white"
            : "text-ink hover:bg-brand-50 dark:text-white dark:hover:bg-white/10"
        }`}
      >
        {label}
      </button>
    </li>
  );
}
