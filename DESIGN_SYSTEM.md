# FindMatchingJobs — Design System

> Sistema de diseño unificado para la plataforma de matching laboral estudiantil.

---

## 1. Filosofía de diseño

- **Claridad sobre creatividad** — la interfaz debe ser funcional primero, atractiva después.
- **Consistencia** — un solo patrón visual en toda la aplicación (colores, espaciado, tipografía, iconos).
- **Jerarquía visual** — tamaño, peso, color y espaciado definen la importancia, no decoración arbitraria.
- **Mobile-first** — todo componente se diseña desde 375px hacia arriba.
- **Español-first** — toda la UI está en español (labels, mensajes, errores).

---

## 2. Paleta de colores

### Tokens CSS (definidos en `globals.css`)

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` (blanco) | `oklch(0.145 0 0)` | Fondo de página |
| `--foreground` | `oklch(0.145 0 0)` (casi negro) | `oklch(0.985 0 0)` | Texto principal |
| `--primary` | `#F5B316` (ámbar) | `oklch(0.922 0 0)` | Acciones principales, CTAs, acentos |
| `--primary-foreground` | `#0B1C4A` (navy) | `oklch(0.205 0 0)` | Texto sobre primary |
| `--secondary` | `#0B1C4A` (navy oscuro) | `oklch(0.269 0 0)` | Fondos destacados, secondary buttons |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Texto sobre secondary |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Fondos secundarios, hover states |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Texto secundario, metadatos |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Bordes de componentes |
| `--ring` | `#0B1C3A` | `oklch(0.556 0 0)` | Focus ring en inputs y botones |
| `--destructive` | `oklch(0.577 0.245 27.325)` (rojo) | `oklch(0.704 0.191 22.216)` | Acciones destructivas, errores |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Fondo de cards |
| `--radius` | `0.625rem` (10px) | mismo | Radio base |

### Reglas de uso

| Contexto | Token obligatorio? | Prohibido |
|---|---|---|
| Fondos de página | `bg-background` | `bg-gray-50`, `bg-white` directo |
| Texto principal | `text-foreground` | `text-gray-900`, `text-black` |
| Texto secundario | `text-muted-foreground` | `text-gray-500` directo |
| Cards | `bg-card text-card-foreground border` | `bg-white` directo |
| CTAs principales | `bg-primary text-primary-foreground` | `bg-amber-500 text-gray-900` |
| Bordes de input | `border-input` | `border-gray-300` |
| Focus | `focus:ring-ring` | `focus:ring-amber-500` |

### Paleta de acento — Circle de match score

| Rango | Color |
|---|---|
| Score ≥ 80 | `bg-green-500` |
| 60 ≤ Score < 80 | `bg-yellow-500` |
| Score < 60 | `bg-red-500` |

---

## 3. Tipografía

| Propiedad | Valor |
|---|---|
| Font family (sans) | `Inter` (variable `--font-sans`) |
| Font family (heading) | `Inter` (misma que sans) |
| Fallback | `system-ui, sans-serif` |

### Escala tipográfica

| Clase | Tamaño | Peso | Uso |
|---|---|---|---|
| `text-xs` | 12px | `font-medium` | Labels, metadatos, pills |
| `text-sm` | 14px | `font-medium` | Cuerpo secundario, nav items |
| `text-base` | 16px | `font-normal` | Cuerpo principal |
| `text-lg` | 18px | `font-semibold` | Subtítulos |
| `text-xl` | 20px | `font-semibold` | Títulos de sección |
| `text-2xl` | 24px | `font-bold` | Títulos de página |
| `text-3xl` | 30px | `font-bold` | Hero / Landing |

### Jerarquía en títulos de card

```
card:
  └─ h2: text-sm font-semibold  (título de card)
  └─ p:  text-xs text-muted-foreground  (metadata)

dashboard page:
  └─ h1: text-2xl font-bold  (título de página)
```

### Reglas

- `leading-tight` para headings, `leading-relaxed` para body.
- Mínimo 16px en body para evitar zoom automático en iOS.
- No usar `text-gray-*` directo, siempre `text-muted-foreground` para texto secundario.

---

## 4. Espaciado & Layout

### Sistema de espaciado (escala 4/8px)

| Clase | Valor |
|---|---|
| `gap-1` / `p-1` | 4px |
| `gap-2` / `p-2` | 8px |
| `gap-3` / `p-3` | 12px |
| `gap-4` / `p-4` | 16px |
| `gap-5` / `p-5` | 20px |
| `gap-6` / `p-6` | 24px |
| `gap-8` / `p-8` | 32px |
| `gap-10` / `p-10` | 40px |

### Breakpoints

| Alias | Ancho | Target |
|---|---|---|
| `sm` | 640px | Tablets pequeñas |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop grande |

### Layout de dashboard

