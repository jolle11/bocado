# Bocado 🍽️

Diario de comidas (PWA) para llevar un registro de lo que comes y compartirlo con tu nutricionista.

## Stack

- **Frontend**: TanStack Start + React 19, shadcn/ui, Tailwind CSS 4, TanStack Form + Zod, TanStack Query, date-fns
- **Backend**: PocketBase (auth + datos), con volumen en Railway
- **Fotos**: UploadThing
- **Calidad**: Biome, TypeScript strict, Husky + lint-staged, Vitest, Testing Library, Playwright
- **Despliegue**: Railway (app, PocketBase y push worker como servicios separados)

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
- `meals` — `user`, `description`, `photo_url`, `photo_key`, `photos`, `meal_type`
  (desayuno/almuerzo/comida/merienda/cena/snack), `eaten_at`. Reglas: cada
  usuario solo ve/edita lo suyo.
- `share_links` — `user`, `token` (único), `active`. La ruta pública
  `/share/:token` lee las comidas vía server function con superusuario.

Las migraciones viven en `pb/pb_migrations/` y se aplican solas al arrancar.

## Despliegue en Railway

Proyecto `bocado` con tres servicios:

- **App**: https://bocado.up.railway.app
- **PocketBase**: https://bocadobackend.up.railway.app (panel en `/_/`)
- **Push worker**: proceso privado que envía recordatorios Web Push

Para redesplegar desde la raíz: `railway up -s app -d`,
`railway up -s pocketbase -d` o `railway up -s push-worker -d`.

Configuración de referencia:

**1. PocketBase**
- Servicio desde la raíz del repo con Dockerfile Path `pb/Dockerfile`.
  El Dockerfile copia `pb/pb_migrations` desde ese contexto.
- Añade un **volumen** montado en `/pb_data`.
- Genera un dominio público (p. ej. `bocado-pb.up.railway.app`).
- Crea el superusuario de producción:
  `pocketbase superuser upsert <email> <password>` (una vez, desde la shell del
  servicio) o desde el panel `/_/` en el primer arranque.

**2. App (TanStack Start)**
- Servicio desde la raíz del repo con builder **Railpack**, configurado en
  `railpack.json` (Node 22 y pnpm 9.15.9).
- Railpack instala las dependencias una sola vez y mantiene su caché automática.
  La imagen final incluye Node y `.output`, con las dependencias de producción
  trazadas por Nitro, y arranca con `node .output/server/index.mjs`.
  No copia el código fuente ni el `node_modules` completo al runtime.
- Variables:
  - `VITE_POCKETBASE_URL` → URL pública de PocketBase
  - `POCKETBASE_URL` → URL interna (`http://<servicio>.railway.internal:8080`)
  - `PB_SUPERUSER_EMAIL` / `PB_SUPERUSER_PASSWORD`
  - `UPLOADTHING_TOKEN`
  - `VITE_VAPID_PUBLIC_KEY` → clave pública VAPID

**3. Push worker**

Crea otro servicio desde el mismo repositorio con Root Directory
`push-worker/`. Railway detectará su `Dockerfile`; no necesita dominio público.
Configura estas variables:

- `POCKETBASE_URL` → URL interna de PocketBase
- `PB_SUPERUSER_EMAIL` / `PB_SUPERUSER_PASSWORD`
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` → por ejemplo `mailto:admin@tudominio.com`
- `WORKER_INTERVAL_MS` → opcional; por defecto `300000` (5 minutos)

Genera una única pareja VAPID y reutiliza su clave pública tanto en la app como
en el worker:

```bash
npx web-push generate-vapid-keys
```

El worker consulta los horarios en la zona horaria de cada usuario. Solo envía
un recordatorio por usuario, día local y comida; agua y extras no cuentan como
una comida registrada. Las suscripciones expiradas se eliminan automáticamente.

### Builds y filtros de despliegue

Los **Watch Paths** están configurados en Railway por servicio y se evalúan
respecto a la raíz del repositorio, también para el worker:

- **App**: `/src/**`, `/public/**`, `/scripts/**`, `/package.json`,
  `/pnpm-lock.yaml`, `/vite.config.*`, `/tsconfig*.json`, `/tsr.config.json`,
  `/railpack.json`, `/.railwayignore`, `/.dockerignore`.
- **PocketBase**: `/pb/**`, `/.dockerignore`, `/.railwayignore`.
- **Push worker**: `/push-worker/**`, `/.railwayignore`.

Estos filtros evitan builds cuando no cambian las entradas del servicio.
Railway también puede omitir un `railway up` sin cambios relevantes. Si añades
una entrada nueva al build, inclúyela también en los Watch Paths del servicio
correspondiente. Para forzar la reconstrucción del último despliegue, usa
`railway redeploy -s app -y`.

El worker usa `npm ci` con su lockfile y una capa de dependencias separada del
código. `.railwayignore` y los `.dockerignore` excluyen dependencias locales,
artefactos y datos de PocketBase de los contextos de despliegue.

Para comparar tiempos, revisa por separado instalación, compilación,
exportación de imagen y arranque. Compara también un segundo build con caché;
el primero tras cambiar la configuración puede tener que reconstruir capas.

## PWA

La app incluye manifest, service worker, favicons e iconos de instalación. En el
móvil: *Compartir → Añadir a pantalla de inicio*.
