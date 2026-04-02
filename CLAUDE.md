# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build (output: dist/)
npm run watch      # Build in watch mode (development)
npm test           # Run tests with Karma + Jasmine
```

No lint command is configured.

## Architecture Overview

**Stack:** Angular 20 (standalone components, zoneless change detection), TypeScript 5.8.2, Tailwind CSS 4, Angular Material, RxJS, Firebase Auth + JWT.

**App structure:**
```
src/app/
├── components/     # Feature components (one folder per feature)
├── services/       # Feature services (one folder per feature)
├── models/         # TypeScript model classes
├── shared/         # Reusable UI components (toast, loading, confirm-modal, icons, pipes)
├── guards/         # auth-guard (checks JWT in localStorage)
├── interceptors/   # auth.interceptor (adds Bearer token to all HTTP requests)
├── pipes/          # mes-es-pipe, filter-tipo-transaccion-pipe
└── environment/    # environment.ts with apiUrl and Firebase config
```

## Routing

Two guards protect routes:
- `authGuard` — checks `localStorage.getItem('jwtToken')`
- `spaceGuard` — checks that an active space is selected (redirects to `/select-space` if not)

All feature routes require both guards and nest under `/dashboard`:

| Path | Component |
|------|-----------|
| `/` | Login |
| `/registro` | Registration |
| `/select-space` | Space selector (after login with multiple spaces) |
| `/create-space` | Create a new shared space |
| `/dashboard/home` | Home |
| `/dashboard/movimientos` | Transaction list/filter view |
| `/dashboard/cuentas/debito` | Debit accounts list |
| `/dashboard/cuentas/debitof` | Debit account form (create) |
| `/dashboard/cuentas/debitof/:id` | Debit account form (edit) |
| `/dashboard/cuentas/tdc` | Credit cards list |
| `/dashboard/cuentas/tdcf` | Credit card form (create) |
| `/dashboard/cuentas/tdcf/:id` | Credit card form (edit) |
| `/dashboard/msi` | Multi-installment transactions |
| `/dashboard/categorias` | Category management |
| `/dashboard/transacciones-recurrentes` | Recurring transactions |
| `/dashboard/perfil/espacios` | Profile — spaces management (default perfil child) |

## State Management

Services use RxJS `BehaviorSubject` for reactive state — no NgRx or external state library.

```typescript
// Pattern used throughout services
private cuentasList = new BehaviorSubject<Cuenta[]>([]);
cuentasList$ = this.cuentasList.asObservable();
setCuentasList(cuentas: Cuenta[]) { this.cuentasList.next(cuentas); }
```

All services are `providedIn: 'root'` singletons. Key global services:
- `GeneralService` — screen indicator (`screen$`) and refresh trigger (`actualizaPantalla$`)
- `ToastService` (in `shared/toast/`) — app-wide toast notifications

## HTTP & API

- Base URL: `environment.apiUrl` (defaults to `http://localhost:8080` in dev)
- Auth interceptor automatically injects `Authorization: Bearer {jwtToken}` header
- Standard response shape: `{ coderr: string, message: string, data: any }` — `"0000"` means success
- Services use `.pipe(tap(...), catchError(...))` — `tap` triggers side-effect data reloads after mutations

## Component Patterns

**Standalone components** — import dependencies explicitly, no NgModules.

**Template-driven forms** — `[(ngModel)]` two-way binding with manual validation flags (e.g., `valEmail: boolean`).

**Modal pattern** — modals are components hosted by parent with boolean visibility flags:
```typescript
mostrarModal = false;
// Template: <app-modal *ngIf="mostrarModal" (cerrar)="mostrarModal = false" />
```

**Subscription management** — components subscribe in `ngOnInit()` and unsubscribe in `ngOnDestroy()` manually (no async pipe pattern used here).

## Authentication & Space Selection Flow

1. Firebase Auth (email/password or Google) → get ID token
2. `POST /api/users/create-token` with Firebase token → backend returns JWT
3. JWT stored in `localStorage` as `jwtToken`
4. Load user spaces via `GET /api/spaces`:
   - If 1 space → auto-select it, navigate to `/dashboard/home`
   - If multiple spaces → navigate to `/select-space`
5. Selected space ID stored in `localStorage` as `selectedSpaceId` via `SpaceService`
6. `spaceGuard` checks that a space is selected before allowing dashboard access

### Interceptors (ordered)
1. `auth.interceptor` — adds `Authorization: Bearer {jwtToken}` to all requests
2. `space.interceptor` — adds `X-Space-Id: {selectedSpaceId}` to all requests (required by all feature endpoints)

## Models

Model classes in `src/app/models/` include helper methods like `limpiar()` (reset), `getImporte()`/`setImporte()` (handle currency string↔number conversion). Key models: `Transaccion`, `Cuenta`, `Tarjeta`, `Categoria`, `MSI`, `TransaccionRecurrente`, `Transferencia`, `Perfil`.

## Styling

Tailwind CSS 4 via PostCSS. Custom utility classes defined in `src/styles.css` using `@apply` (e.g., `.input-form-text`, `.input-form-currency`, `.select-form`). Component-scoped `.css` files (not SCSS).
