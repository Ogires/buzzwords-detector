import { defineConfig } from "vitest/config";

// Vitest puro con jsdom: aquí no hay Worker, así que nada de plugin de Cloudflare
// (la lección 1 de AGENTS.md solo aplica a proyectos Worker).
export default defineConfig({
  test: { environment: "jsdom" },
});
