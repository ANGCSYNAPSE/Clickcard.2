import Link from "next/link";
import { Hammer, ArrowLeft } from "lucide-react";

export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid place-items-center py-20 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-3xl bg-brand-500 text-white shadow-soft animate-floatSlow">
        <Hammer size={34} />
      </span>
      <h1 className="mt-6 font-display text-2xl font-black text-ink dark:text-white">
        {title}
      </h1>
      <p className="mt-2 max-w-md text-sm text-ink/55 dark:text-white/55">
        {description}
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-5 py-3 text-sm font-bold text-brand-600 transition hover:bg-brand-100 dark:bg-white/5 dark:text-white"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
    </div>
  );
}
