import type { Entrada } from "./diccionario";
import { buscarEnTexto, compilarDiccionario, contarPalabras } from "./detector";
import { calcularStats, type Stats } from "./stats";

const CLASE = "bwd-hit";
const ID_ESTILO = "bwd-estilo";
const OMITIR = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "SVG"]);

const CSS = `
span.${CLASE}{
  background:linear-gradient(transparent 55%, rgba(255,176,0,.38) 55%);
  border-bottom:2px dotted #b8860b; cursor:help; position:relative;
}
span.${CLASE}:hover::after{
  content:attr(data-bwd); position:absolute; bottom:125%; left:0; z-index:2147483647;
  background:#161a20; color:#e8e6e3; border:1px solid #ffb000; border-radius:6px;
  padding:.5rem .7rem; width:max-content; max-width:280px;
  font:13px/1.4 system-ui,sans-serif; box-shadow:0 6px 20px rgba(0,0,0,.4);
  white-space:normal; text-transform:none; letter-spacing:normal;
}`;

export function resaltar(root: HTMLElement, entradas: Entrada[]): Stats {
  limpiar(root);
  const compilado = compilarDiccionario(entradas);
  const recuentos = new Map<Entrada, number>();
  let palabras = 0;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node) {
      for (let el = node.parentElement; el; el = el.parentElement) {
        if (OMITIR.has(el.tagName)) return NodeFilter.FILTER_REJECT;
        if (el.classList.contains(CLASE)) return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue && node.nodeValue.trim().length > 0
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  const pendientes: { nodo: Text; matches: ReturnType<typeof buscarEnTexto> }[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const texto = (n as Text).data;
    const matches = buscarEnTexto(texto, compilado);
    if (matches.length > 0) pendientes.push({ nodo: n as Text, matches });
    palabras += contarPalabras(texto);
  }

  for (const { nodo, matches } of pendientes) {
    const fragmento = document.createDocumentFragment();
    let cursor = 0;
    for (const m of matches) {
      if (m.inicio > cursor) {
        fragmento.appendChild(document.createTextNode(nodo.data.slice(cursor, m.inicio)));
      }
      const span = document.createElement("span");
      span.className = CLASE;
      span.textContent = nodo.data.slice(m.inicio, m.fin);
      span.setAttribute("data-bwd", `${m.entrada.real} — «${m.entrada.sarcasta}»`);
      fragmento.appendChild(span);
      recuentos.set(m.entrada, (recuentos.get(m.entrada) ?? 0) + 1);
      cursor = m.fin;
    }
    if (cursor < nodo.data.length) {
      fragmento.appendChild(document.createTextNode(nodo.data.slice(cursor)));
    }
    nodo.parentNode?.replaceChild(fragmento, nodo);
  }

  inyectarEstilo();
  return calcularStats(recuentos, palabras);
}

export function limpiar(root: HTMLElement): void {
  root.querySelectorAll(`span.${CLASE}`).forEach((span) => {
    span.parentNode?.replaceChild(document.createTextNode(span.textContent ?? ""), span);
  });
  document.getElementById(ID_ESTILO)?.remove();
  root.normalize();
}

function inyectarEstilo(): void {
  if (document.getElementById(ID_ESTILO)) return;
  const estilo = document.createElement("style");
  estilo.id = ID_ESTILO;
  estilo.textContent = CSS;
  (document.head ?? document.documentElement).appendChild(estilo);
}
