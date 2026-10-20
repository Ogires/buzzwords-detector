// src/popup.ts — orquestador: inyecta el content script y pinta lo que reporta
import { nivelEscala, type Stats, type Termino } from "./stats";

const $ = (sel: string) => document.querySelector(sel) as HTMLElement;

function pintar(stats: Stats): void {
  $("#estado").textContent = "";
  $("#resultado").hidden = false;
  $("#indice").textContent = String(stats.indice);
  $("#escala").textContent = nivelEscala(stats.indice);
  $("#top").innerHTML = stats.top
    .map(
      (t) =>
        `<li><strong>${escapeHtml(nombreLegible(t))}</strong> ×${t.n} <small>· ${escapeHtml(t.real)}</small></li>`
    )
    .join("");
  $("#total").textContent =
    stats.total === 0
      ? "Esta página no usa jerga. Sospechoso."
      : `${stats.total} buzzwords en ${stats.palabras.toLocaleString("es-ES")} palabras`;
  marcarBadge(stats.total);
}

// "sinergias?" → "sinergia": para mostrar lenguaje humano, no regex
function nombreLegible(t: Termino): string {
  const base = t.idioma === "en" && !/[áéíóúñ]/i.test(t.patron) ? t.patron : t.patron;
  return base
    .replace(/\[- \]/g, " ")
    .replace(/\(([^)]*)\)\??/g, (_m, g: string) => g.split("|")[0])
    .replace(/\|.*$/, "")
    .replace(/\?/g, "")
    .replace(/\[(.+?)\]/g, (_m, g: string) => g[0])
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

function marcarBadge(n: number): void {
  chrome.action.setBadgeText({ text: n > 0 ? (n > 999 ? "999+" : String(n)) : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#b8860b" });
}

function noInyectable(): void {
  $("#estado").textContent = "Aquí no hay humo que rascar: esta página no se puede analizar 🚭";
  $("#resultado").hidden = true;
  ($("#reescanear") as HTMLButtonElement).disabled = true;
  ($("#limpiar") as HTMLButtonElement).disabled = true;
}

function esInyectable(url: string | undefined): boolean {
  if (!url) return false;
  return (
    !/^(chrome|edge|about|devtools|view-source|chrome-extension):/i.test(url) &&
    !/^https?:\/\/chrome\.google\.com\/webstore/i.test(url)
  );
}

async function tabActiva(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function escanearDeNuevo(tabId: number): Promise<void> {
  $("#estado").textContent = "Escaneando página…";
  await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
}

async function main(): Promise<void> {
  const tab = await tabActiva();
  if (!tab?.id || !esInyectable(tab.url)) {
    noInyectable();
    return;
  }
  const tabId = tab.id;

  chrome.runtime.onMessage.addListener((mensaje: { tipo?: string; stats?: Stats }) => {
    if (mensaje?.tipo === "bwd-stats" && mensaje.stats) pintar(mensaje.stats);
  });

  $("#reescanear").addEventListener("click", () => void escanearDeNuevo(tabId));
  $("#limpiar").addEventListener("click", () => {
    void chrome.tabs.sendMessage(tabId, { accion: "limpiar" }).catch(() => {});
    $("#resultado").hidden = true;
    $("#estado").textContent = "Resaltado retirado. La jerga sigue ahí, solo que invisible.";
    marcarBadge(0);
  });

  try {
    await escanearDeNuevo(tabId);
  } catch {
    $("#estado").textContent = "No he podido escanear esta página. Prueba a recargarla.";
  }

  // si el content script no contesta en 4 s, algo raro pasa: degradar con gracia
  setTimeout(() => {
    if (!$("#resultado").hidden) return;
    if ($("#estado").textContent?.startsWith("Escaneando")) {
      $("#estado").textContent = "El detector se quedó sin pilas. Recarga la página e inténtalo otra vez.";
    }
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => void main());
