# CVPilot

**AI-powered resume analysis and optimization platform**

CVPilot helps job seekers understand how well their resume matches a target role, identify skill gaps, improve ATS compatibility, and optimize resume content while preserving the candidate's original facts and experience.

## 🚀 Features

* 📄 Upload resumes in PDF, DOCX, or TXT format
* 🤖 AI-powered resume analysis using Google Gemini
* 🎯 Job-description matching and keyword analysis
* 📊 Overall resume and ATS compatibility scoring
* 🔍 Skill-gap and transferable-skill analysis
* ✍️ Resume improvement suggestions
* 🛡️ Fact-preserving optimization designed to avoid fabricated qualifications or metrics
* 👤 User registration and authentication
* 🔐 Bcrypt password hashing
* 🍪 HTTP-only session cookies
* 📚 Resume analysis history
* 🔑 Password reset flow
* 🗄️ PostgreSQL persistence
* 🐳 Docker support
* ☁️ Render deployment configuration
* 🌙 Responsive UI with dark/light theme support

## 🛠️ Tech Stack

### Frontend

* Next.js 14
* React 18
* TypeScript
* Tailwind CSS
* Framer Motion
* Recharts
* Lucide React

### Backend

* Next.js App Router API routes
* Node.js
* PostgreSQL
* `pg`
* Bcrypt

### AI & Document Processing

* Google Gemini
* PDF parsing with `pdf-parse`
* DOCX parsing with `mammoth`

### Infrastructure

* Docker
* Docker Compose
* Render
* PostgreSQL

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      CVPilot UI      │
                    │ Next.js + React      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Next.js API Layer  │
                    │ Authentication        │
                    │ Resume Analysis       │
                    │ Review History        │
                    └───────┬───────┬──────┘
                            │       │
                 ┌──────────┘       └──────────┐
                 ▼                             ▼
        ┌─────────────────┐          ┌─────────────────┐
        │   PostgreSQL    │          │  Google Gemini  │
        │ Users           │          │ Resume Analysis │
        │ Sessions        │          │ Job Matching    │
        │ Analyses        │          └─────────────────┘
        └─────────────────┘
```

## 📂 Project Structure

```text
CVPilot/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   ├── auth/
│   │   └── reviews/
│   ├── history/
│   ├── login/
│   ├── profile/
│   ├── review/
│   └── signup/
├── components/
│   ├── providers/
│   └── ui/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── gemini.ts
│   ├── parseResume.ts
│   ├── serverAuth.ts
│   └── storage.ts
├── scripts/
├── types/
├── Dockerfile
├── docker-compose.yml
├── render.yaml
└── package.json
```

## 🔐 Security

CVPilot is designed with several security considerations:

* Passwords are hashed with Bcrypt rather than stored as plaintext.
* Authentication uses server-side sessions.
* Session tokens are stored in PostgreSQL.
* Authentication cookies use HTTP-only and SameSite attributes.
* User review data is associated with authenticated user IDs.
* API keys and database credentials are supplied through environment variables.
* Local environment files are excluded through `.gitignore`.

> Never commit `.env`, API keys, database credentials, SMTP passwords, or other secrets to the repository.

## 🧠 AI Safety & Fact Preservation

A major design goal of CVPilot is to improve resumes **without inventing qualifications**.

The project includes verification scripts that check for issues such as:

* Fabricated skills
* Hallucinated projects
* Fake certifications
* Fabricated performance metrics
* Loss of existing work experience

The optimization process is intended to improve wording and presentation while preserving the candidate's underlying facts.

## ⚙️ Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Manoj-7235/CVPilot.git
cd CVPilot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cvpilot

NEXT_PUBLIC_APP_URL=http://localhost:3000

GEMINI_API_KEY=your_gemini_api_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=CVPilot <your_email@gmail.com>
```

### 4. Start PostgreSQL

Using Docker:

```bash
docker compose up -d postgres
```

### 5. Start CVPilot

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 🐳 Running with Docker

```bash
docker compose up -d
```

Then open:

```text
http://localhost:3000
```

## 🧪 Verification

Before deploying:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

The repository also includes verification scripts for resume fact preservation and AI optimization behavior.

## ☁️ Deployment

The project includes a `render.yaml` configuration for deploying the application with:

* Next.js web service
* PostgreSQL database
* Environment-based secrets
* Production Node.js runtime

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for deployment instructions.

## 🔮 Future Improvements

* Automated CI/CD with GitHub Actions
* Automated unit and integration test coverage
* More resume formats
* Job application tracking
* Resume version comparison
* Improved AI evaluation benchmarks
* Rate limiting and abuse protection
* Observability and application monitoring

## 👨‍💻 Author

**Manoj**

Built as a full-stack AI application for intelligent resume analysis and optimization.

---

⭐ If you find CVPilot useful, consider giving the repository a star.
