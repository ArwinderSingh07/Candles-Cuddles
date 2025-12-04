# Candles-Cuddles
Candles and Cuddles
# Candles & Cuddles

Production-ready eCommerce stack for the Candles & Cuddles brand. The repo includes a React/Tailwind storefront, a hardened Express API (Razorpay-ready), infrastructure artifacts, CI/CD, and an OpenAPI contract.

## Repository layout

```
frontend/   # Vite + React + Tailwind single-page app
backend/    # Express + MongoDB API with Razorpay, S3, JWT admin surface
docs/       # OpenAPI 3.0 contract
.github/    # GitHub Actions CI (tests + deploy hooks)
docker-compose.yml  # Local orchestration for API + MongoDB + Redis
```

## Features

- Secure Razorpay flow (server-side order creation, signature verification, webhook reconciliation, idempotency).
- Admin JWT auth with hashed passwords, role checks, and product/order CRUD.
- S3 presigned uploads exposed to the storefront for custom briefs.
- Observability baked in (Pino JSON logging with request ids, optional Sentry, `/metrics` Prometheus endpoint, health/readiness probes).
- Rate limiting, Helmet, CORS allowlists, structured validation via Zod.
- Frontend includes cart, checkout, custom order form with uploads, FAQ/contact, and a mocked Playwright smoke test.

## Environment variables

Create `.env` at the repo root using `.env.example` as a template:

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay REST credentials (never expose the secret) |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signing secret configured in Razorpay dashboard |
| `FRONTEND_URL` | Allowed origin for CORS (e.g. `http://localhost:5173`) |
| `JWT_SECRET` | Signing secret for admin JWT |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM user with PutObject permissions on the bucket |
| `S3_BUCKET` / `S3_REGION` | Bucket name + region for assets |
| `ALLOWED_ORIGINS` | Optional comma-separated list to override CORS defaults |
| `SENTRY_DSN` | Optional Sentry DSN |
| `REDIS_URL` | Optional (queue/backoff toggle) |

Frontend-specific envs live in `frontend/.env.example`:

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | e.g. `http://localhost:4000/api/v1` |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key for Checkout |

## Local development

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The API listens on `http://localhost:4000`. Health endpoints: `/api/v1/health`, `/api/v1/ready`.

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

3. **MongoDB & Redis (optional)**  
   Use Docker Compose for a full local stack (API + MongoDB + Redis):
   ```bash
   docker compose up --build
   ```

## Razorpay integration checklist

- `/api/v1/orders/create` calculates the total from canonical product data, creates a Razorpay order with `payment_capture=1`, and stores the `razorpayOrderId`.
- `/api/v1/orders/verify` expects `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }` and validates the signature using `razorpay_order_id|razorpay_payment_id`.
- `/api/v1/webhook/razorpay` validates the `x-razorpay-signature` (HMAC SHA256 using the webhook secret), stores payloads for audit, and transitions orders to `captured`/`failed` idempotently.
- Frontend Razorpay Checkout opens with the server-provided order id and, on success, calls the verify endpoint before clearing the cart.

## Tests

```bash
# Backend unit + integration tests (uses mongodb-memory-server)
cd backend && npm test

# Frontend lint/build
cd frontend && npm run lint && npm run build

# Playwright smoke test (mocks network + Razorpay)
cd frontend && npx playwright install chromium   # first run only
cd frontend && npm run test:e2e -- --reporter=line
```

> Note: On Windows you may need to run the Playwright install command in an elevated shell the first time so the browser can be downloaded to `%USERPROFILE%\AppData\Local\ms-playwright`.

## Deployment

### Frontend → Vercel (recommended)

