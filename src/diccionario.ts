export interface Entrada {
  patron: string;
  idioma: "es" | "en";
  categoria: "estrategia" | "producto" | "reuniones" | "marketing" | "feedback";
  real: string;
  sarcasta: string;
}

export const DICCIONARIO: Entrada[] = [];