```
┌─────────────┬──────────────────────────────────────┐
│             │          Navbar (h-16)                │
│   Sidebar   ├──────────────────────────────────────┤
│   (w-64/    │                                      │
│    w-16)    │          Main (p-10, overflow-y)     │
│             │                                      │
└─────────────┴──────────────────────────────────────┘
  bg-gray-100     bg-blue-50 (layout) → bg-background (content)
```

### Grid de dashboard cards

```
md:grid-cols-2:
┌─────────────────────┐  ┌─────────────────────┐
│  ProfileCard        │  │  SkillsCard         │
│  (destacada)        │  │  (blanca)           │
└─────────────────────┘  └─────────────────────┘
┌─────────────────────────────────────────────┐
│  MatchesCard / JobsCard                     │
└─────────────────────────────────────────────┘
```

### Contenedores

- Dashboard main content: `p-10` (40px padding).
- Formularios: `max-w-4xl mx-auto`.
- Páginas de listado (matches, jobs): `container mx-auto` con grid `md:grid-cols-4` (sidebar filtros 1/4, contenido 3/4).

---

## 5. Componentes

### Card (estándar)

```
rounded-xl border bg-card p-5 shadow-sm
  └─ (opcional) hover:shadow-md transition-shadow
```

### ProfileCard (destacada)

```
rounded-xl border border-secondary/20 shadow-lg
bg-gradient-to-br from-secondary to-[#0f1f5a]
p-6 overflow-hidden
  └─ accent strip: absolute left-0 top-0 h-full w-[3px] bg-primary
  └─ decorative icon: absolute -bottom-4 -right-4 size-20 text-white/[0.06]
  └─ content: relative z-10
       └─ h2: text-2xl font-semibold text-white
       └─ progress text: text-xs text-blue-200
       └─ progress bar bg: bg-white/20
       └─ progress fill: bg-primary
       └─ CTA: bg-primary text-secondary w-full
```

### Botones

| Variant | Clase | Uso |
|---|---|---|
| `default` | `bg-primary text-primary-foreground` | CTA principal |
| `outline` | `border-border bg-background hover:bg-muted` | Acción secundaria |
| `secondary` | `bg-secondary text-secondary-foreground` | Alternativo |
| `ghost` | `hover:bg-muted` | Acción sutil |
| `destructive` | `bg-destructive/10 text-destructive` | Eliminar, peligro |
| `link` | `text-primary underline-offset-4 hover:underline` | Link como botón |

Tamaños: `default` (h-8), `sm` (h-7), `lg` (h-9), `xs` (h-6), `icon` (size-8).

**NO** usar valores hardcodeados como `bg-amber-500` o `rounded-lg` con px fijos — usar siempre los tokens/variants del componente Button.

### Input

```
rounded-lg border border-input bg-background px-3 py-2 text-sm
focus:border-ring focus:ring-3 focus:ring-ring/50
placeholder:text-muted-foreground
disabled:opacity-50
```

Con icono dentro: `pl-9` + icono absolute `left-3 top-1/2 -translate-y-1/2`.

### Navegación (Sidebar + Navbar)

- **Sidebar:** `w-64` expandido / `w-16` colapsado, `transition-all duration-300`, fondo `bg-gray-100`.
  - Item activo: `bg-gray-200 shadow-sm`.
  - Item hover: `hover:bg-gray-200 hover:shadow-sm`.
  - Logo: `GraduationCap` lucide en `text-primary`.
- **Navbar:** `h-16`, `border-b-2 bg-white px-4`.
  - Avatar: `rounded-full bg-secondary text-white`.
  - Dropdown: `rounded-lg border bg-white shadow-lg` con click-outside handler.

### Match Score Badge

```
w-14 h-14 (card) / w-16 h-16 (detail) rounded-full
bg-{green|yellow|red}-500
flex items-center justify-center text-white font-bold text-lg
  └─ label debajo: text-xs font-semibold text-{green|yellow|red}-700
```

### Skeleton Loading

```
animate-pulse rounded-xl border bg-card p-5
  └─ bg-muted para las barras placeholder
```

Usar componentes skeleton dedicados (`MatchCardSkeleton`, `JobCardSkeleton`, `SkeletonCard`, `JobDetailSkeleton`).

---

## 6. Iconos

### Librería oficial: **lucide-react**

| Contexto | Prohibido |
|---|---|
| Botones, navegación, inputs | Emojis (`🎯`, `🤖`, `🔍`, `⚙️`, etc.) |
| Indicadores visuales | SVG inline escritos a mano (usar componente de lucide) |

### Reglas

- Siempre `size-4` (16px) o `size-5` (20px) dentro de botones/inputs.
- `size-8` para logo en sidebar.
- Usar `gap-2` entre icono y texto.
- Iconos decorativos (sin interacción): `pointer-events-none`.

### Set de iconos comunes

