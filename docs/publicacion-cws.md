# Guía de publicación en Chrome Web Store

Guía paso a paso para publicar el Detector de Buzzwords. Los textos para pegar están en
[`store/listing.md`](store/listing.md).

| Material | Dónde está |
|---|---|
| Zip de la extensión (`dist/` con el manifest en la raíz) | Lo genera el CI: artifact `buzzwords-detector-zip` de cada ejecución en verde |
| Icono 128×128 | Dentro del zip (`icons/icon128.png`) |
| 3 capturas 1280×800 | [`store/screenshots/`](store/screenshots/) |
| Mosaico promocional 440×280 (opcional) | [`store/promo-440x280.png`](store/promo-440x280.png) |
| Política de privacidad | [`PRIVACY.md`](../PRIVACY.md) |
| GIF de demostración | [`demo.gif`](demo.gif) |

## 1. Cuenta de desarrollador (una vez, 5 $)

1. Entra en https://chrome.google.com/webstore/devconsole con la cuenta de Google.
2. Acepta el acuerdo de desarrollador y paga la cuota única de **5 $** (hasta 20 elementos).
3. Verifica un email de contacto (obligatorio para publicar).

## 2. Conseguir el zip

**Opción A (recomendada, desde el CI):** GitHub → repo → Actions → última ejecución en verde
de "CI" en `main` → descarga el artifact **`buzzwords-detector-zip`**. GitHub lo entrega
dentro de otro zip: descomprímelo una vez y sube el `buzzwords-detector.zip` de dentro.

**Opción B (local):**

```bash
npm install && npm run build
cd dist && zip -r ../buzzwords-detector.zip . && cd ..
```

## 3. Crear el elemento

1. Panel → **Añadir elemento nuevo** → sube `buzzwords-detector.zip`.
2. **Ficha de la tienda:** descripción detallada, categoría, idioma, capturas y mosaico
   (todo en [`store/listing.md`](store/listing.md)).
3. **Prácticas de privacidad:** propósito único, justificación de `activeTab` y `scripting`,
   código remoto (no), uso de datos (ninguno, con las tres certificaciones) y la URL de
   `PRIVACY.md`. La extensión descarga un JSON público con el catálogo de términos: son
   datos validados, no código, y así se explica en el formulario.
4. **Distribución:** pública, todas las regiones, gratuita.
5. **Enviar para revisión.**

## 4. Qué esperar

- La revisión tarda de unas horas a varios días. Con solo `activeTab` y `scripting`, sin
  permisos de host, suele ir rápida.
- Si piden cambios, llega un email con el motivo. Lo más habitual son los permisos, y aquí
  están justificados.
- Al aprobarse queda una URL pública del tipo `https://chromewebstore.google.com/detail/…`.

## 5. Después de publicar

- [ ] Enlazar la ficha de la tienda en el README
- [ ] Para versiones nuevas: subir el zip del CI con el `version` del manifest incrementado.
      La tienda vuelve a revisarlo (mismo proceso, más rápido)

## Notas para Firefox y Edge

El mismo código sirve. Edge acepta el zip de la Chrome Web Store casi tal cual (import en
https://partner.microsoft.com/dashboard/microsoftedge, gratis) y Firefox requiere
`web-ext` y una cuenta gratuita en addons.mozilla.org.
