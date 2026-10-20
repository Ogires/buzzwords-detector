export interface Termino {
  n: number;
}

export interface Stats {
  total: number;
  palabras: number;
  indice: number;
  top: Termino[];
}

export function calcularStats(_recuentos: unknown, _palabras: number): Stats {
  return { total: 0, palabras: 0, indice: 0, top: [] };
}

export function nivelEscala(_indice: number): string {
  return "";
}
