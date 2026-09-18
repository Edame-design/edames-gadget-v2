# Edame's Gadget V2

A production-oriented evolution of the existing Edame's Gadget e-commerce prototype.

## Start

```bash
npm install
npm run dev:client
```

Frontend: http://localhost:5173

The frontend expects the existing API at `http://localhost:10000/api` by default. Override it with `VITE_API_URL`.

## Important

The original `.env` was intentionally NOT copied into this V2 workspace. Create your own environment file and never commit secrets.

## Philosophy

We are not starting from zero. V2 preserves the useful parts of V1 and progressively replaces hard-coded UI and global cart behavior with a real commerce architecture.
