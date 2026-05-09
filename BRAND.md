# Bukify — Brand & Design Guidelines

> Brief completo para generar videos de animación (redes sociales, reels, ads, product shots).
> Todo lo que una herramienta de video generativo necesita: marca, tono, paleta, tipografía, motion language y prompts listos para copiar.

---

## 1. Resumen de marca

- **Nombre:** Bukify
- **Dominio:** bukify.io
- **Categoría:** SaaS B2C / creator economy
- **Qué hace:** Convierte PDFs (alojados en Google Drive) en flipbooks interactivos con efecto 3D de paso de página, listos para vender o compartir.
- **Diferencial clave:** Zero-upload. El PDF vive en el Drive del creador — Bukify nunca lo almacena.
- **Público objetivo:** Creadores de infoproductos en Latinoamérica (vendedores de Hotmart, coaches, autores de ebooks, cursos, guías descargables, revistas digitales).
- **Idioma primario:** Español neutro / rioplatense. Secundario: inglés.
- **Etapa:** Pre-lanzamiento (abril 2026).

### Tagline
> **Convierte PDFs en experiencias que venden.**

### One-liner
> Pegás un link de Google Drive y en segundos tenés un libro interactivo con efecto 3D listo para compartir. Sin subidas, sin fricción, sin excusas.

### Claims principales
- "Directo desde Google Drive — cero subidas."
- "De PDF a libro interactivo en 60 segundos."
- "Tu contenido, tus reglas."
- "Gratis para siempre · Sin tarjeta · Tus PDFs no salen de tu Drive."
- "Deja de compartir PDFs aburridos."

---

## 2. Identidad visual

### Isotipo / símbolo
- Ícono oficial actual: **Book Open** de la librería `lucide-react` (libro abierto de trazo simple).
- Color del ícono sobre fondo oscuro: **emerald-400** (`#34d399`).
- El ícono puede animarse abriéndose de cerrado → abierto (metáfora directa del producto).

### Logotipo
- **Wordmark:** `Bukify` en tipografía Geist Sans, peso **semibold (600)**, color blanco puro sobre fondo oscuro.
- **Composición:** ícono de libro + espacio de 8px + wordmark.
- No usar mayúsculas. Siempre `Bukify` con B mayúscula.

### Estilo general
- **Dark-first.** La landing y el branding principal viven en fondo negro / casi-negro.
- **Minimal, premium, con glow.** Aire de producto tech maduro (Linear, Vercel, Arc) pero más cálido y menos corporativo.
- **Glassmorphism sutil** en chips/badges: `bg-white/5`, `border-white/10`, `backdrop-blur`.
- **Grid sutil de fondo** (líneas de 1px al 5% de opacidad, grilla de 4rem) como textura.
- **Glow verde esmeralda** detrás de elementos principales (radial blur de `emerald-500/10`, ~120px de desenfoque).

---

## 3. Paleta de colores

### Color primario — Emerald (verde esmeralda)
El verde es EL color de Bukify. Se asocia con dinero, crecimiento, "go", y confianza premium.

| Rol | HEX | Notas |
|---|---|---|
| **Primary** | `#10b981` | Botones CTA, highlights, brand color principal (emerald-500 de Tailwind) |
| **Primary hover** | `#059669` | Hover de CTAs (emerald-600) |
| **Primary light** | `#34d399` | Iconos sobre fondo oscuro, íconos de acento (emerald-400) |
| **Primary lighter** | `#6ee7b7` | Gradientes, texto accent (emerald-300) |
| **Top loader** | `#2acf80` | Barra de progreso de navegación |
| **CTA glow** | `rgba(16, 185, 129, 0.3)` | Sombra persistente bajo botones de conversión |

### Gradiente de marca (para títulos y acentos)
```
linear-gradient(to right, #34d399, #6ee7b7)
```
Se usa sobre palabras clave en titulares (ej. "experiencias que venden" va en este gradiente).

### Fondos
| Rol | HEX | Uso |
|---|---|---|
| **Fondo principal oscuro** | `#000000` | Landing, hero, videos |
| **Fondo secundario** | `#0a0a0a` | Cards, secciones |
| **Neutral 900** | `#171717` | Superficies elevadas |
| **Neutral 800** | `#262626` | Bordes suaves |
| **Fondo claro** | `#ffffff` | Modo dashboard claro y páginas del libro (siempre blancas como papel real) |

