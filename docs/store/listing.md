# Chrome Web Store: ficha y privacidad

Textos listos para pegar en el panel de desarrollador
(<https://chrome.google.com/webstore/devconsole>). El zip lo genera el CI: artifact
`buzzwords-detector-zip` de la última ejecución en verde de `main`.

## Imágenes

| Campo | Fichero |
|---|---|
| Icono de la tienda (128×128) | Va dentro del zip (`icons/icon128.png`) |
| Capturas de pantalla (1280×800) | `screenshots/1280x800-1-resaltado.png`, `screenshots/1280x800-2-indice.png`, `screenshots/1280x800-3-privacidad.png` (en este orden) |
| Mosaico promocional pequeño (440×280), opcional | `promo-440x280.png` |

Las capturas están hechas con la extensión real (`dist/content.js` y `dist/popup`) sobre
dos comunicados internos inventados en `intranet.example.com`.

## Pestaña "Ficha de la tienda"

- **Descripción corta:** la tienda la toma del `description` del manifest. No hay que pegarla.
- **Categoría:** Productividad › Herramientas
- **Idioma:** Español

**Descripción detallada:**

```text
Pulsa el icono y la página se llena de subrayados: el Detector de Buzzwords resalta la jerga corporativa, en español y en inglés. Al pasar el ratón por cada término verás dos traducciones, la real y la sarcástica.

«Buscamos sinergias para el roadmap»
sinergia → colaboración («magia que ocurre cuando dos jefes coinciden»)

QUÉ HACE
• Resalta 220 términos de estrategia, producto, reuniones, marketing, feedback y RRHH.
• Calcula el Índice de Humo: buzzwords por cada 1.000 palabras, con diagnóstico (de «Página honesta» a «Pitch a inversores»).
• Muestra las tres más repetidas y el total en el icono.
• «Quitar resaltado» deja la página como estaba.

PRIVACIDAD
• Solo actúa cuando pulsas el icono (permiso activeTab). No lee nada en segundo plano.
• No tiene cuentas, analítica ni cookies, y no guarda nada.
• Al analizar, descarga la última versión del catálogo de términos (un JSON público del repositorio en GitHub). Si no puede, usa el que lleva dentro.

CÓDIGO ABIERTO
https://github.com/Ogires/buzzwords-detector
```

## Pestaña "Prácticas de privacidad"

El formulario se rellena en inglés, que es lo que leen los revisores.

**Single purpose**

```text
Highlights corporate jargon (buzzwords) on the current page when the user clicks the extension icon, shows a plain-language and a humorous translation of each term, and rates the page with a "smoke index" (buzzwords per 1,000 words).
```

**Permission justification — `activeTab`**

```text
Used only when the user clicks the extension icon. It grants temporary access to the current tab so the extension can scan the page's visible text for buzzwords and highlight them. The extension never accesses any tab in the background.
```

**Permission justification — `scripting`**

```text
Used to inject the extension's own bundled content script (content.js) into the active tab after the user clicks the icon. The script is part of the package.
```

**Host permissions:** ninguno. El manifest no declara `host_permissions` ni `content_scripts`.

**Remote code:** *No, I am not using remote code.* Si hay un campo de comentarios:

```text
All JavaScript is bundled in the package. When the user clicks the icon, the content script downloads a public JSON file with the list of terms (patterns and translations) from raw.githubusercontent.com. It is data, not code: it is validated against a fixed schema before use and never evaluated. If it is missing or invalid, the bundled list is used.
```

**Data usage:** no marques ninguna categoría (la extensión no recopila ni transmite datos de
usuario: el texto de la página se analiza en la propia pestaña) y marca las tres certificaciones:

- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:**

```text
https://github.com/Ogires/buzzwords-detector/blob/main/PRIVACY.md
```

## Pestaña "Distribución"

- **Visibilidad:** Pública
- **Regiones:** todas
- **Pago:** gratuita
