# Architecture

## Folders

```
libs/                         every library lives outside src/
  core/                       @tamam/core    – cross-cutting code every feature may use
  shared/                     @tamam/shared  – reusable UI (components, pipes, directives)
  feature/
    landing/  auth/  dashboard/  orders/  customers/  carriers/  products/
    billing/  notifications/  merchant/  admin/  public-links/
src/
  app/                        the shell only: routes, layout, config
  environments/               project-wide settings (api url, storage secret, ...)
```

Each library is imported only through its **public API** (`public-api.ts`), mapped in `tsconfig.json`:
`import { ORDERS_ROUTES } from '@tamam/orders'`. Never import a file from inside another library.

## Inside a feature library

```
libs/feature/orders/
  public-api.ts               the only file other code may import – export only what must be visible
  src/lib/
    orders.routes.ts          ORDERS_ROUTES (lazy, loaded by src/app/app.routes.ts)
    models/                   interfaces that mirror the backend DTOs
    services/                 API services (use ApiClient from core)
    store/                    the feature's SignalStore (state of this feature only)
    pages/                    routed components
    components/               components used only by this feature
```

## Where state lives

- **Feature state** (orders list, filters, selected order...) → a SignalStore inside the feature library.
  It is private to the library; the public API exports it only if another part of the app needs it.
- **Session state** (who is signed in) → `UserStore` in `@tamam/core`, because every feature needs it.
  `UserService` (core) talks to `/auth/*` and updates the store.
- Features never import each other. Shared things move down to `core` or `shared`.

## Core

| Piece | What it does |
|---|---|
| `provideCore(environment)` | registers the environment, `HttpClient` + interceptors, and restores the saved session before the app starts |
| `ApiClient` | the only code that uses `HttpClient`; adds the base url and returns `data` from the response envelope |
| `ApiError` / `isApiError` | what every failed call throws (`statusCode`, `message`, `errors`) |
| `authInterceptor` | adds `Authorization: Bearer` to requests to our API |
| `errorInterceptor` | converts failures to `ApiError`, ends the session on 401, toasts 0 / 403 / 429 / 5xx |
| `UserStore` / `UserService` | session, role flags, login / register / logout |
| `SecureStorage` | localStorage with AES-GCM encryption; **all** browser storage must go through it |
| `authGuard`, `guestGuard`, `roleGuard(...)`, `homeGuard` | route protection |
| `ToastService` | messages shown by `<tamam-toast-host />` (from `@tamam/shared`) |

### About the encrypted storage

The AES key is derived from `storageSecret` in the environment file, which is shipped with the app.
It stops people reading the token from DevTools or a copied profile; it does **not** protect against a script
running inside the page (XSS). Use a different `storageSecret` per environment.

## Routes

`src/app/app.routes.ts` is the only place that decides who can reach what:

- `/auth/*` guests only · `/c/:token`, `/s/:token` public (customer links) · everything else needs a session
- `roleGuard(RoleNames.Owner, ...)` per feature; `/admin` is `PlatformAdmin` only
- the side menu is `src/app/layout/nav-items.ts` (each item lists its roles)

## Adding a feature

1. Create `libs/feature/<name>/` with the layout above and a `public-api.ts`.
2. Add its alias to `tsconfig.json` (`@tamam/<name>`).
3. Add a lazy route in `src/app/app.routes.ts` and (if it has a menu entry) in `nav-items.ts`.

## Environments

`src/environments/environment.ts` is production; `ng serve` swaps in `environment.development.ts`.
Libraries never import these files: the values are injected through `APP_ENVIRONMENT`.

## Shared UI (`@tamam/shared`)

Built on Bootstrap 5.3 RTL (CSS only, no Bootstrap JS) and bootstrap-icons; brand tokens are in `src/styles.scss`.

| Piece | Use |
|---|---|
| `tamam-empty-state`, `tamam-loading` (spinner / skeleton / inline) | every list and page needs both |
| `tamam-page-header`, `tamam-pagination`, `tamam-search-box`, `tamam-stat-card`, `tamam-meter-list` | page building blocks |
| `tamam-modal`, `ConfirmService` + `tamam-confirm-host` | dialogs on native `<dialog>` |
| `tamam-field` | label + error + hint wrapper for Signal Forms controls |
| `tamam-badge`, order status / risk badges | colored labels |
| `[tamamTooltip]` | truncates long text and shows a tooltip only when it is cut |
| `money`, `tamamDate` pipes | Latin digits, Arabic labels |

## Local run

Backend `https://localhost:7265` needs `Cors:AllowedOrigins` containing `http://localhost:4200` (see `appsettings.Example.json`).
Then `npm install` and `npx ng serve`.
