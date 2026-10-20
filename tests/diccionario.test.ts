import { describe, expect, it } from "vitest";
import bruto from "../data/diccionario.json";
import { CATEGORIAS, DICCIONARIO, esEntrada, VERSION_CATALOGO } from "../src/diccionario";

describe("integridad del diccionario", () => {
  it("el JSON del repo es la fuente única: versión presente y cero entradas inválidas", () => {
    expect(typeof bruto.version).toBe("number");
    expect(bruto.version).toBeGreaterThan(0);
    expect(bruto.actualizado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(bruto.entradas.length).toBe(DICCIONARIO.length); // nada se descarta en silencio
    for (const e of bruto.entradas) expect(esEntrada(e)).toBe(true);
    expect(VERSION_CATALOGO).toBe(bruto.version);
  });

  it("tiene al menos 215 entradas", () => {
    expect(DICCIONARIO.length).toBeGreaterThanOrEqual(215);
  });

  it("no tiene patrones duplicados", () => {
    const patrones = DICCIONARIO.map((e) => e.patron);
    expect(new Set(patrones).size).toBe(patrones.length);
  });

  it("toda entrada tiene todos los campos y categoria válida", () => {
    for (const e of DICCIONARIO) {
      expect(e.patron.length).toBeGreaterThan(2);
      expect(["es", "en"]).toContain(e.idioma);
      expect(CATEGORIAS).toContain(e.categoria);
      expect(e.real.length).toBeGreaterThan(2);
      expect(e.sarcasta.length).toBeGreaterThan(5);
    }
  });

  it("cubre los dos idiomas y las cinco categorías", () => {
    expect(DICCIONARIO.some((e) => e.idioma === "es")).toBe(true);
    expect(DICCIONARIO.some((e) => e.idioma === "en")).toBe(true);
    for (const c of CATEGORIAS) {
      expect(DICCIONARIO.some((e) => e.categoria === c)).toBe(true);
    }
  });

  it("todo patrón compila a regex unicode válida", () => {
    for (const e of DICCIONARIO) {
      const fuente = e.patron.replace(/ /g, "\\s+");
      expect(() =>
        new RegExp(`(?<![\\p{L}\\p{N}])(?:${fuente})(?![\\p{L}\\p{N}])`, "giu")
      ).not.toThrow();
    }
  });
});
