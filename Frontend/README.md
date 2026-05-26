# Frontend — Loot Box Store

Vue.js 3 + Vuetify frontend for the Loot Box Store application.

## Structure

```text
  src/
  ├── components/       # Reusable Vue components
  │   ├── Cart.vue
  │   ├── Navigationbar.vue
  │   ├── ProductBanner.vue
  │   └── ProductManagement.vue
  ├── pages/            # Application pages
  │   ├── index.vue           # Product listing (home)
  │   ├── productdetail.vue   # Individual product page
  │   ├── Cart.vue            # Shopping cart
  │   ├── paymentPage.vue     # Checkout and payment
  │   ├── addresses.vue       # Address management
  │   ├── addresspage.vue     # Add/edit address form
  │   ├── Login.vue           # Login page
  │   ├── CreateAccount.vue   # Account creation
  │   └── adminAccount.vue    # Admin account management
  ├── utils/
  │   └── auth.ts       # getCurrentUser utility
  └── api.ts            # Axios API instance
```

## Setup

```bash
npm install
```

## Running

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`. 
The backend must also be running at `http://127.0.0.1:8000`.

## Testing

```bash
npm run test:unit
```

## Recommended IDE setup

- [VS Code](https://code.visualstudio.com/)
- [Vue (Official) extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  (Chrome/Edge/Brave)