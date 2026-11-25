# NovaPay – Digital Wallet Demo

NovaPay is a modern, interactive digital wallet web app built with plain **HTML, CSS and vanilla JavaScript**. It looks and behaves like a real wallet app, but it runs entirely in your browser: no backend, no database and no external APIs. Demo data is saved with the browser's `localStorage`, so it survives a page refresh.

> **Demo only.** NovaPay does not process real payments, connect to bank accounts, or store real financial information.

## Features

- **Dashboard:** welcome banner, total balance, monthly income and expenses with trend sparklines and month-over-month change
- **Spending overview:** donut chart by category, switchable between This Month, Last Month and All Time
- **Monthly activity:** income and expense line chart over 3, 6 or 12 months
- **Add income / Add expense:** modal forms with categories and validation (an expense can't exceed the balance)
- **Send money:** simulated transfers, recorded as "Transfer" expenses
- **Transactions:** full history with live search from the top bar, type and category filters, and delete
- **Analytics:** income vs expenses bars, savings rate, average monthly spending and largest expense
- **Categories:** totals per category; click a card to see its transactions
- **Wallet page:** card-style balance view with quick actions
- **Profile:** edit your display name and click the avatar to upload a profile photo
- **Settings:** reset to demo data or start with an empty wallet
- **Responsive layout:** collapsible sidebar on tablets and phones
- Currency is Indian Rupees (₹), formatted with Indian digit grouping

## Getting started

1. Download or clone the project.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).

No installation, build step or server is needed. The app uses plain `<script>` tags instead of ES modules so that it also works when opened directly from your file system.

## Project structure

```
NovaPay/
├── index.html
├── README.md
├── assets/
│   ├── images/
│   │   └── logo.png
│   └── icons/
│       └── icons.svg
├── css/
│   ├── main.css          # variables, base styles, buttons, forms, modals, toasts
│   ├── layout.css        # sidebar, top bar, page grids
│   ├── components.css    # cards, charts, lists, wallet card, etc.
│   └── responsive.css    # tablet and mobile breakpoints
├── js/
│   ├── utils.js          # formatting (money, dates), icons, toasts, category colours
│   ├── demo-data.js      # sample user and transactions
│   ├── storage.js        # save / load / reset through localStorage
│   ├── wallet.js         # balance maths, income, expenses, transfers, monthly totals
│   ├── transactions.js   # transaction rows, list, search and filters
│   ├── dashboard.js      # dashboard, charts, analytics and categories pages
│   └── main.js           # navigation, modals, events, profile and settings
└── docs/
    └── user-guide.md
```

Scripts load in this order (set in `index.html`): `utils` → `demo-data` → `storage` → `wallet` → `transactions` → `dashboard` → `main`. Each module attaches itself to a single global namespace, `NP`.

## How it works

- **State:** one object, `{ user, transactions[] }`, saved in `localStorage` under the key `novapay_v1`.
- **Balance:** total income minus total expenses.
- **Charts:** drawn as inline SVG by `dashboard.js`, with no chart libraries.
- **Icons:** an SVG sprite inlined at the top of `index.html`. `assets/icons/icons.svg` is the standalone copy, because browsers block external SVG sprites on `file://`.
- **Routing:** hash-based (`#dashboard`, `#transactions`, and so on).

## Customizing

| Want to change | Where |
|---|---|
| Default user name | `js/demo-data.js`, inside `get()`: `user:{name:'Lisa'}` |
| Demo transactions | the `rows` array in `js/demo-data.js` |
| Currency symbol or locale | the `money` function in `js/utils.js` |
| Categories and colours | the `CATS` object in `js/utils.js` |
| Theme colours | CSS variables at the top of `css/main.css` |
| Logo | replace `assets/images/logo.png` (square PNG, about 256×256) |
| Storage key | `KEY` in `js/storage.js` |

After changing demo data, the browser keeps the old saved data. Open **Settings → Reset to demo data**, or change the storage key to load fresh data.

## Resetting data

- In the app: **Settings → Reset to demo data**, or **Start with an empty wallet**.
- In the browser: clear the site's data, or run `localStorage.removeItem('novapay_v1')` in the console.

## Limitations

- Data lives only in one browser on one device. There is no sync or login.
- The sign-out screen is a visual demo, not real authentication.
- The profile photo is resized to 200×200 and stored in `localStorage`, which has a small size limit (about 5 MB).
- Amounts are plain numbers with no real currency conversion.

## Browser support

Any current version of Chrome, Edge, Firefox or Safari. The Inter font loads from Google Fonts and falls back to system fonts when offline.
