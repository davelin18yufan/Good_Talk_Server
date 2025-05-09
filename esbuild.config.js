import { build, transform } from "esbuild"
// The two most commonly-used esbuild APIs are build and transform. Each is described below at a high level, followed by documentation for each individual API option.

// see https://esbuild.github.io/getting-started/#build-scripts for more details
await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  outfile: "dist/server.js",
  sourcemap: true,
  minify: process.env.NODE_ENV === "production",
  tsconfig: "tsconfig.json",
  external: ["pg-native"], // 排除 pg-native，因為它需要本地編譯
  ignoreAnnotations: process.env.NODE_ENV === "production", // 忽略註解
  treeShaking: true,
}).catch(() => process.exit(1))
