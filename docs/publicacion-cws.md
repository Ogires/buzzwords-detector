# Guía de publicación en Chrome Web Store

Guía paso a paso para publicar el Detector de Buzzwords. Estado de los materiales:

| Material | Estado |
|---|---|
| Zip de la extensión (`dist/` con manifest en la raíz) | ✅ lo genera el CI (artifact `buzzwords-detector-zip` de cada run verde) |
| Icono 128×128 | ✅ `icons/icon128.png` |
| Capturas de pantalla 1280×800 | ⬜ pendiente: hacerlas con la extensión cargada en modo developer |
| GIF demo | ⬜ pendiente: `docs/demo.gif` (ScreenToGif), sirve para README + LinkedIn |

## 1. Cuenta de developer (una vez, 5 $)

1. Entra en https://chrome.google.com/webstore/devconsole con la cuenta de Google.
2. Acepta el acuerdo de desarrollador y paga la cuota única de **5 $** (permite hasta 20 extensiones).
3. Verifica un email de contacto (obligatorio para publicar).

## 2. Conseguir el zip

**Opción A (recomendada, desde el CI):** GitHub → repo → Actions → última run verde de "CI" →
descarga el artifact **`buzzwords-detector-zip`**.

**Opción B (local):**

```bash
npm install && npm run build
cd dist && zip -r ../buzzwords-detector.zip . && cd ..
```

## 3. Crear el item

1. Devconsole → **"Nuevo elemento"** → subir `buzzwords-detector.zip`.
2. Pestaña **Lista de tiendas**:
   - Nombre: `Detector de Buzzwords` (ya lo trae el manifest)
   - Descripción corta (máx. ~132 caracteres):
     > Resalta la jerga corporativa (ES+EN) de la página y la traduce: la real y la sarcasta. Sin red, sin permisos de host.
   - Descripción detallada: reutilizar el README (qué hace, Índice de Humo, tabla de ejemplos, privacidad)
   - Categoría: *Herramientas de productividad* · Idioma: *Español*
   - Subir al menos **1 captura 1280×800** (recomendadas: tooltip en acción sobre una web real + popup con el Índice de Humo)
   - Gráficos promocionales (440×280, etc.): opcionales, para otro día
3. Pestaña **Privacidad** (la crítica para pasar review con permisos mínimos):
   - **Propósito único**: "Analizar la página actual bajo demanda para resaltar jerga corporativa y traducirla" (una frase, UN propósito).
   - **Justificación de permisos**:
     - `activeTab`: "accede solo a la pestaña activa cuando el usuario pulsa el icono, para analizarla bajo demanda"
     - `scripting`: "inyecta el script de análisis en la pestaña activa al pulsar el icono"
   - En la declaración de datos, anotar que la extensión **descarga el catálogo de términos (JSON público) desde `raw.githubusercontent.com`** al analizar; no se envía ningún dato del usuario ni se recopila nada.
   - Declaración de datos: marcar que **NO se recopila ni envía ningún dato de usuario** (0 peticiones propias: solo el fetch del JSON público del catálogo).
   - Código remoto: NO usamos código remoto (solo **datos** remotos, el JSON del catálogo; el código va todo empaquetado — esto es lo que CWS permite y distingue de código remoto prohibido).
   - Política de privacidad: no exigida si no recopilas datos; opcionalmente enlazar el README.
4. **Enviar para revisión.**

## 4. Qué esperar

- Review típica: de unas horas a varios días. Con solo `activeTab`+`scripting` y cero host permissions el proceso es de los rápidos.
- Si piden cambios: responden por email con el motivo; los permisos declarados arriba son el punto más común de fricción, y aquí están justificados.
- Al aprobarse: URL pública tipo `https://chromewebstore.google.com/detail/…` → actualizar el README con el enlace de instalación y lanzar el post de LinkedIn.

## 5. Después de publicar

- [ ] Enlazar la URL de la tienda en el README (sección "Probarla")
- [ ] Grabar/subir `docs/demo.gif` si aún no estaba
- [ ] En versiones futuras: subir nuevo zip desde el CI → la tienda pide revisión otra vez (mismo proceso, más rápido)

## Notas para Firefox/Edge (MV2 del backlog)

El mismo código sirve: Edge acepta el zip de CWS casi tal cual (import en
https://partner.microsoft.com/dashboard/microsoftedge, gratis) y Firefox requiere
`web-ext` y cuenta gratuita en addons.mozilla.org. Planificado para MV2.
