# START HERE — Edame's Gadget V2

## 1. Open this folder in VS Code
Open the `edames-gadget-v2` folder itself (the folder containing `client`, `server`, and `package.json`).

## 2. Install dependencies
Run:

```bash
npm install
```

## 3. Start the existing API
In one terminal:

```bash
npm run dev:server
```

## 4. Start the new React storefront
In another terminal:

```bash
npm run dev:client
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## 5. Preview mobile
In Chrome/Edge: `F12` → Toggle Device Toolbar → choose an iPhone/Pixel size. The new layout is mobile-first and uses a 2-column product grid on phones.

## 6. Important migration rule
Do not delete the old V1 project. Keep it as the working reference until each V2 feature has been migrated and tested.
