# Project: Jorgito Store Migration to Firebase (Auth + Firestore)

## Architecture
- **Frontend Architecture**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Framer Motion.
- **Routing**: Dual Path (`/admin`) and Hash (`#admin`) routing in `src/App.tsx` via standard browser History API and window listeners.
- **Backend / BaaS**: Google Firebase (Firebase Auth for Owner Authentication + Cloud Firestore for Product Catalog & Sales Interactions).
- **Data Flow**:
  - Store Catalog: Firestore collection `products` -> `useProducts()` hook with `onSnapshot` -> `ProductCatalog` & `SpecComparison`. Resilient fallback to local `IPHONE_PRODUCTS` when offline or empty.
  - Checkout Interactions: `WhatsAppModal` / `CartDrawer` -> `src/lib/interactions.ts` -> Firestore collection `interactions`.
  - Admin Management: `/admin` -> `AdminPage` (checks `auth.currentUser` via `onAuthStateChanged`) -> `AdminLogin` if unauthenticated, `AdminDashboard` if authenticated.
  - Admin CRUD: `AdminDashboard` -> direct Firestore `products` mutations (`addDoc`, `updateDoc`, `deleteDoc`, `setDoc` for seeder) -> instant real-time sync to all clients.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Cleanup Legacy Files | Delete `api/` directory, `seed-sheet.cjs`, `test-sheets.js`, `loti-cb95f-c05c8618fd54.p12` | M1 | R1 |
| 2 | Clean Dependencies & Config | Remove `googleapis` and `test:sheets` from `package.json`, remove `apiDevPlugin` from `vite.config.ts`, update `vercel.json` | M1 | R1 |
| 3 | Preserve & Augment Types | Keep `ColorOption`, `StorageOption`, `iPhoneProduct` in `src/types/index.ts`, add `stock?: number`, `active?: boolean`, and `StoreInteraction` | M1 | R1, R4 |
| 4 | Firebase SDK Initialization | Create `src/lib/firebase.ts` with thorcitostore credentials, exporting `db` and `auth` with HMR idempotency guard | M2 | R2 |
| 5 | Interaction Logger | Create `src/lib/interactions.ts` for non-blocking logging of WhatsApp orders and cart checkouts to Firestore `interactions` collection | M2 | R2, R4 |
| 6 | Realtime Store Catalog Sync | Implement `src/hooks/useProducts.ts` with `onSnapshot` on `products` collection, fallback to `IPHONE_PRODUCTS` | M3 | R5 |
| 7 | Catalog & Specs Integration | Update `ProductCatalog.tsx` to use `useProducts()`, fix TypeScript errors in `SpecComparison.tsx` and mount in `src/App.tsx` | M3 | R5 |
| 8 | WhatsApp Modal & Cart Sync | Update `WhatsAppModal.tsx` and `CartDrawer.tsx` to log interactions to Firestore via `src/lib/interactions.ts` | M3 | R5 |
| 9 | Owner Authentication Page | Create `src/pages/AdminLogin.tsx` with email/password login using Firebase Auth and user-friendly error messages | M4 | R3 |
| 10 | Protected Admin Route & Router | Implement dual Path/Hash routing in `src/App.tsx` and protected `src/pages/AdminPage.tsx` | M4 | R3 |
| 11 | Discrete Footer Admin Link | Add "Acceso Administración" link with `Lock` icon in copyright row of `src/components/Footer.tsx` | M4 | R3 |
| 12 | Admin Inventory CRUD | Implement product creation, editing (price, colors, storage, stock, image), active toggle, and deletion in `src/components/AdminDashboard.tsx` | M5 | R4 |
| 13 | Admin WhatsApp Sales Reports | Real-time analytics view of incoming WhatsApp checkout requests registered in Firestore `interactions` collection | M5 | R4 |
| 14 | 1-Click Product Seeder | Button to initialize/seed Firestore `products` collection with default catalog from `src/data/iphones.ts` with `stock: 15` and `active: true` | M5 | R4 |
| 15 | Responsive Apple Dark/Glass Design | Ensure Admin Dashboard is 100% responsive across mobile, tablet, and desktop with Apple dark/glass aesthetic | M5 | R4 |
| 16 | E2E Integration & Verification | Zero TypeScript build errors (`npm run build`), end-to-end functionality verification and integrity audit | M6 | Acceptance Criteria |
| 17 | Manual Sales Registration & Ledger | Dedicated tab/form in AdminDashboard to record offline/direct sales (product, color, storage, price, quantity, customer, payment method, notes), track in Firestore 'sales' or 'interactions' collection, and display full sales ledger & revenue metrics | M5 | Follow-up 2026-10-05T04:13:32Z |
| 18 | Firestore Rules Guidance & Error Handling | Clear guidance banner in AdminDashboard for Firestore Rules (`allow read, write: if true;`) and graceful permission exception handling in `src/lib/firebase.ts` | M7 | Follow-up 2026-10-05T04:40:56Z |
| 19 | Direct Firestore iPhone Seeder | Remove AI mocks/fallback buttons, replace with direct "Cargar iPhones de Prueba en Firestore" button writing iPhone 18 Pro Max, iPhone 16 Pro, iPhone 16 to Firestore | M7 | Follow-up 2026-10-05T04:40:56Z |
| 20 | Image File Upload & Live Preview | File upload input converting images to base64, live preview box in Add/Edit Product form, image thumbnail previews in product cards & table rows | M7 | Follow-up 2026-10-05T04:40:56Z |
| 21 | Product Condition / State | Condition field on iPhoneProduct ('Nuevo (Sellado)', 'Seminuevo / Excelente', 'Usado Grado A', 'Reacondicionado'), condition selectors in Admin form & badges in Catalog | M7 | Follow-up 2026-10-05T04:46:03Z |
| 22 | Cost Price & Net Profit Tracking | `costPriceUsd` field on products and manual sales, automatic net profit calculation, gross revenue, cost, and net profit KPI summaries & ledger metrics | M7 | Follow-up 2026-10-05T04:46:03Z |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Legacy Google Sheets Cleanup & Build Config Fix | Delete legacy files, remove googleapis, update vite.config.ts and types | none | DONE |
| M2 | Firebase SDK Client & Interaction Logger | Create src/lib/firebase.ts (export db, auth) and src/lib/interactions.ts | M1 | DONE |
| M3 | Realtime Catalog Sync & Checkout Logger | useProducts hook, update ProductCatalog, SpecComparison, WhatsAppModal, CartDrawer | M2 | DONE |
| M4 | Owner Auth, Protected Route & Footer Link | src/pages/AdminLogin.tsx, src/pages/AdminPage.tsx, App.tsx routing, Footer link | M2 | DONE |
| M5 | Responsive Admin Dashboard (CRUD, Reports, Seeder, Manual Sales) | src/components/AdminDashboard.tsx (Inventory CRUD, WhatsApp reports, Seeder, Manual Sales) | M3, M4 | DONE |
| M6 | E2E Verification & Integrity Audit | Full build verification, runtime test harness, Challenger & Forensic Auditor gates | M5 | DONE |
| M7 | User Business Fixes & Inventory Enhancements | Rules guidance, direct seeder, image upload, condition state, cost price & net profit metrics | M5 | IN_PROGRESS |

