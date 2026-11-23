# Deploying PlaceConnect on Vercel

PlaceConnect is configured to support **both** fullstack deployment on Vercel as well as frontend-only deployment on Vercel (with the backend hosted on Render, Railway, or AWS).

---

## Option 1: Full-Stack Deployment on Vercel (Recommended Monorepo Setup)

PlaceConnect includes:
- Root `vercel.json` configured with Vite frontend build (`client/dist`) and rewrites to `/api/index.js`.
- Serverless entrypoint in `api/index.js` that connects to MongoDB and handles all `/api/v1/*` routes.
- `client/vercel.json` for seamless client-side single-page routing without 404s.

### Steps:
1. **Push your code to GitHub** (already done!).
2. Go to [https://vercel.com](https://vercel.com) and log in.
3. Click **Add New...** &rarr; **Project**.
4. Import the **`premhage/PlaceConnect`** repository.
5. In **Project Settings**:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as repository root)
   - **Build Command:** `npm --prefix client run build` (or leave default `npm run build`)
   - **Output Directory:** `client/dist`
6. Under **Environment Variables**, add the following:
   | Variable | Value / Description | Example |
   | :--- | :--- | :--- |
   | `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/placeconnect?retryWrites=true&w=majority` |
   | `JWT_SECRET` | Secret key for signing authentication tokens | Any random 32+ character string |
   | `JWT_EXPIRES_IN` | Token validity | `7d` |
   | `COOKIE_SECURE` | Set to true in production HTTPS | `true` |
   | `NODE_ENV` | Environment mode | `production` |
   | `VITE_API_BASE_URL` | Base API URL | `/api/v1` (since frontend and API share the same domain) |
7. Click **Deploy**. Vercel will build the React Vite frontend and deploy the serverless API functions automatically!

---

## Option 2: Frontend-Only on Vercel (Backend on Render / Railway)

If you prefer hosting the Express Node.js server continuously on [Render.com](https://render.com) or [Railway.app](https://railway.app):

1. **Deploy Backend on Render/Railway:**
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `node src/server.js`
   - Set environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`).
   - Copy your live backend URL (e.g. `https://placeconnect-api.onrender.com`).

2. **Deploy Frontend on Vercel:**
   - Import repository to Vercel.
   - Set **Root Directory** to `client`.
   - Add Environment Variable:
     - `VITE_API_BASE_URL` = `https://placeconnect-api.onrender.com/api/v1`
   - Click **Deploy**.
   - `client/vercel.json` automatically takes care of SPA client-side routes.