### Textos
| Rol | HEX | Uso |
|---|---|---|
| Heading principal | `#ffffff` | Sobre fondo oscuro |
| Body | `#a3a3a3` (neutral-400) | Subtítulos, párrafos |
| Muted | `#737373` (neutral-500) | Footnotes, metadata |
| Extra muted | `#525252` (neutral-600) | Timestamps, URL bar de mockups |

### Acentos / estados
| Rol | HEX |
|---|---|
| Error / destructive | `#ef4444` (red-500) |
| Warning | `#eab308` (yellow-500) |
| Success | `#22c55e` (green-500) |

### Gradiente "rainbow" secundario (para CTA especial de registro)
Sólo se usa en el botón principal de sign-up (`RainbowButton` de Magic UI). No usar para nada más.
```
#ff4141 → #a141ff → #4196ff → #41e0ff → #a8ff41
```
(Equivalen a HSL 0, 270, 210, 195, 90 — todos con saturación 100%, luminosidad 63%.)

---

## 4. Tipografía

- **Familia principal:** [Geist Sans](https://vercel.com/font) (Google Fonts / Vercel).
- **Fallback:** `system-ui, -apple-system, sans-serif`.
- **Estilo:** geométrica moderna, excelente para tech/SaaS, muy legible a tamaño pequeño.

### Escala
| Uso | Tamaño | Peso | Tracking |
|---|---|---|---|
| H1 hero | 72px / 56px / 40px (desktop/tablet/mobile) | 700 (bold) | tracking-tight |
| H2 sección | 48px | 700 | tracking-tight |
| H3 tarjeta | 24px | 600 | normal |
| Body large | 20px | 400 | normal, leading-relaxed |
| Body | 16px | 400 | normal |
| Small / footnote | 12px | 400 | normal |
| Badge / chip | 14px | 500 | normal |

### Reglas
- Títulos siempre con `tracking-tight` (-0.02em aprox).
- Un sólo peso por bloque de texto (no mezclar bold con regular en la misma línea — usar color o gradiente para destacar).
- Frases cortas. Punchy. Español directo, no corporativo.

---

## 5. Voz y tono

### Principios
1. **Directo y accionable.** "Pegás un link y listo." No "descubra la potencia de…".
2. **Cercano, de tú a tú.** Español informal de LATAM (voseo funciona, tuteo también — evitar "usted").
3. **Honesto sobre fricciones.** "Sin subidas, sin fricción, sin excusas."
4. **Confiado pero no arrogante.** Hablamos de valor, no de features.
5. **Humor sutil, nunca cringe.** "Publicado antes de que termine el café."

### Palabras que SÍ usamos
creador · contenido · compartir · vender · libro · flipbook · link · gratis · en segundos · sin fricción · premium · blindado

### Palabras que NO usamos
solución · potenciar · revolucionar · disrupción · sinergia · empoderar · ecosistema (en sentido corporativo)

### Ejemplos de copy de referencia
- "Convierte PDFs en experiencias que venden."
- "Tus lectores van a pasar páginas como si tuvieran el libro en las manos."
- "Tu contenido blindado. Lectura segura sin descargas ni copias."
- "Deja de compartir PDFs aburridos."
- "Un link, mil posibilidades."

---

## 6. Motion language (para el video)

### Principios de animación
- **Smooth, no bouncy.** Easings tipo `easeOut` / `easeInOut`. Evitar `spring` muy rebotado.
- **Entradas con blur + fade + subida.** Los textos entran con `opacity 0 → 1`, `y: +10 → 0`, `filter: blur(4px) → blur(0)`.
- **Stagger pequeño.** Palabras de un título aparecen una a una con ~100ms de delay entre cada una.
- **Glows pulsantes.** El glow verde detrás del hero pulsa sutilmente: opacity 0.6 → 1 → 0.6 en 6 segundos, escala 1 → 1.05 → 1.
- **Border beams.** Bordes animados con un "haz de luz" que recorre el perímetro cada 8 segundos (colores `#10b981 → #34d399`).
- **Shimmer en textos destacados.** Efecto shiny que recorre horizontalmente cada 8s.
- **Transiciones entre shots:** crossfade de 400-600ms. Nunca cortes duros salvo para énfasis.

### Duración típica de elementos
- Entrada de hero completo: 1.4s total (stagger + fade del mockup).
- Flip de página (el hero del producto): 1.2s, easing suave.
- Aparición de features: 0.5s cada tarjeta, stagger 100ms.

### Timings para video social (sugeridos)
| Formato | Duración | Estructura |
|---|---|---|
| Reel / TikTok | 15-30s | Hook 0-2s → Problema 2-6s → Demo flip 6-18s → CTA 18-30s |
| Ad corto | 6s | Logo + tagline + CTA |
| Trailer product | 45-60s | Hero → 3 features → demo → pricing → CTA |

---

## 7. Elementos visuales característicos

### Para incluir en animaciones
- **Libro 3D con efecto flip.** El gesto del dedo arrastrando la esquina de una página y la página curvándose con física realista es EL hero shot. Simular con physics-based page curl, no con un fade o slide.
- **Sombra de lomo (spine).** Franja vertical oscura en el centro del libro abierto (gradient de `rgba(0,0,0,0.15)` a transparente).
- **Páginas siempre blancas.** Aunque el fondo sea negro, las páginas del libro son blanco puro `#ffffff` (como papel impreso real).
- **Mockup de navegador macOS.** Barra superior con 3 dots (rojo `#ef4444`, amarillo `#eab308`, verde `#22c55e`) + URL "bukify.io/dashboard".
- **Grid sutil de fondo.** Líneas de 1px al 5% de opacidad.
- **Iconos lucide.** Trazo de 1.5-2px, redondeados. Nunca usar iconos rellenos.
- **Google Drive icon.** Triángulo multicolor (amarillo/verde/azul) — aparece cuando mostramos la integración.

### Qué evitar
- Emojis como decoración principal (sí se usan en las 18 categorías de libros internas, pero no en marketing).
- Gradientes de arcoíris salvo en el CTA rainbow específico.
- Sombras duras tipo Material Design.
- Stock photography de gente en oficinas.
- Tipografías serif (salvo dentro del contenido del flipbook).

---

## 8. Librería de assets y componentes

- **Íconos:** [Lucide](https://lucide.dev) — `BookOpen`, `HardDrive`, `ArrowRight`, `Lock`, `Sparkles`, `Zap`, `Share2`.
- **Animaciones UI:** Motion (framer-motion v12) + [Magic UI](https://magicui.design) (BorderBeam, RainbowButton, AnimatedShinyText, Marquee).
- **UI base:** shadcn/ui (estilo "new-york") sobre Tailwind CSS v4.
- **Logos de terceros que suelen aparecer:** Google Drive, Hotmart, Shopify, MercadoPago, WhatsApp, WordPress (en la sección "Se integra con").

---

## 9. Prompts listos para el generador de video

### Prompt maestro (para cualquier video)
```
Estilo visual: dark-mode premium SaaS, fondo negro puro (#000000), glow
radial verde esmeralda (#10b981) detrás de los elementos principales, grid
sutil de líneas blancas al 5% de opacidad. Glassmorphism en chips y cards.
Tipografía Geist Sans semibold/bold, tracking tight, color blanco puro con
palabras clave en gradiente emerald-400 → emerald-300 (#34d399 → #6ee7b7).
Mood: tech, confiado, minimal, con calidez humana. Referencias: Linear,
Vercel, Arc Browser. Animaciones suaves con easeOut, entradas con blur+fade
+subida, sin rebotes bouncy. Idioma: español neutro de Latinoamérica.
Logo: ícono de libro abierto estilo lucide (outline, 1.5px stroke) en color
emerald-400 junto al wordmark "Bukify" en blanco.
```

### Prompt para Reel de 15 segundos (hook + demo)
```
Reel vertical 9:16, 15 segundos, fondo negro, estilo premium dark SaaS.
0-2s: Texto grande centrado "¿Todavía vendés PDFs?" en blanco, entra con
stagger palabra por palabra (blur a focus), fondo con grid sutil.
2-6s: Mockup de un PDF plano, aburrido, gris, con texto "Antes" arriba.
6-10s: Transformación animada: el PDF cobra vida y se convierte en un libro
3D que se abre, páginas se curvan con física realista. Glow verde esmeralda
detrás. Texto "Después" arriba.
10-13s: El libro flipa una página con gesto de arrastre. Sombra de lomo
visible. Páginas blanco puro.
13-15s: Logo Bukify (ícono libro emerald-400 + wordmark blanco) + CTA
"bukify.io · gratis" en botón verde esmeralda (#10b981) con glow.
Música: electrónica minimal, uplifting, 110 BPM.
```

### Prompt para Ad de 6s (awareness)
```
Video 1:1 o 16:9, 6 segundos, fondo negro.
0-2s: Link de Google Drive aparece pegándose en un input, cursor parpadea.
2-4s: El link se transforma en un libro 3D que gira en perspectiva,
mostrando páginas blancas con contenido. Glow verde atrás.
4-6s: Wordmark "Bukify" en blanco aparece con ícono de libro emerald-400 a
la izquierda. Abajo: "Convierte PDFs en experiencias que venden." Botón
verde #10b981 "Probar gratis" con sombra brillante.
```

### Prompt para Trailer de producto 45s
```
Video horizontal 16:9, 45 segundos, estilo dark premium SaaS.
Acto 1 (0-8s, Hook): "Los PDFs son del pasado." Texto grande con entrada
blur, fondo negro con grid. Cut a: carpeta de Google Drive abriéndose.
Acto 2 (8-25s, Demo): Un PDF de un ebook se abre, pdfjs renderiza páginas,
y la interfaz de Bukify (dashboard oscuro con sidebar) aparece. El creador
hace click en "Generar flipbook" y aparece una barra de progreso verde
#2acf80. El libro 3D se arma frente a la cámara. Flip de página con física.
Acto 3 (25-38s, Features): 3 cards en secuencia con stagger:
 - "Protegido con contraseña" (ícono Lock emerald-400)
 - "Un link mágico" (ícono Share)
 - "Sin subidas" (ícono HardDrive)
Acto 4 (38-45s, CTA): Logo Bukify + "Gratis para siempre · Sin tarjeta" +
botón RainbowButton con gradiente (#ff4141 → #a141ff → #4196ff → #41e0ff
→ #a8ff41) que dice "Publica tu primer ebook".
```

### Prompt para storytelling de 30s (problema → solución)
```
Reel 9:16, 30s, español LATAM neutro.
0-5s: Creador frustrado mirando un PDF en su laptop, zoom al PDF plano y
aburrido. Voz en off: "Vendés infoproductos… pero el PDF siempre queda."
5-12s: Transición: el PDF se levanta de la pantalla y se convierte en un
libro 3D flotante con efecto de page-flip. Fondo se oscurece, aparece el
glow verde. Voz: "Bukify convierte tu PDF en una experiencia premium."
12-22s: Montaje rápido: link pegándose desde Google Drive, libro
generándose, compartiendo por WhatsApp, lector en mobile pasando páginas.
Voz: "Pegás un link, elegís la portada, y compartís. En menos de un minuto."
22-30s: Cierre con logo, "bukify.io" y footnote "Gratis para siempre · Sin
tarjeta · Tus PDFs no salen de tu Drive." Botón verde con glow.
```

---

## 10. Do's & Don'ts rápidos

### Do
- Mostrar el efecto 3D de flip de página siempre que se pueda — es el diferencial visual.
- Usar fondo negro puro con un solo glow verde como punto focal.
- Poner frases cortas en pantalla, una idea a la vez.
- Cerrar con CTA verde esmeralda + footnote de "gratis / sin tarjeta".
- Usar Geist Sans y palabras destacadas en gradiente emerald.

### Don't
- No uses más de 2 colores de acento en el mismo shot (verde + blanco basta).
- No pongas stock photos de gente trabajando en oficinas.
- No uses "usted" ni jerga corporativa.
- No muestres el PDF como si fuera el producto — el producto es el libro interactivo.
- No animes con bounces exagerados o efectos 3D excesivos en el texto.

---

## 11. Metadata resumida (copiar-pegar)

```yaml
brand_name: Bukify
tagline_es: "Convierte PDFs en experiencias que venden"
tagline_en: "Turn PDFs into experiences that sell"
domain: bukify.io
category: SaaS / creator economy / Latam
audience: infoproduct creators, Hotmart sellers, coaches, ebook authors
tone: directo, cercano, confiado, español LATAM neutro
primary_color: "#10b981"       # emerald-500
primary_hover: "#059669"       # emerald-600
accent_light: "#34d399"        # emerald-400
accent_lighter: "#6ee7b7"      # emerald-300
gradient_brand: "linear-gradient(to right, #34d399, #6ee7b7)"
background: "#000000"
text_primary: "#ffffff"
text_muted: "#a3a3a3"
font_family: "Geist Sans"
font_weights: [400, 500, 600, 700]
icon_library: lucide
motion_library: framer-motion
mood: "dark premium SaaS with emerald glow"
hero_visual: "3D flipbook with physics-based page curl"
cta_primary: "Publica tu primer ebook gratis"
cta_secondary: "Probar gratis · Sin tarjeta"
```
