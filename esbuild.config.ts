import * as esbuild from "esbuild"

interface BuildConfigOptions {
  src: string
  dst: string
  metafile?: boolean
}

// Development configuration: Optimized for fast builds during development.
// No minification, includes sourcemaps for debugging.
//* see https://esbuild.github.io/getting-started/#build-scripts for more details.
export const transpileOnlyConfig = ({
  src,
  dst,
  metafile = false,
}: BuildConfigOptions): esbuild.BuildOptions => ({
  entryPoints: [src],
  outfile: dst,
  bundle: true,
  platform: "node", // Target Node.js environment.
  target: "node22",
  format: "cjs", // Output CommonJS modules, compatible with Node.js
  sourcemap: "external", // Generate external .map files
  minify: false, // Keep code readable and unoptimized for faster builds in development.
  tsconfig: "tsconfig.json",
  external: ["pg-native", "@prisma/client"], // Exclude these from the bundle, as they are Node.js native or runtime dependencies.
  packages: "external", // Exclude all node_modules
  define: {
    // Replace `process.env.NODE_ENV` in the code with the current environment.
    // Defaults to "development" if not set, ensuring consistent behavior.
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
  },
  metafile,
  write: true, // Ensure the output is written to disk (default behavior).
})

// Production configuration: Optimized for deployment.
// Includes minification, protects specific variables, and generates a metafile.
export const bundleConfig = ({
  src,
  dst,
  metafile = false,
}: BuildConfigOptions): esbuild.BuildOptions => ({
  entryPoints: [src],
  outfile: dst,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs", 
  sourcemap: "external", 
  minify: true, // Enable minification for production
  tsconfig: "tsconfig.json",
  external: ["pg-native", "@prisma/client"],
  packages: "external",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  // Protect variable names during minification, addresses the ISSUE requirement to avoid aliasing these critical variables.
  keepNames: true, // Prevent function and variable names from being shortened, ensuring debugging and stack traces remain clear.
  reserveProps: /serverProps|serverPaths/, // Protect properties matching `serverProps` or `serverPaths` from being renamed.
  metafile, // generate a JSON file (`esbuild-meta.json`) for bundle analysis.
  write: true,
})

/**
 * Builds the project using esbuild based on the provided configuration options.
 * @param options BuildConfigOptions - Configuration options for the build process.
 */
export async function build(options: BuildConfigOptions) {
  const config =
    process.env.NODE_ENV === "production"
      ? bundleConfig({ ...options, metafile: true }) // Always generate metafile in production
      : transpileOnlyConfig(options)

  try {
    const result = await esbuild.build(config)
    console.log(`Build completed: ${options.dst}`)

    if (result.metafile) {
      const fs = await import("fs")
      fs.writeFileSync("esbuild-meta.json", JSON.stringify(result.metafile))
      console.log("Metafile generated: esbuild-meta.json")
    }
  } catch (error) {
    console.error("Build failed:", error)
    process.exit(1)
  }
}

// CLI execution: Run the build function if the script is executed directly (e.g., `tsx esbuild.config.ts`).
if (require.main === module) {
  build({
    src: "src/index.ts",
    dst: "dist/server.js",
    metafile: process.argv.includes("--metafile"),
  })
}