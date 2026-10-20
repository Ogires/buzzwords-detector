// src/content.ts — se inyecta con chrome.scripting.executeScript({files:["content.js"]})
// Pegamento con las APIs de Chrome: toda la lógica vive en módulos ya testeados.
import { DICCIONARIO } from "./diccionario";
import { cargarDiccionario, URL_CATALOGO } from "./diccionario-remoto";
import { limpiar, resaltar } from "./resaltar";
import type { Stats } from "./stats";

interface BwdWindow {
  __bwd?: () => Promise<void>;
}

declare const window: Window & BwdWindow;

async function escanear(): Promise<void> {
  const catalogo = await cargarDiccionario(URL_CATALOGO, DICCIONARIO);
  const stats = resaltar(document.body, catalogo.entradas);
  stats.catalogo = { origen: catalogo.origen, version: catalogo.version };
  enviar(stats);
}

function enviar(stats: Stats): void {
  // si el popup ya se cerró, chrome.runtime.lastError evita el error ruidoso
  chrome.runtime.sendMessage({ tipo: "bwd-stats", stats }, () => void chrome.runtime.lastError);
}

(function main() {
  if (window.__bwd) {
    // ya estaba inyectado en esta pestaña: re-escanear y callar
    void window.__bwd();
    return;
  }
  window.__bwd = escanear;
  chrome.runtime.onMessage.addListener((mensaje: { accion?: string }) => {
    if (mensaje?.accion === "limpiar") {
      limpiar(document.body);
      enviar({ total: 0, palabras: 0, indice: 0, top: [] });
    }
  });
  void escanear();
})();
