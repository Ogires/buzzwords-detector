// Catálogo remoto: el JSON vive en el repo y se sirve por raw.githubusercontent.
// El fetch lo hace el content script en el mundo aislado (origen de la página):
// así NO hace falta host_permissions y "sin permisos de host" sigue siendo verdad.
// Si la página tiene CSP estricta, no hay red o el JSON viene mal → catálogo
// empaquetado. La demo nunca se queda en blanco.
import { esEntrada, type Entrada } from "./diccionario";

export const URL_CATALOGO =
  "https://raw.githubusercontent.com/Ogires/buzzwords-detector/main/data/diccionario.json";

export interface Catalogo {
  entradas: Entrada[];
  version: number;
  origen: "remoto" | "local";
}

// Suelo de sanidad: un JSON remoto con menos de 75 entradas válidas se considera
// roto (protege a los usuarios de una edición desastrosa del catálogo).
export async function cargarDiccionario(
  url: string,
  empaquetado: Entrada[],
  timeoutMs = 1500,
  minimo = 75
): Promise<Catalogo> {
  const local: Catalogo = { entradas: empaquetado, version: 0, origen: "local" };
  try {
    // race (y no AbortController): un fetch colgado no debe colgar el escaneo
    const respuesta = await Promise.race([
      fetch(url),
      new Promise<never>((_, rechazar) =>
        setTimeout(() => rechazar(new Error("timeout del catálogo")), timeoutMs)
      ),
    ]);
    if (!respuesta.ok) return local;
    const bruto = (await respuesta.json()) as { version?: unknown; entradas?: unknown };
    const entradas = Array.isArray(bruto.entradas) ? bruto.entradas.filter(esEntrada) : [];
    const version = typeof bruto.version === "number" ? bruto.version : 0;
    if (entradas.length < minimo) return local;
    return { entradas, version, origen: "remoto" };
  } catch {
    return local;
  }
}