1. Create a Vercel project targeting `frontend/`.
2. Set environment variables `VITE_API_BASE_URL` and `VITE_RAZORPAY_KEY_ID` in Vercel.
3. Configure `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets in GitHub for CI auto-deploys (see `.github/workflows/ci.yml`).

### Backend → Render (Docker) or Vercel Serverless

Render (free tier) steps:
1. Create a new **Web Service** pointing to `backend/Dockerfile`.
2. Add the environment variables listed above (match the `.env.example` file).
3. If using Render deploy hooks, store the hook URL in `RENDER_DEPLOY_HOOK` GitHub secret so CI can trigger redeploys on `main`.

Vercel serverless alternative:
- Wrap `backend` routes using Vercel Edge/API functions if you prefer a serverless footprint. The existing Express app is deployable via `@vercel/node` adapter with minimal changes.

### MongoDB Atlas & S3

- Create an Atlas M0 cluster, add your Render/Vercel IP range to the access list, and save the SRV URI in secrets.
- Create an S3 bucket (enable public read via bucket policy or CloudFront). Lock credentials to PutObject/ListObject for the `uploads/` prefix. Optionally attach a lifecycle policy to move uploads to Glacier or delete after 30 days to minimise storage spend.

## CI/CD

The workflow in `.github/workflows/ci.yml` runs on PRs and pushes to `main`:

1. Backend: `npm ci`, type-check (`npm run lint`), Jest tests.
2. Frontend: `npm ci`, ESLint, Vite build, Playwright smoke test.
3. Deploy frontend to Vercel when `main` is updated (requires `VERCEL_*` secrets).
4. Trigger Render deployment via webhook when `RENDER_DEPLOY_HOOK` is set.

## API documentation

`docs/openapi.yaml` captures every endpoint (products, orders, uploads, admin auth, health). Import this file into Postman/Insomnia or render it with Swagger UI.

## Security checklist

- Helmet (with opinionated CSP), strict CORS allowlists, gzip compression.
- Rate limiting (100 req/15 min window by default) with room to tighten on `/orders/*`, `/uploads/presign`, `/admin/*`.
- Zod validation for every payload; invalid inputs return 400 with detailed errors.
- JWT auth with bcrypt-hashed admin passwords and role-based guards.
- Structured logging with per-request ids, ready for ingestion by CloudWatch/Datadog.
- Optional Prometheus `/api/v1/metrics` endpoint for basic ops dashboards.
- Graceful shutdown handlers close Mongo connections so containers exit cleanly.

## Cost minimisation checklist

- **Hosting:** Vercel Hobby for the static frontend + serverless backend or Render free web service (Dockerfile provided).
- **Database:** MongoDB Atlas M0 (512MB) is sufficient for early usage; scale to M2/M5 as needed.
- **Storage/CDN:** S3 + CloudFront (free tier) with lifecycle policies for uploads >30 days.
- **Queues:** Bull/Redis omitted by default—stick to immediate processing until traffic warrants background jobs (toggle via `REDIS_URL` later).
- **Monitoring:** Sentry free plan for API + client error tracking.
- **Razorpay:** Run in test mode until hitting production volumes; document the switch to live keys.

## Custom order uploads

The `/api/v1/uploads/presign` endpoint issues 5-minute presigned PUT URLs.  
Frontend flow:

1. Call `/uploads/presign` with the chosen MIME type.
2. Upload directly to S3 using `fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })`.
3. Persist the returned `publicUrl` or include it in the custom brief metadata.

## Observability

- **Logging:** Pino + `pino-http` output JSON with `requestId`, ready for ingestion in structured log pipelines.
- **Metrics:** Prometheus-compatible metrics at `/api/v1/metrics`.
- **Tracing:** Enable Sentry by setting `SENTRY_DSN`. The middleware only wires up when the DSN is present.

## Troubleshooting

- **Playwright browsers on Windows:** run `npx playwright install` as Admin once.
- **Razorpay signature mismatches:** ensure the frontend never exposes `RAZORPAY_KEY_SECRET` and that the backend uses the same key pair as the dashboard/webhook.
- **CORS errors:** update `ALLOWED_ORIGINS` to include the deployed frontend URL (comma-separated list).
- **Webhook verification:** Razorpay requires the raw request body; Express is already configured to capture `req.rawBody` for the webhook route.

Enjoy shipping cozy commerce experiences ✨.

