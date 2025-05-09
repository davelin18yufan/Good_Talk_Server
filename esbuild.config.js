"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleConfig = exports.transpileOnlyConfig = void 0;
exports.build = build;
var esbuild = require("esbuild");
// Development configuration: Optimized for fast builds during development.
// No minification, includes sourcemaps for debugging.
//* see https://esbuild.github.io/getting-started/#build-scripts for more details.
var transpileOnlyConfig = function (_a) {
    var src = _a.src, dst = _a.dst, _b = _a.metafile, metafile = _b === void 0 ? false : _b;
    return ({
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
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
        },
        metafile: metafile,
        write: true, // Ensure the output is written to disk (default behavior).
    });
};
exports.transpileOnlyConfig = transpileOnlyConfig;
// Production configuration: Optimized for deployment.
// Includes minification, protects specific variables, and generates a metafile.
var bundleConfig = function (_a) {
    var src = _a.src, dst = _a.dst, _b = _a.metafile, metafile = _b === void 0 ? false : _b;
    return ({
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
        metafile: metafile, // generate a JSON file (`esbuild-meta.json`) for bundle analysis.
        write: true,
    });
};
exports.bundleConfig = bundleConfig;
/**
 * Builds the project using esbuild based on the provided configuration options.
 * @param options BuildConfigOptions - Configuration options for the build process.
 */
function build(options) {
    return __awaiter(this, void 0, void 0, function () {
        var config, result, fs, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = process.env.NODE_ENV === "production"
                        ? (0, exports.bundleConfig)(__assign(__assign({}, options), { metafile: true })) // Always generate metafile in production
                        : (0, exports.transpileOnlyConfig)(options);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, esbuild.build(config)];
                case 2:
                    result = _a.sent();
                    console.log("Build completed: ".concat(options.dst));
                    if (!result.metafile) return [3 /*break*/, 4];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("fs"); })];
                case 3:
                    fs = _a.sent();
                    fs.writeFileSync("esbuild-meta.json", JSON.stringify(result.metafile));
                    console.log("Metafile generated: esbuild-meta.json");
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error("Build failed:", error_1);
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// CLI execution: Run the build function if the script is executed directly (e.g., `tsx esbuild.config.ts`).
if (require.main === module) {
    build({
        src: "src/index.ts",
        dst: "dist/server.js",
        metafile: process.argv.includes("--metafile"),
    });
}
