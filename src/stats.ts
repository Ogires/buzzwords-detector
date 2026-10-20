import type { Entrada } from "./diccionario";

export interface Termino {
  patron: string;
  idioma: "es" | "en";
  categoria: string;
  real: string;
  sarcasta: string;
  n: number;
}

export interface Stats {
  total: number;
  palabras: number;
  indice: number;
  top: Termino[];
}

export function calcularStats(recuentos: Map<Entrada, number>, palabras: number): Stats {
  const total = [...recuentos.values()].reduce((a, b) => a + b, 0);
  const top: Termino[] = [...recuentos.entries()]
    .map(([e, n]) => ({
      patron: e.patron,
      idioma: e.idioma,
      categoria: e.categoria,
      real: e.real,
      sarcasta: e.sarcasta,
      n,
    }))
    .sort((a, b) => b.n - a.n || a.patron.localeCompare(b.patron))
    .slice(0, 3);
  return {
    total,
    palabras,
    indice: palabras > 0 ? Math.round((total * 1000) / palabras) : 0,
    top,
  };
}

export function nivelEscala(indice: number): string {
  if (indice <= 0) return "Página honesta ✓";
  if (indice < 10) return "Humo leve, se aguanta";
  if (indice < 30) return "Reunión de seguimiento";
  if (indice < 60) return "Keynote de startup";
  return "Pitch a inversores 🚀";
}
