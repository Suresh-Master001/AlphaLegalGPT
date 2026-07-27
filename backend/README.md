# AlphaLegalGPT Backend

**Owned & Maintained by [CodeNxte Web & Software Solutions](https://codenxte.com)**

AI-powered legal assistant backend for Indian law (IPC, BNS 2023), built with Express, Socket.io, and Google Gemini.

## Stack
- **Runtime**: Node.js (ESM)
- **Framework**: Express 4.18
- **Real-time**: Socket.io 4.7
- **AI/LLM**: Google Generative AI (Gemini Flash)
- **Storage**: Local JSON files (`server/data/`)
- **Auth**: JWT + bcrypt + OTP via nodemailer

## Core Routes (`server/routes/`)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | Email/password login |
| `/api/auth/signup` | POST | Register + send OTP |
| `/api/auth/verify-otp` | POST | Verify OTP, get JWT |
| `/api/auth/forgot-password` | POST | Request reset OTP |
| `/api/auth/reset-password` | POST | Reset with OTP |
| `/api/chat` | POST | Send message (REST) |
| `/api/chat/history` | GET | List user's chat sessions |
| `/api/chat/history/:id` | GET | Get specific session |
| `/api/chat/history/:id` | DELETE | Delete session |
| `/api/chat/clear-all` | GET | Clear all user history |
| `/api/laws/search` | GET | Search IPC/BNS by keyword |
| `/api/upload` | POST | Upload PDF/TXT (auth required) |
| `/api/health` | GET | Health check |

## WebSocket Events
- `chat:message` → `chat:stream` / `chat:complete` / `chat:typing`

## Data Models (`server/data/models/`)
- **User** — email, password (bcrypt), OTP, verification
- **Chat** — per-user sessions with message arrays
- **GlobalHistory** — deduplicated Q&A for offline fallback

## Data Files (`server/data/`)
- `ipc_dataset.json` — IPC sections with title/content/punishment
- `data.js` — BNS 2023 sample sections
- `chats.json`, `users.json`, `global_history.json` — runtime storage

## Environment Variables
```
GEMINI_API_KEY=...
JWT_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
FRONTEND_URL=http://localhost:5173
```

## Run
```bash
cd backend
npm install
npm start        # port 3001
npm run dev      # nodemon