| Concepto | Icono lucide |
|---|---|
| Dashboard | `LayoutDashboard` |
| Vacantes | `Briefcase` |
| Matches | `Target` |
| Perfil | `User`, `Settings` |
| Skills | `GraduationCap` |
| Email | `Mail` |
| Contraseña | `Lock` |
| Ojo (show/hide) | `Eye`, `EyeOff` |
| Cerrar sesión | `LogOut` |
| Flecha atrás | `ArrowLeft` |
| Guardar | `Save` |
| Buscar | `Search` |
| Check | `CircleCheckBig` |

---

## 7. Animación

| Propósito | Duración | Easing |
|---|---|---|
| Hover en cards (sombra) | 200ms | `ease-out` |
| Sidebar toggle | 300ms | `ease-in-out` |
| Fade-up (auth form) | 250ms | `ease-out` |
| Skeleton pulse | 2s | `ease-in-out` |
| Transiciones color | 150-200ms | `ease-out` |

### Reglas

- Usar `transition-colors` para cambios de color/hover.
- Usar `transition-all` solo cuando sea necesario (preferir propiedades específicas).
- No animar `width`, `height`, `top`, `left` — usar `transform`.
- Respetar `prefers-reduced-motion` (el navegador lo maneja automáticamente con Tailwind/animaciones CSS).

---

## 8. Dark Mode

### Implementación

- Activado por clase `.dark` en `<html>`.
- Usar `@custom-variant dark (&:is(.dark *))` (Tailwind v4).
- Todas las variables de color tienen variante dark en `globals.css`.

### Pautas de contraste (dark mode)

| Elemento | Ratio mínimo |
|---|---|
| Texto principal vs fondo | 4.5:1 |
| Texto secundario vs fondo | 3:1 |
| Bordes y separadores | Visibles (no desaparecer) |
| Estados (hover, focus) | Igual de distinguibles que en light |

**NO** asumir que los valores de light mode funcionan en dark — verificar siempre.

### Desarrollo

- Usar exclusivamente tokens CSS (no valores hardcodeados) para que el dark mode funcione automáticamente.
- Mal: `text-gray-900` — Bien: `text-foreground`
- Mal: `bg-white` — Bien: `bg-background` o `bg-card`
- Mal: `border-gray-200` — Bien: `border-border`

---

## 9. Accesibilidad

| Regla | Estándar |
|---|---|
| Contraste texto normal | ≥ 4.5:1 (WCAG AA) |
| Contraste texto grande (≥18px bold o ≥24px) | ≥ 3:1 |
| Touch targets | ≥ 44×44px (iOS) / ≥ 48×48dp (Android) |
| Focus rings | Visibles en todos los interactive elements |
| Alt text | En todas las imágenes significativas |
| Aria labels | En icon-only buttons |
| Labels de formulario | Visibles (nunca placeholder-only) |
| Color | Nunca como único indicador de estado |
| Navegación teclado | Tab order = orden visual |

---

## 10. Anti-patrones (evitar)

1. **Colores hardcodeados** — no usar `text-gray-700`, `bg-gray-50`, `border-gray-200` directamente. Usar tokens: `text-muted-foreground`, `bg-muted`, `border-border`.
2. **Emojis como iconos estructurales** — no poner `🎯` o `🤍` en títulos de card. Usar `Target`, `Heart` de lucide-react.
3. **SVG inline** — no escribir paths SVG a mano. Usar componentes de lucide-react.
4. **Padding asimétrico sin razón** — mantener padding consistente (ej. `p-6` simétrico).
5. **Anchos fijos en cards** — no usar `w-64` en componentes que van en grid. Usar `w-full` y dejar que el grid controle.
6. **Textos "Cargando..."** — usar skeletons o spinners (`LoaderCircle` de lucide).
7. **Mix de variantes de botón** — no usar `bg-amber-500` en botones. Usar el componente `Button` con `variant="default"`.
8. **Links rotos** — verificar rutas antes de pushear (`/dashboard/skills` no existe, es `/perfil`).

---

## 11. Estructura de archivos (frontend)

```
src/
├── app/
│   ├── globals.css          — Tokens, tema, animaciones
│   ├── layout.tsx           — Root layout, Google Fonts
│   ├── page.tsx             — Redirect → /dashboard
│   ├── auth/                — Login/Register
│   ├── dashboard/           — Home del dashboard
│   ├── jobs/                — Listado + detalle de vacantes
│   ├── matches/             — Listado de matches
│   └── perfil/              — Editor de perfil
├── components/
│   ├── ui/                  — Primitivos (Button, Input, Checkbox, Tabs)
│   ├── dashboard/           — Dashboard layout + cards
│   ├── perfil/              — Formulario de perfil
│   ├── matches/             — Match card + filtros
│   └── jobs/                — Job card + detalle
└── lib/
    └── utils.ts             — cn() helper
```

---

> Mantén este documento actualizado a medida que evoluciona el sistema de diseño. Cualquier nuevo token, patrón o componente debe agregarse aquí.
