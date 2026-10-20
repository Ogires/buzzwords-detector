// src/content.ts — se inyecta con chrome.scripting.executeScript({files:["content.js"]})
// Pegamento con las APIs de Chrome: toda la lógica vive en módulos ya testeados.
import { DICCIONARIO } from "./diccionario";
import { limpiar, resaltar } from "./resaltar";
import type { Stats } from "./stats";

interface BwdWindow {
  __bwd?: boolean;
}

declare const window: Window & BwdWindow;

function escanear(): Stats {
  return resaltar(document.body, DICCIONARIO);
}

function enviar(stats: Stats): void {
  // si el popup ya se cerró, chrome.runtime.lastError evita el error ruidoso
  chrome.runtime.sendMessage({ tipo: "bwd-stats", stats }, () => void chrome.runtime.lastError);
}

(function main() {
  if (window.__bwd) {
    // ya estaba inyectado en esta pestaña: re-escanear y callar
    enviar(escanear());
    return;
  }
  window.__bwd = true;
  chrome.runtime.onMessage.addListener((mensaje: { accion?: string }) => {
    if (mensaje?.accion === "limpiar") {
      limpiar(document.body);
      enviar({ total: 0, palabras: 0, indice: 0, top: [] });
    }
  });
  enviar(escanear());
})();
