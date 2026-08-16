import TerserPlugin from "terser-webpack-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // onnxruntime-web (used by @imgly/background-removal for the Cutout
      // layout's client-only background removal) is never actually invoked
      // server-side — the call sites are dynamic imports inside a
      // useEffect — but webpack still tries to bundle it for the server
      // target during `next build`. Marking it external skips that.
      config.externals = [...(config.externals || []), "onnxruntime-web", "@imgly/background-removal"];
    }
    // We only ever run background removal on the "cpu" (wasm) device — see
    // the `removeBackground()` call in src/pages/customize/index.tsx, which
    // never passes `{ device: "gpu" }`. @imgly/background-removal still
    // *conditionally* `import()`s "onnxruntime-web/webgpu" for the gpu path,
    // and webpack bundles both branches of a dynamic import regardless of
    // which one runs. Since that branch is unreachable for us, tell webpack
    // to ignore the request entirely so its bundle is never emitted.
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^onnxruntime-web\/webgpu$/ }),
    );

    // onnxruntime-web ships its (already-minified) runtime as prebuilt ESM
    // "ort*.mjs" bundles that use top-level `import.meta`. Next's built-in
    // production minifier re-minifies every emitted .mjs asset and errors on
    // that syntax ("'import.meta' cannot be used outside of module code").
    // Next doesn't expose a public option to exclude a path from its default
    // minimizer, so swap the JS minimizer (index 0 — CSS's stays at index 1)
    // for our own TerserPlugin instance that excludes these already-minified
    // vendor bundles from being re-minified.
    if (!isServer && Array.isArray(config.optimization?.minimizer)) {
      config.optimization.minimizer[0] = new TerserPlugin({
        exclude: /ort.*\.mjs$/,
        parallel: true,
        terserOptions: {
          module: true,
          compress: { ecma: 2020 },
          mangle: { safari10: true },
        },
      });
    }
    return config;
  },
};

export default nextConfig;
