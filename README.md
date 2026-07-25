# Bocado 🍽️

Diario de comidas (PWA) para llevar un registro de lo que comes y compartirlo con tu nutricionista.

## Stack

- **Frontend**: TanStack Start + React 19, shadcn/ui, Tailwind CSS 4, TanStack Form + Zod, TanStack Query, date-fns
- **Backend**: PocketBase (auth + datos), con volumen en Railway
- **Fotos**: UploadThing
- **Calidad**: Biome, TypeScript strict, Husky + lint-staged, Vitest, Testing Library, Playwright
- **Despliegue**: Railway (app y PocketBase como servicios separados)

## Desarrollo local

```bash
pnpm install
cp .env.example .env   # y rellena UPLOADTHING_TOKEN

# Terminal 1: PocketBase (aplica migraciones de pb/pb_migrations al arrancar)
cd pb && ./pocketbase serve

# Terminal 2: la app
pnpm dev               # http://localhost:3000
```

Si no tienes el binario de PocketBase (está gitignoreado), descárgalo de
[pocketbase.io](https://pocketbase.io/docs/) y colócalo en `pb/`. Crea el
superusuario local con:

```bash
cd pb && ./pocketbase superuser upsert admin@bocado.local <password>
```

y pon esas credenciales en `.env` (`PB_SUPERUSER_*`, las usan las server
functions para los enlaces compartidos).

## Tests

```bash
pnpm test        # unitarios (Vitest)
pnpm test:e2e    # Playwright (requiere PocketBase corriendo en :8090)
pnpm check       # Biome
```

## Modelo de datos (PocketBase)

- `users` — colección auth estándar (+ `name`).
- `meals` — `user`, `description`, `photo_url`, `photo_key`, `meal_type`
  (desayuno/almuerzo/comida/merienda/cena/snack), `eaten_at`. Reglas: cada
  usuario solo ve/edita lo suyo.
- `share_links` — `user`, `token` (único), `active`. La ruta pública
  `/share/:token` lee las comidas vía server function con superusuario.

Las migraciones viven en `pb/pb_migrations/` y se aplican solas al arrancar.

## Despliegue en Railway

Proyecto `bocado` con dos servicios ya creados:

- **App**: https://app-production-5415.up.railway.app
- **PocketBase**: https://pocketbase-production-29f5.up.railway.app (panel en `/_/`)

Para redesplegar: `railway up -s app -d` desde la raíz, o
`railway up -s pocketbase -d` desde `pb/`.

Configuración de referencia:

**1. PocketBase**
- Servicio desde este repo con *Root Directory* `pb/` (usa `pb/Dockerfile`).
- Añade un **volumen** montado en `/pb_data`.
- Genera un dominio público (p. ej. `bocado-pb.up.railway.app`).
- Crea el superusuario de producción:
  `pocketbase superuser upsert <email> <password>` (una vez, desde la shell del
  servicio) o desde el panel `/_/` en el primer arranque.

**2. App (TanStack Start)**
- Servicio desde la raíz del repo (Nixpacks, ya configurado en
  `nixpacks.toml`).
- Variables:
  - `VITE_POCKETBASE_URL` → URL pública de PocketBase
  - `POCKETBASE_URL` → URL interna (`http://<servicio>.railway.internal:8080`)
  - `PB_SUPERUSER_EMAIL` / `PB_SUPERUSER_PASSWORD`
  - `UPLOADTHING_TOKEN`

## PWA

La app incluye manifest + service worker (`vite-plugin-pwa`). En el móvil:
*Compartir → Añadir a pantalla de inicio*. Los iconos de `public/pwa-*.png`
son placeholders — sustitúyelos por el logo real (192, 512 y apple-touch 180).
