import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";
// Next.js Pages Router only allows global CSS to be imported from _app, so the
// StaggeredMenu stylesheet lives here rather than beside its component.
import "@/components/landing/StaggeredMenu.css";
import Providers from "@/store/Providers";

export default function App({ Component, pageProps }: AppProps) {
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
