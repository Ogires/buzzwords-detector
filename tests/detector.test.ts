import { describe, expect, it } from "vitest";
import type { Entrada } from "../src/diccionario";
import { buscarEnTexto, compilarDiccionario, contarPalabras } from "../src/detector";

const e = (patron: string): Entrada => ({
  patron,
  idioma: "es",
  categoria: "estrategia",
  real: "real",
  sarcasta: "sarcasta",
});

describe("compilarDiccionario", () => {
  it("cada entrada produce una regex global unicode", () => {
    const c = compilarDiccionario([e("sinergia")]);
    expect(c).toHaveLength(1);
    expect(c[0].regex.flags).toBe("giu");
  });
});

describe("buscarEnTexto", () => {
  it("encuentra mayúsculas, minúsculas y plurales", () => {
    const m = buscarEnTexto("SINERGIAS y otra sinergia", compilarDiccionario([e("sinergias?")]));
    expect(m).toHaveLength(2);
    expect(m[0]).toMatchObject({ inicio: 0, fin: 9 });
  });

  it("NO matchea dentro de palabras con acentos (la razón de los lookarounds)", () => {
    const m = buscarEnTexto("holística", compilarDiccionario([e("holistic")]));
    expect(m).toHaveLength(0);
  });

  it("NO matchea pegado a números", () => {
    expect(buscarEnTexto("MVP2026", compilarDiccionario([e("MVPs?")]))).toHaveLength(0);
  });

  it("los espacios del patrón toleran saltos de línea", () => {
    const m = buscarEnTexto("un quick\nwin barato", compilarDiccionario([e("quick wins?")]));
    expect(m).toHaveLength(1);
  });

  it("los guiones de 'win-win' funcionan con o sin espacio", () => {
    const c = compilarDiccionario([e("win[- ]win")]);
    expect(buscarEnTexto("es un win-win", c)).toHaveLength(1);
    expect(buscarEnTexto("es un win win", c)).toHaveLength(1);
  });

  it("descarta solapamientos quedándose con el primero (más largo)", () => {
    const c = compilarDiccionario([e("value proposition"), e("proposals?")]);
    const m = buscarEnTexto("nuestra value proposition es", c);
    expect(m).toHaveLength(1);
    expect(m[0].entrada.patron).toBe("value proposition");
  });

  it("devuelve la entrada con cada match", () => {
    const m = buscarEnTexto("quick win", compilarDiccionario([e("quick wins?")]));
    expect(m[0].entrada.real).toBe("real");
  });
});

describe("contarPalabras", () => {
  it("cuenta por espacios e ignora huecos repetidos", () => {
    expect(contarPalabras("hola   mundo\n\nde nuevo")).toBe(4);
  });
  it("texto vacío → 0", () => {
    expect(contarPalabras("   ")).toBe(0);
  });
});
