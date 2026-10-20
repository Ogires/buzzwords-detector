import { afterEach, describe, expect, it, vi } from "vitest";
import type { Entrada } from "../src/diccionario";
import { cargarDiccionario } from "../src/diccionario-remoto";

const local: Entrada[] = [
  { patron: "sinergias?", idioma: "es", categoria: "estrategia", real: "colaboración", sarcasta: "magia de dos jefes" },
];

const remotaValida = { version: 7, actualizado: "2026-10-20", entradas: [
  { patron: "quick wins?", idioma: "en", categoria: "estrategia", real: "éxito rápido", sarcasta: "el parche que nadie mantiene" },
  { patron: "talento", idioma: "es", categoria: "rrhh", real: "personas capacitadas", sarcasta: "nosotros, contratando barato" },
]};

const respuesta = (cuerpo: unknown) => new Response(JSON.stringify(cuerpo), { status: 200 });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("cargarDiccionario", () => {
  it("usa el catálogo remoto cuando llega válido", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respuesta(remotaValida)));
    const cat = await cargarDiccionario("https://ejemplo.test/dicc.json", local, 1000, 1);
    expect(cat.origen).toBe("remoto");
    expect(cat.version).toBe(7);
    expect(cat.entradas).toHaveLength(2);
    expect(cat.entradas[0].patron).toBe("quick wins?");
  });

  it("filtra entradas corruptas del remoto y usa las válidas", async () => {
    const mezclado = { version: 8, entradas: [
      remotaValida.entradas[0],
      { patron: "x", idioma: "es", categoria: "no-existe", real: "r", sarcasta: "s" }, // categoría inválida
      { patron: "(", idioma: "es", categoria: "estrategia", real: "regex rota", sarcasta: "no compila" }, // regex inválida
    ]};
    vi.stubGlobal("fetch", vi.fn(async () => respuesta(mezclado)));
    const cat = await cargarDiccionario("https://ejemplo.test/dicc.json", local, 1000, 1);
    expect(cat.origen).toBe("remoto");
    expect(cat.entradas).toHaveLength(1);
  });

  it("hace fallback al empaquetado si el remoto no llega al mínimo de entradas", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respuesta({ version: 9, entradas: remotaValida.entradas })));
    const cat = await cargarDiccionario("https://ejemplo.test/dicc.json", local, 1000, 75);
    expect(cat.origen).toBe("local");
    expect(cat.entradas).toBe(local);
  });

  it("hace fallback si la respuesta no tiene forma de catálogo", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respuesta({ error: "nope" })));
    const cat = await cargarDiccionario("https://ejemplo.test/dicc.json", local, 1000, 1);
    expect(cat.origen).toBe("local");
  });

  it("hace fallback si el fetch falla (sin red)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("sin red"); }));
    const cat = await cargarDiccionario("https://ejemplo.test/dicc.json", local, 1000, 1);
    expect(cat.origen).toBe("local");
    expect(cat.entradas).toBe(local);
  });

  it("hace fallback si el fetch no contesta en el timeout (race, no cuelga)", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => {}))); // nunca resuelve
    const inicio = Date.now();
    const cat = await cargarDiccionario("https://ejemplo.test/dicc.json", local, 50, 1);
    expect(cat.origen).toBe("local");
    expect(Date.now() - inicio).toBeLessThan(2000);
  });
});
