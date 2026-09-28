import Head from "next/head";
import { useRouter } from "next/router";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Globe } from "@/components/ui/Globe";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
} satisfies Variants;

const globeVariants = {
  hidden: { scale: 0.85, opacity: 0, y: 10 },
  visible: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" as const } },
  floating: {
    y: [-4, 4],
    transition: { duration: 5, ease: "easeInOut" as const, repeat: Infinity, repeatType: "reverse" as const },
  },
} satisfies Variants;

export default function NotFoundPage() {
  const router = useRouter();
  // Real "back" (previous history entry) rather than always "/" — if there
  // is no history to go back to (e.g. the 404 was opened directly), fall
  // back to home instead of leaving the button a no-op.
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <>
      <Head>
        <title>Page not found · ClickCard</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-paper-soft px-4 py-16 dark:bg-[#1a1a1a]">
        <div className="pointer-events-none absolute inset-0 dots-bg opacity-70 dark:opacity-20" />
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

        <AnimatePresence mode="wait">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeUp}
            className="relative mx-auto w-full max-w-2xl text-center"
          >
            {/* 4 [spinning globe] 4 */}
            <motion.div className="mb-8 flex items-center justify-center gap-4 sm:gap-6" variants={fadeUp}>
              <span className="select-none font-display text-7xl font-black text-ink/80 sm:text-8xl dark:text-white/80">
                4
              </span>
              <motion.div
                className="relative h-24 w-24 shrink-0 sm:h-32 sm:w-32"
                variants={globeVariants}
                animate={["visible", "floating"]}
              >
                <Globe theme="light" />
                <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_0%,transparent_70%)]" />
              </motion.div>
              <span className="select-none font-display text-7xl font-black text-ink/80 sm:text-8xl dark:text-white/80">
                4
              </span>
            </motion.div>

            <h1 className="font-display text-4xl font-black leading-[1.05] text-ink sm:text-5xl dark:text-white">
              Ups! Lost in space
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base text-ink/60 dark:text-white/55">
              We couldn&apos;t find the page you&apos;re looking for. It might have
              been moved or deleted.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-bold text-white shadow-soft-lg transition hover:opacity-90 dark:bg-white dark:text-ink"
              >
                <ArrowLeft size={16} /> Go back
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
