import * as esbuild from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await esbuild.build({
  entryPoints: { content: "src/content.ts", popup: "src/popup.ts" },
  bundle: true,
  format: "iife",
  outdir: "dist",
  target: ["chrome120"],
  sourcemap: false,
});
await mkdir("dist/popup", { recursive: true });
await cp("popup", "dist/popup", { recursive: true });
await cp("manifest.json", "dist/manifest.json");
try {
  await cp("icons", "dist/icons", { recursive: true });
} catch {
  // los iconos llegan en la Task 6; el build no debe romperse antes
}
console.log("Build OK → dist/");
