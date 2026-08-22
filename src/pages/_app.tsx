import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import "@/styles/globals.css";
// Next.js Pages Router only allows global CSS to be imported from _app, so the
// StaggeredMenu stylesheet lives here rather than beside its component.
import "@/components/landing/StaggeredMenu.css";
import Providers from "@/store/Providers";
import { enableDevAdmin, disableDevAdmin } from "@/lib/devAdmin";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Expose dev admin functions to console in development
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      (window as any).enableAdmin = enableDevAdmin;
      (window as any).disableAdmin = disableDevAdmin;
      console.log(
        "%c✨ Dev Mode Active",
        "color: #BE5103; font-weight: bold; font-size: 14px;"
      );
      console.log(
        "%cRun enableAdmin() to access admin panel",
        "color: #069494; font-size: 12px;"
      );
    }
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Providers>
        <div className="font-sans min-h-screen bg-paper text-dark antialiased">
          <Component {...pageProps} />
        </div>
      </Providers>
    </>
  );
}
