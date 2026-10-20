# Diseño: Detector de Buzzwords
**Fecha:** 2026-10-20 · **Estado:** aprobado (decisiones de producto validadas: activación por clic · diccionario ES+EN · tooltip doble real+sarcasta)
**Contexto:** Segunda app de "la factoría": primera extensión Chrome, justifica los 5 $ únicos de Chrome Web Store. Plantilla: el [diseño de Excusotron](https://github.com/Ogires/excusotron/blob/main/docs/plans/2026-10-19-excusotron-design.md).

## 1. Visión

Extensión de Chrome que, al pulsar su icono, **escanea la página actual, resalta la jerga corporativa** (español + inglés) y muestra al pasar el ratón una **traducción doble: la real y la sarcasta**. El popup remata con el **Índice de Humo** (buzzwords por 1.000 palabras) — la stat que se comparte en LinkedIn. Sin backend y sin permisos de host: la extensión no hace ninguna petición de red, y esa privacidad va directa al README.

## 2. Alcance

**MV1 (una tarde 🟢)**
- Escaneo bajo demanda: clic en el icono → el popup inyecta y ejecuta el análisis de la pestaña activa (`activeTab` + `scripting`).
- Diccionario embebido de ~80 términos ES+EN con regex (multi-palabra, acentos, mayúsculas).
- Resaltado no destructivo + tooltip CSS puro con las dos traducciones.
- Popup: Índice de Humo con escala friki, top 3 términos, botón "Limpiar resaltado" y enlace al repo.
- Badge en el icono con el nº de buzzwords detectados.

**MV2 (un finde 🟡, no hoy)**
- "Traductor de Humo" con Groq: la frase entera que rodea al buzzword → español llano (Worker con rate limit por IP, mismo patrón que Excusotron).
- Contador global KV ("X buzzwords cazados por la humanidad").
- Firefox/Edge (mismo código, manifest v3 compatible).
- Modo automático opcional (pediría `<all_urls>` solo al activarlo).
- Export del top-N de la página a cartón de Meeting Bingo.

**Fuera de alcance MV1:** IA, backend, cuentas, iframes cross-origin, modo automático, resaltado persistente entre recargas.

## 3. Arquitectura

```
┌────────────────────── Chrome ──────────────────────┐
│ Clic icono → popup.html/popup.js                    │
│   ├─ chrome.tabs.query(active)                      │
│   ├─ chrome.scripting.executeScript (activeTab):    │
│   │    └─ content.ts (mundo aislado ISOLATED)       │
│   │         · detector.ts: compila regex del        │
│   │           diccionario y busca matches           │
│   │         · resaltar.ts: TreeWalker sobre nodos   │
│   │           de texto (ignora script/style/        │
│   │           textarea/already-marked)              │
│   │         · inyecta <style> con prefijo bwd-      │
│   │         · devuelve stats {n, palabras, top}     │
│   ├─ pinta Índice de Humo + top 3 + nivel friki     │
│   └─ chrome.action.setBadgeText(n buzzwords)        │
└─────────────────────────────────────────────────────┘
   Sin backend · 0 peticiones de red · 0 €
```

**Decisiones clave:**
- **`activeTab` en vez de `<all_urls>`**: la extensión no toca nada hasta que el usuario pulsa el icono. Revisión de Chrome Web Store más fácil y sección de privacidad del README con un argumento real.
- **TypeScript estricto + esbuild mínimo**: el playbook exige TS estricto; una extensión exige ficheros .js en el manifest, y esbuild los genera en milisegundos con una config de 5 líneas. Descartado vanilla JS sin types y Vite+crxjs (infra innecesaria para una tarde).
- **Tooltip CSS puro** (data-attributes + regla `::after` propia): cero dependencias, cero JS de posicionamiento; todo con prefijo `bwd-` para no chocar con la página.
- **Regex unicode con lookarounds** `(?<![\p{L}])patrón(?![\p{L}])` y flag `u`: `\b` no entiende acentos y casaría "holistic" dentro de "holística".
- **Vitest puro + jsdom** (SIN el plugin de Cloudflare: aquí no hay Worker; la lección 1 de AGENTS.md solo aplica a proyectos Worker).

## 4. Modelo de datos

Todo local, embebido en el bundle:

```ts
// src/diccionario.ts
export interface Entrada {
  patron: string;       // texto plano; el detector lo compila a regex unicode
  idioma: "es" | "en";  // para el badge del tooltip y futuros filtros
  categoria: "estrategia" | "producto" | "reuniones" | "marketing" | "feedback";
  real: string;         // traducción honesta
  sarcasta: string;     // la que se comparte
}
```

~80 entradas MV1. Ejemplos de referencia del tono:
- `sinergia` → real: "colaboración" · sarcasta: "magia que ocurre cuando dos jefes coinciden"
- `quick win` → real: "éxito rápido" · sarcasta: "el parche que nadie va a mantener"
- `circle back` → real: "lo retomo luego" · sarcasta: "no pienso responderte ahora"

**Índice de Humo** = `buzzwords / palabras visibles × 1000`, con escala friki:
0 = "Página honesta ✓" · ≥10 = "Reunión de seguimiento" · ≥30 = "Keynote de startup" · ≥60 = "Pitch a inversores".

## 5. Manejo de errores y edge cases

| Caso | Comportamiento |
|---|---|
| `chrome://`, Web Store, PDFs (no inyectable) | Popup: "Aquí no hay humo que rascar" — nunca error crudo |
| Clic doble / re-escaneo | Se limpia el resaltado anterior (unwrap) antes de escanear |
| Página sin texto o sin matches | Popup: "Página honesta ✓" (también sale en el GIF) |
| Página gigante | TreeWalker de una pasada; presupuesto 500 ms en un artículo típico |
| Herencia de estilos de la página | Prefijo `bwd-` en clases, `all: unset`-selectivo y `!important` puntual en el tooltip |
| Fallo al ejecutar el script (tab descartada a mitad) | try/catch en el popup → mensaje simpático |

## 6. Estrategia de tests

- **detector (unit):** matching con acentos/mayúsculas/multi-palabra; no match dentro de `<script>`/atributos; cálculo del índice; top N términos.
- **diccionario (integridad):** ≥80 entradas, sin patrones duplicados, campos no vacíos, categorías válidas, cada patrón compila a regex válida y matchea su propio texto.
- **resaltar (jsdom):** resaltar y limpiar dejan el DOM equivalente al original (mismo texto visible); segundo escaneo no duplica spans.
- **índice (unit):** cada tramo de la escala friki con valores límite.
- Regla práctica heredada de Excusotron: toda la lógica pura tiene test; HTML/CSS del popup, no.

## 7. Publicación y CI

- Repo público `github.com/Ogires/buzzwords-detector`. README desde el día 1: GIF, diagrama, sección "Privacidad: no hace ninguna petición de red", instalación en modo developer, zip para CWS.
- GitHub Actions: `npm ci` → `npm test` → `npm run build` → artifact `buzzwords-detector.zip` (manifest en la raíz del zip, listo para subir). Sin job deploy (no hay nada que desplegar).
- Subida a Chrome Web Store: manual (requiere cuenta developer de 5 $). Firefox/Edge en MV2.

## 8. Criterios de éxito

- Escaneo < 500 ms en una página tipo artículo.
- Cero peticiones de red verificables en DevTools.
- Resaltado reversible sin romper el layout (unwrap restaura el DOM).
- README + GIF que se explican solos en 30 segundos ante un reclutador.
- El zip del CI se puede subir a CWS sin cambios manuales.
