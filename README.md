# Ember · Product studio – React frontend (Lab Exercise 6)

React (Vite) + axios frontend for the LavaLust Products API.

- **UI/UX**: landing page, split sign-in / create-account page and glass-card layout follow the Tabby project, in a teal + ember-orange palette that suits the mascot.
- **Name**: the app is called Ember, after its mascot (change `APP_NAME` in `src/components/Brand.jsx`).
- **Mascot**: Ember, the fire chameleon from the first activity (eyes follow the cursor/caret, covers its eyes on the password field, reacts to add / edit / delete).
- **Dashboard**: the first activity's `/products` page (stats, product table, add/edit form with live preview, delete confirmation).

## Run locally
```bash
npm install
cp .env.example .env.local     # set VITE_API_URL to your API (default http://127.0.0.1:3000)
npm run dev                    # http://localhost:5173
```
Remember to add the frontend URL (e.g. `http://localhost:5173`) to `CORS_ORIGIN` on the API.

## Build (used by Render Static Site)
```bash
npm install && npm run build   # output in dist/
```
Environment variable: `VITE_API_URL` – base URL of the deployed LavaLust API (no trailing slash).

## How it talks to the API
| Screen | Endpoint |
|---|---|
| Sign up | `POST /api/register` (then logs straight in) |
| Sign in | `POST /api/login` (username or email) |
| Products | `GET/POST /api/products`, `PUT/DELETE /api/products/{id}` with `Authorization: Bearer <access token>` |
| Session | `POST /api/refresh` on a 401, `POST /api/logout` |

Access tokens are refreshed automatically; if the refresh token is revoked or expired you are sent back to sign in.
