import * as esbuild from "esbuild";
import copy from "esbuild-plugin-copy";

await esbuild.build({
  entryPoints: ["server/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  platform: "node",
  minify: true,
  target: ["node22"],
  plugins: [
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["server/template/*"],
        to: ["dist/template"],
      },
    }),
  ],
});
