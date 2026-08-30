# AlphaLegalGPT Frontend

React + Vite chat interface for the AI Legal Assistant. Supports English and Tamil with real-time streaming, location-based nearby office search, and law reference sidebars.

## Stack
- **Runtime**: Vite 5.1
- **UI**: React 18.2
- **Styling**: Tailwind CSS 3.4
- **State**: React Context (Auth), hooks
- **i18n**: react-i18next (English + Tamil)
- **Real-time**: Socket.io-client
- **Markdown**: react-markdown

## Key Pages
| Path | Component | Purpose |
|------|-----------|---------|
| `/login` | `Login.jsx` | Email/password + OTP verification |
| `/signup` | `Signup.jsx` | Registration with email OTP |
| `/` | `MainApp.jsx` | Protected main chat interface |

## Core Components
- **Sidebar** — chat history, language switch, settings
- **ChatWindow** — message list with markdown rendering
- **ChatInput** — text input with location toggle
- **SettingsModal** — app preferences
- **NearbyOfficesSidebar** — maps links for courts/offices within 10km
- **LawReferenceSidebar** — detected IPC/BNS/CrPC section references

## Hooks & Services
- `hooks/useChat.js` — chat state, send, history CRUD, location
- `hooks/useGeolocation.js` — browser geolocation API
- `services/api.js` — REST + Socket.io client wrapper

## Build
```bash
cd frontend
npm install
npm run dev      # localhost:5173
npm run build    # production bundle
```

## Env
No frontend env vars required. Backend URL is proxied via Vite `/api` or same-origin Socket.io connection.