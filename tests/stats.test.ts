import { describe, expect, it } from "vitest";
import type { Entrada } from "../src/diccionario";
import { calcularStats, nivelEscala } from "../src/stats";

const entrada = (patron: string, real = "real", sarcasta = "sarcasta"): Entrada => ({
  patron,
  idioma: "es",
  categoria: "estrategia",
  real,
  sarcasta,
});

describe("calcularStats", () => {
  it("total = suma de recuentos, top ordenado por n y recortado a 3", () => {
    const recuentos = new Map<Entrada, number>([
      [entrada("sinergia", "colaboración", "magia"), 5],
      [entrada("roadmap", "hoja de ruta", "ficción"), 9],
      [entrada("core", "lo esencial", "nadie sabe"), 2],
      [entrada("agile", "ágil", "post-its"), 7],
    ]);
    const s = calcularStats(recuentos, 2000);
    expect(s.total).toBe(23);
    expect(s.top.map((t) => t.patron)).toEqual(["roadmap", "agile", "sinergia"]);
    expect(s.top[0]).toMatchObject({ real: "hoja de ruta", sarcasta: "ficción", n: 9 });
  });

  it("índice de humo = matches por 1000 palabras, redondeado", () => {
    const s = calcularStats(new Map([[entrada("core"), 5]]), 1000);
    expect(s.indice).toBe(5);
  });

  it("sin palabras no divide por cero", () => {
    const s = calcularStats(new Map(), 0);
    expect(s.indice).toBe(0);
    expect(s.total).toBe(0);
  });
});

describe("nivelEscala", () => {
  it("0 → página honesta; 9 → humo leve; 10 → reunión; 30 → keynote; 60 → pitch", () => {
    expect(nivelEscala(0)).toContain("honesta");
    expect(nivelEscala(9)).toContain("leve");
    expect(nivelEscala(10)).toContain("Reunión");
    expect(nivelEscala(30)).toContain("Keynote");
    expect(nivelEscala(60)).toContain("Pitch");
    expect(nivelEscala(120)).toContain("Pitch");
  });
});