## Interface Contracts
### `src/lib/firebase.ts`
- Exports:
  - `db: Firestore` (initialized instance of Firestore)
  - `auth: Auth` (initialized instance of Firebase Auth)

### `src/types/index.ts`
- Augments `iPhoneProduct`:
  - `stock?: number;`
  - `active?: boolean;`
- Exports `StoreInteraction`:
  ```ts
  export interface StoreInteraction {
    id?: string;
    type: 'whatsapp_order' | 'cart_checkout' | 'product_view';
    productId: string;
    productName: string;
    color?: string;
    storage?: string;
    priceUsd: number;
    customerName?: string;
    customerPhone?: string;
    customerCity?: string;
    paymentMethod?: string;
    notes?: string;
    cartSummary?: string;
    status?: 'pending' | 'contacted' | 'completed' | 'cancelled';
    timestamp?: any;
    createdAt?: string;
  }
  ```

### `src/lib/interactions.ts`
- Signature: `logStoreInteraction(interaction: Omit<StoreInteraction, 'id' | 'timestamp'>): Promise<string | null>`
- Behavior: Writes non-blocking to collection `interactions` using Firestore `addDoc` with `serverTimestamp()`.

### `src/hooks/useProducts.ts`
- Signature: `useProducts(): { products: iPhoneProduct[]; loading: boolean; isLive: boolean; error: Error | null }`
- Behavior: Subscribes to collection `products` via `onSnapshot`. If empty or offline, falls back to `IPHONE_PRODUCTS`.

### `src/pages/AdminPage.tsx`
- Behavior: Listens to `onAuthStateChanged(auth)`. If loading, renders Apple loading screen. If unauthenticated, renders `AdminLogin`. If authenticated, renders `AdminDashboard`. Handles "Volver a la tienda" navigation back to main catalog.

## Code Layout
- `src/lib/firebase.ts` — Firebase client initialization.
- `src/lib/interactions.ts` — Firestore interactions logger.
- `src/hooks/useProducts.ts` — Real-time catalog subscriber hook.
- `src/types/index.ts` — Data models and contracts.
- `src/pages/AdminLogin.tsx` — Owner login form.
- `src/pages/AdminPage.tsx` — Protected view wrapper.
- `src/components/AdminDashboard.tsx` — Full responsive admin management panel.
- `src/components/ProductCatalog.tsx` — Main store catalog.
- `src/components/SpecComparison.tsx` — Spec comparison component.
- `src/components/WhatsAppModal.tsx` — Checkout modal with direct WhatsApp redirection.
- `src/components/CartDrawer.tsx` — Cart drawer with WhatsApp order dispatch.
- `src/components/Footer.tsx` — Footer with discrete "Acceso Administración" link.
- `src/App.tsx` — Main application shell with dual path/hash routing.
