import { beforeEach, describe, expect, it } from "vitest";
import type { Entrada } from "../src/diccionario";
import { limpiar, resaltar } from "../src/resaltar";

const entrada: Entrada = {
  patron: "sinergias?",
  idioma: "es",
  categoria: "estrategia",
  real: "colaboración",
  sarcasta: "magia de dos jefes",
};

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("resaltar", () => {
  it("envuelve el match en un span con tooltip y conserva el texto", () => {
    document.body.innerHTML = "<p>Buscamos sinergias en el equipo</p>";
    const stats = resaltar(document.body, [entrada]);
    const span = document.querySelector("span.bwd-hit");
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe("sinergias");
    expect(span!.getAttribute("data-bwd")).toBe("colaboración — «magia de dos jefes»");
    expect(document.body.textContent).toBe("Buscamos sinergias en el equipo");
    expect(stats.total).toBe(1);
    expect(stats.top[0].n).toBe(1);
  });

  it("no toca script, style, code ni textarea", () => {
    document.body.innerHTML =
      "<p>sinergia</p><script>var sinergia = 1;</script>" +
      "<style>.sinergia{}</style><code>sinergia()</code><textarea>sinergia</textarea>";
    const stats = resaltar(document.body, [entrada]);
    expect(stats.total).toBe(1);
    expect(
      document.querySelector("script span.bwd-hit, code span.bwd-hit, textarea span.bwd-hit")
    ).toBeNull();
  });

  it("inyecta el estilo una sola vez aunque se reescanee", () => {
    document.body.innerHTML = "<p>sinergia</p>";
    resaltar(document.body, [entrada]);
    resaltar(document.body, [entrada]);
    expect(document.querySelectorAll("style#bwd-estilo")).toHaveLength(1);
    // y no duplica spans sobre el mismo texto
    expect(document.querySelectorAll("span.bwd-hit")).toHaveLength(1);
  });

  it("calcula el índice con las palabras de la página", () => {
    // 8 palabras, 2 matches → 250 por 1000
    document.body.innerHTML = "<p>sinergia sinergia en el equipo de producto final</p>";
    const stats = resaltar(document.body, [entrada]);
    expect(stats.palabras).toBe(8);
    expect(stats.indice).toBe(250);
  });
});

describe("limpiar", () => {
  it("restaura el DOM exacto (unwrap + quitar estilo)", () => {
    const html = "<p>Buscamos sinergias en el equipo</p>";
    document.body.innerHTML = html;
    resaltar(document.body, [entrada]);
    limpiar(document.body);
    expect(document.querySelector("span.bwd-hit")).toBeNull();
    expect(document.querySelector("style#bwd-estilo")).toBeNull();
    expect(document.body.innerHTML).toBe(html);
  });
});
