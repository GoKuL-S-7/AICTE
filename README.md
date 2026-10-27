# Unified AICTE Portal 🏛️

A comprehensive, state-of-the-art enterprise web platform engineered for the **All India Council for Technical Education (AICTE)**. This unified portal modernizes institutional governance, grievance redressal, vigilance oversight, financial disclosures, and public grievance workflows across India's technical education ecosystem.

---

## 🌟 Key Features & Portals

### 1. 🏢 Institution Portal
- **Streamlined Registration & Profile Completion**: Verification, document uploads, and dynamic AICTE affiliation management.
- **Application Approvals & Extensions**: Full lifecycle handling for LOA (Letter of Approval), EOA (Extension of Approval), LOD, and EOD.
- **Payments & FDR Deposits**: Online fee processing, financial status reconciliation, and deposit release requests.
- **Complaint Management**: Direct tracking and response management for internal complaints.

### 2. 👥 Public & Student Grievance System
- **Citizen / Student Complaint Filing**: Intuitive public interface for logging grievances with automated tracking IDs and evidence attachments.
- **Live Status Tracker**: Real-time status tracker with progress timeline from intake through resolution.

### 3. ⚖️ PGRC (Public Grievance Redressal Cell)
- Dedicated cell dashboard for triage, evidence inspection, institution inquiry forwarding, hearing scheduling, and final grievance closure.

### 4. 🛡️ Vigilance Bureau Portal
- High-level oversight dashboard for monitoring compliance, anti-ragging complaints, ethics violations, and high-severity investigations.

### 5. 📊 Finance Bureau & Financial Disclosures (FD)
- Monitoring bureau for institutional financial filings, FDR maturity checks, deposit releases, and compliance auditing.

### 6. 🤖 AI-Powered AICTE Assistant
- Integrated conversational assistant powered by Google Gemini for instant applicant guidance, query resolution, and policy navigation.

---

## 🛠️ Architecture & Tech Stack

```
unified-aicte-portal/
├── frontend/             # Next.js 15 (App Router, React 19, TypeScript, Vanilla CSS)
├── backend/              # Node.js, Express, TypeScript, MongoDB / Mongoose
├── render.yaml           # Automated cloud deployment blueprint
└── package.json          # Monorepo / root management
```

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Lucide Icons, Modern CSS.
- **Backend**: Express.js, TypeScript, Mongoose, Session authentication, Multer for secure uploads.
- **Database**: MongoDB with connection pooling and schema-level validation.
- **AI Integration**: Google Gemini API for intelligent document analysis & assistant workflows.
- **Email & Notifications**: Modular email adapters (Resend / SendGrid / SMTP).

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/GoKuL-S-7/AICTE.git
cd AICTE
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both the root and `backend/` directory:
```bash
cp .env.example .env
cp .env.example backend/.env
```
Fill in your `MONGODB_URI`, `SESSION_SECRET`, and optional `GEMINI_API_KEY`.

### 3. Install Dependencies
```bash
# Root & Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run Locally
**Start Backend Server:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000 (or configured PORT)
```

**Start Frontend Application:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

---

## ☁️ Deployment

The repository includes a production-ready `render.yaml` configuration:
- Push this repository to GitHub.
- Connect your GitHub repository to [Render](https://render.com/).
- Render will automatically provision the Node backend with persistent storage and environment variables.
- Deploy the `frontend/` directory directly on [Vercel](https://vercel.com/) or Render.

---

## 🔒 Security & Privacy

- All sensitive credentials (`.env`, `*.local`, `backend/uploads/`) are excluded from version control via `.gitignore`.
- CSRF protection, secure cookie sessions, and role-based access control (RBAC) across all portal endpoints.
