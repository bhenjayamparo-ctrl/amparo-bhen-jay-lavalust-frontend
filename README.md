# Product Management – React frontend (Lab Exercise 6)

React (Vite) + axios frontend for the LavaLust Products API.

## Run locally
```bash
npm install
cp .env.example .env.local     # set VITE_API_URL to your API (default http://127.0.0.1:3000)
npm run dev                    # http://localhost:5173
```

## Build (used by Render Static Site)
```bash
npm install && npm run build   # output in dist/
```

Environment variable: `VITE_API_URL` – base URL of the deployed LavaLust API (no trailing slash).
