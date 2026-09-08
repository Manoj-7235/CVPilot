# CVPilot Production Deployment Guide (PostgreSQL & Render)

This guide walks you through deploying **CVPilot** to production on [Render](https://render.com) using **PostgreSQL** as the single production database.

---

## 1. Architecture Overview

- **Frontend & API**: Next.js 14 (App Router) deployed as a Node Web Service.
- **Production Database**: Managed PostgreSQL on Render (ACID compliant, persistent, highly scalable).
- **Authentication**: Salted Bcrypt password hashing + HTTP-Only, Lax, Secure session cookies stored in PostgreSQL `sessions` table.
- **AI Inference Engine**: Google Gemini 1.5 Flash via `@google/generative-ai` with structured JSON parsing and graceful offline fallback.
- **Email Delivery**: SMTP (Gmail App Password or custom SMTP provider) with fallback to Resend API.
- **Storage**: Full resume analysis results and review history saved in PostgreSQL `analyses` table with strict user-level authorization.

---

## 2. Environment Variables Reference

All sensitive keys are server-only and are **never exposed to client browsers**.

| Variable | Required | Description | Example / Notes |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | `postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/cvpilot?sslmode=require` |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public URL of your deployed application | `https://cvpilot.onrender.com` or `https://yourdomain.com` |
| `GEMINI_API_KEY` | Recommended | Google Gemini API key for live AI resume critiques | `AQ.Ab8RN6...` (get free key at [Google AI Studio](https://aistudio.google.com/)) |
| `SMTP_HOST` | Optional | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP port | `465` (SSL) or `587` (TLS) |
| `SMTP_USER` | Optional | SMTP sender email address | `your-email@gmail.com` |
| `SMTP_PASS` | Optional | 16-letter Gmail App Password | [Google App Passwords](https://myaccount.google.com/apppasswords) |
| `EMAIL_FROM` | Optional | Display name & sender address | `CVPilot <your-email@gmail.com>` |
| `RESEND_API_KEY` | Optional | Resend API key fallback | `re_...` |

---

## 3. Deploying to Render

### Method A: 1-Click Blueprint (Recommended)

CVPilot includes a pre-configured `render.yaml` file in the repository root. Render Blueprints automatically provision both the Web Service and the PostgreSQL database together and bind `DATABASE_URL` between them.

1. Push your repository to **GitHub** or **GitLab**.
2. Go to the [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** and select **Blueprint**.
4. Connect your CVPilot repository.
5. Render will detect `render.yaml` and display:
   - **Service**: `cvpilot` (Web Service, Node runtime)
   - **Database**: `cvpilot-postgres` (PostgreSQL)
6. Fill in the requested secret environment variables:
   - `GEMINI_API_KEY`: your Gemini API key
   - `SMTP_USER` & `SMTP_PASS`: your email credentials (or leave empty if using mock email delivery)
   - `NEXT_PUBLIC_APP_URL`: your public Render URL (e.g. `https://cvpilot.onrender.com`)
7. Click **Apply**.
8. Render will automatically provision the PostgreSQL database, build Next.js, initialize the tables, seed demo users, and go live!

---

### Method B: Manual Dashboard Setup on Render

If you prefer to configure services manually in the Render dashboard:

#### Step 1: Create the PostgreSQL Database
1. In Render Dashboard, click **New +** → **PostgreSQL**.
2. Name: `cvpilot-postgres`
3. Database: `cvpilot`
4. User: `cvpilot_user`
5. Region: choose the region closest to your users (e.g., `Oregon (US West)`).
6. Plan: **Free** (or Starter for commercial production).
7. Click **Create Database**.
8. Once provisioned, locate the **Connections** section:
   - Copy the **Internal Database URL** (for services running on Render in the same region), or
   - Copy the **External Database URL** (for connecting from your local machine).

#### Step 2: Create the Web Service
1. Click **New +** → **Web Service**.
2. Connect your CVPilot repository.
3. Configuration:
   - **Name**: `cvpilot`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Free` (or Starter)
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: paste the PostgreSQL Internal Database URL from Step 1.
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_APP_URL`: `https://<your-service-name>.onrender.com`
   - `GEMINI_API_KEY`: your Google Gemini API key
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `465`
   - `SMTP_USER`: your Gmail address
   - `SMTP_PASS`: your 16-character Gmail App Password
   - `EMAIL_FROM`: `CVPilot <your-email@gmail.com>`
5. Click **Create Web Service**.

---

## 4. Migrating Existing Data (SQLite → PostgreSQL)

If you previously tested CVPilot with local SQLite (`data/cvpilot.db`) and want to preserve existing user accounts, sessions, and resume analysis history:

1. Obtain your Render PostgreSQL **External Database URL** from the Render database dashboard.
2. In your local terminal, run:
   ```bash
   DATABASE_URL="postgresql://user:password@dpg-xxx.oregon-postgres.render.com/cvpilot?sslmode=require" npm run db:migrate
   ```
3. The migration script will:
   - Connect to `data/cvpilot.db`
   - Ensure tables exist in PostgreSQL
   - Transfer all users, analyses, active sessions, and password resets
   - Skip or update conflicts safely (`ON CONFLICT DO NOTHING` / `DO UPDATE`)

---

## 5. Running Locally with PostgreSQL via Docker

To run the complete PostgreSQL production stack locally:

```bash
# 1. Start PostgreSQL and CVPilot app
docker compose up -d

# 2. View logs
docker compose logs -f cvpilot

# 3. Access app
http://localhost:3000
```

To run Next.js in local development with an external PostgreSQL:
```bash
# In .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/cvpilot
```
Then run:
```bash
npm run dev
```

---

## 6. Production Verification Checklist

After deploying on Render:
- [ ] Open your live URL (`https://your-app.onrender.com`).
- [ ] Click **Sign In** → enter demo credentials (`alex.morgan@example.com` / `demo123`).
- [ ] Click **Sign Out**.
- [ ] Click **Create an account** → sign up with a new email and password.
- [ ] Verify instant login and redirection to dashboard/home.
- [ ] Go to **Review** (`/review`) → upload a resume (PDF, DOCX, or TXT).
- [ ] Run analysis and verify scores, strengths, weaknesses, and optimized rewrite bullets.
- [ ] Go to **History** (`/history`) → verify the saved review appears in your history.
- [ ] Log out and log back in → verify review history persists across sessions.
- [ ] Test **Forgot Password** (`/forgot-password`) with your email.
