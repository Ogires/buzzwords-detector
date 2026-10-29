import type { Entrada } from "./diccionario";

export interface Match {
  inicio: number;
  fin: number;
  entrada: Entrada;
}

interface Compilada {
  entrada: Entrada;
  regex: RegExp;
}

// Lookarounds con \p{L}\p{N} (y flag u): el \b clásico toma las letras con tilde
// por separadores y casaría "acci" dentro de "acción".
export function compilarDiccionario(entradas: Entrada[]): Compilada[] {
  return entradas.map((entrada) => ({
    entrada,
    regex: new RegExp(
      `(?<![\\p{L}\\p{N}])(?:${entrada.patron.replace(/ /g, "\\s+")})(?![\\p{L}\\p{N}])`,
      "giu"
    ),
  }));
}

export function buscarEnTexto(texto: string, diccionario: Compilada[]): Match[] {
  const todos: Match[] = [];
  for (const { entrada, regex } of diccionario) {
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(texto)) !== null) {
      todos.push({ inicio: m.index, fin: m.index + m[0].length, entrada });
      if (m[0].length === 0) regex.lastIndex++; // seguridad ante patrones vacíos
    }
    regex.lastIndex = 0;
  }
  // por inicio y, a igual inicio, el más largo primero
  todos.sort((a, b) => a.inicio - b.inicio || b.fin - a.fin);
  const sinSolapes: Match[] = [];
  let ultimoFin = -1;
  for (const m of todos) {
    if (m.inicio >= ultimoFin) {
      sinSolapes.push(m);
      ultimoFin = m.fin;
    }
  }
  return sinSolapes;
}

export function contarPalabras(texto: string): number {
  return texto.split(/\s+/).filter((p) => p.length > 0).length;
}
