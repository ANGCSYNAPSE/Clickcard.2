import { ArrowRight, Loader2 } from "lucide-react";

/** Orange primary action with a teal arrow cap, per the auth design. */
export default function SplitButton({
  children,
  loading,
  disabled,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="relative flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-500 pl-14 pr-14 text-[15px] font-bold tracking-tight text-white transition-all duration-200 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99] lg:h-[60px] lg:pl-16 lg:pr-16 lg:text-base"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin lg:h-5 lg:w-5" />}
      {children}
      <span className="absolute inset-y-0 right-0 grid w-[52px] place-items-center rounded-r-xl bg-candy-pink lg:w-[60px]">
        <ArrowRight size={18} />
      </span>
    </button>
  );
}
