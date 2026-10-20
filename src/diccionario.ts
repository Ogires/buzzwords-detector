// Fuente única del catálogo: data/diccionario.json (se empaqueta como base
// y se sirve en remoto desde raw.githubusercontent.com para actualizarlo sin
// republicar la extensión).
import bruto from "../data/diccionario.json";

export interface Entrada {
  patron: string;
  idioma: "es" | "en";
  categoria: "estrategia" | "producto" | "reuniones" | "marketing" | "feedback" | "rrhh";
  real: string;
  sarcasta: string;
}

export const CATEGORIAS = [
  "estrategia",
  "producto",
  "reuniones",
  "marketing",
  "feedback",
  "rrhh",
] as const;

export const VERSION_CATALOGO: number = bruto.version;

// Valida una entrada sin confiar en su origen (el JSON remoto no es de confianza):
// estructura correcta Y patrón que compila como regex unicode.
export function esEntrada(x: unknown): x is Entrada {
  if (typeof x !== "object" || x === null) return false;
  const e = x as Record<string, unknown>;
  return (
    typeof e.patron === "string" &&
    e.patron.length > 2 &&
    (e.idioma === "es" || e.idioma === "en") &&
    CATEGORIAS.includes(e.categoria as (typeof CATEGORIAS)[number]) &&
    typeof e.real === "string" &&
    e.real.length > 2 &&
    typeof e.sarcasta === "string" &&
    e.sarcasta.length > 5 &&
    compilaPatron(e.patron)
  );
}

function compilaPatron(patron: string): boolean {
  try {
    new RegExp(`(?<![\\p{L}\\p{N}])(?:${patron.replace(/ /g, "\\s+")})(?![\\p{L}\\p{N}])`, "giu");
    return true;
  } catch {
    return false;
  }
}

export const DICCIONARIO: Entrada[] = bruto.entradas.filter(esEntrada);
