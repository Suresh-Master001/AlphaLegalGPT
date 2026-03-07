# AlphaLegalGPT - AI Legal Assistant

A full-stack AI legal assistant platform that simulates Retrieval Augmented Generation (RAG) using the Indian Penal Code (IPC) dataset.

## Features

- **ChatGPT-style UI** with dark theme
- **RAG Pipeline** using ChromaDB and HuggingFace embeddings
- **Streaming Responses** via WebSocket
- **i18n Support** - English and Tamil languages
- **Chat History** persistence in localStorage
- **Legal Citations** with confidence scores

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Icons
- i18next
- React Markdown
- Socket.io-client

### Backend
- Node.js
- Express.js
- LangChain JS
- ChromaDB
- HuggingFace embeddings
- Socket.io

## Project Structure

```
AlphaLegalGPT/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── services/  # API services
│   │   └── i18n/      # Internationalization
│   └── ...
├── backend/            # Node.js backend
│   ├── server/
│   │   ├── routes/    # API routes
│   │   ├── rag/       # RAG pipeline
│   │   └── data/      # IPC dataset
│   └── ...
└── SPEC.md            # Project specification
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Configuration

1. Create a `.env` file in the backend directory (copy from `.env.example`):
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   CHROMA_URL=http://localhost:8000
   ```

2. (Optional) Add API keys for enhanced AI features:
   
   **HuggingFace** - For custom embeddings:
   - Get a free API key from: https://huggingface.co/
   - Add to `.env`: `HUGGINGFACE_API_KEY=your_key_here`
   
   **OpenAI** - For advanced LLM responses:
   - Get your API key from: https://platform.openai.com/api-keys
   - Add to `.env`: `OPENAI_API_KEY=your_key_here`
   
   **Together AI** - For open-source LLM alternatives:
   - Get your API key from: https://together.ai/
   - Add to `.env`: `TOGETHER_API_KEY=your_key_here`

3. **Frontend Settings**: You can also configure API keys directly in the app:
   - Click the **Settings** button in the sidebar
   - Enter your API keys in the respective fields
   - Click **Save Changes**
   - Settings are stored locally in your browser

## Running the Application

### Development Mode

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Development Server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and set your FRONTEND_URL if deploying to production
   ```

3. **Start the production server**
   ```bash
   cd backend
   npm start
   ```

4. Open http://localhost:3001 in your browser

---

## Deploying to Production

### Option 1: Self-Hosted Server (VPS/Cloud)

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure environment**
   ```bash
   cd backend
   cp .env.example .env
   nano .env  # Edit FRONTEND_URL to your domain
   ```

3. **Install dependencies and start**
   ```bash
   npm install
   npm start
   ```

4. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "alphalegalgpt" -- start
   ```

### Option 2: Render.com (Free)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Set:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment Variables:
     - `FRONTEND_URL=https://your-app.onrender.com`
     - `PORT=3001`

### Option 3: Railway

1. Push your code to GitHub
2. Create a new project on Railway
3. Connect your GitHub repository
4. Set environment variables in Railway dashboard
5. Deploy

### Option 4: Heroku

1. Install Heroku CLI
2. Create Procfile in backend directory:
   ```
   web: cd backend && npm start
   ```
3. Deploy:
   ```bash
   heroku create alphalegalgpt
   heroku config:set FRONTEND_URL=https://your-app.herokuapp.com
   git push heroku main
   ```

### Option 5: DigitalOcean App Platform

1. Create app from GitHub
2. Set runtime to Node.js
3. Configure:
   - Build Command: `cd backend && npm install`
   - Run Command: `cd backend && npm start`
   - HTTP Port: $PORT

---

## Building for Production

```bash
# Frontend
cd frontend
npm run build

# The built files will be in frontend/dist/
```

## Usage

1. Type a legal question about the Indian Penal Code
2. The AI will search the IPC dataset
3. View citations and confidence scores
4. Toggle between English and Tamil

Example questions:
- "What is IPC Section 420?"
- "What are the punishments for theft?"
- "Explain Section 498A"

## API Endpoints

### POST /api/chat
Send a chat message
```json
{
  "query": "What is IPC Section 420?"
}
```

Response:
```json
{
  "answer": "Section 420 of IPC deals with...",
  "citations": ["IPC Section 420 – Cheating..."],
  "confidence": 0.92
}
```

### WebSocket Events
- `chat:message` - Send message
- `chat:streaming` - Receive streaming tokens
- `chat:complete` - Response complete

## License

MIT

## Disclaimer

This is an AI assistant for educational purposes only and does not constitute legal advice. For specific legal matters, please consult a qualified advocate.

