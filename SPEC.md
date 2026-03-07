# AttorneyGPT - AI Legal Assistant Platform

## Project Overview
- **Project Name**: AttorneyGPT
- **Type**: Full-stack AI Legal Assistant Web Application
- **Core Functionality**: Simulates RAG-based legal Q&A system using Indian Penal Code (IPC) dataset
- **Target Users**: Legal professionals, law students, and citizens seeking legal information

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Icons
- i18next (English + Tamil)
- React Markdown
- Socket.io-client

### Backend
- Node.js
- Express.js
- LangChain JS
- ChromaDB
- @huggingface/inference
- Socket.io
- cors, dotenv

---

## UI/UX Specification

### Color Palette
- **Background**: `#0f0f0f`
- **Sidebar**: `#171717`
- **Borders**: `#2a2a2a`
- **AI Message BG**: `#1a1a1a`
- **User Message BG**: `#2d2d2d`
- **Primary Accent**: `#10a37f` (ChatGPT green)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#8e8e8e`
- **Input BG**: `#1a1a1a`
- **Hover BG**: `#2a2a2a`

### Typography
- **Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- **Heading (App Name)**: 20px, font-weight 700
- **Message Text**: 15px, font-weight 400
- **Sidebar Items**: 14px, font-weight 400
- **Input**: 15px
- **Badge**: 12px, font-weight 600, uppercase
- **Citation**: 13px, font-weight 500
- **Confidence**: 12px

### Spacing System
- **Sidebar Width**: 260px
- **Chat Container Max Width**: 900px
- **Message Padding**: 16px
- **Message Gap**: 24px
- **Input Padding**: 12px 16px
- **Border Radius (Messages)**: 16px
- **Border Radius (Input)**: 24px

### Layout Structure

#### Left Sidebar (260px width)
- **Header**: App logo + "AttorneyGPT" text
- **New Chat Button**: Full width, prominent styling
- **Chat History**: Scrollable list of previous conversations
- **Footer**: Language toggle + User avatar + Settings icon

#### Main Chat Area
- **Container**: Centered, max-width 900px
- **Header**: Model info
- **Messages**: Scrollable, with new messages appearing at bottom
- **Input Area**: Fixed at bottom, sticky

### Components

#### Sidebar
- Logo with gavel icon
- "New Chat" button with + icon
- Chat history items (truncated to 1 line)
- Active chat highlighted
- Language toggle (EN/Tamil flags)
- User avatar circle

#### ChatMessage (User)
- Aligned right
- Dark bubble background (#2d2d2d)
- Border radius: 16px (top-right smaller)
- Timestamp below

#### ChatMessage (AI)
- Aligned left
- Subtle background (#1a1a1a)
- Contains:
  - Avatar icon
  - Message content with Markdown support
  - "Based on IPC" badge
  - Expandable citation section
  - Confidence score
  - Timestamp

#### ChatInput
- Auto-expanding textarea (max 200px height)
- Send button (icon)
- Voice input icon (disabled state)
- PDF upload icon (disabled state)
- Border radius: 24px
- Disabled state when loading

### Animations
- **Framer Motion**:
  - Sidebar slide in on load
  - Message fade-in + slide up
  - Typing indicator pulse
  - Button hover scale
- **Streaming text**: Character-by-character appearance
- **Smooth scrolling**: To bottom on new message

---

## Functionality Specification

### Core Features

1. **Chat Interface**
   - Send messages via Enter key or button click
   - Auto-scroll to new messages
   - Typing indicator during AI response
   - Message history persistence (localStorage)

2. **RAG Pipeline**
   - Load IPC dataset from JSON
   - Text chunking (500 chars, 50 char overlap)
   - Generate embeddings using HuggingFace
   - Store in ChromaDB vector store
   - Retrieve top 3 relevant sections
   - Generate response using LLM

3. **Streaming Responses**
   - Socket.io for real-time token streaming
   - Typing animation on frontend
   - Chunked response display

4. **Citations & Confidence**
   - Display IPC section references
   - Show confidence score (0-100%)
   - Expandable citation section

5. **Internationalization**
   - English (default)
   - Tamil (தமிழ்)
   - Toggle in sidebar

### API Endpoints

#### POST /api/chat
```json
Request: { "query": "string" }
Response: { 
  "answer": "string", 
  "citations": ["string"], 
  "confidence": number 
}
```

#### WebSocket Events
- `chat:message` - Send user query
- `chat:streaming` - Receive streaming tokens
- `chat:complete` - Response complete

### Data Handling
- Chat history stored in localStorage
- Vector store initialized on server start
- Fallback to rule-based responses if LLM unavailable

---

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme applied consistently
- [ ] Sidebar visible with all elements
- [ ] Chat messages display correctly (left/right alignment)
- [ ] AI messages show badge, citations, confidence
- [ ] Input area sticky at bottom
- [ ] Typing animation works during loading

### Functional Checkpoints
- [ ] Can send messages and receive responses
- [ ] Responses stream in real-time
- [ ] Citations and confidence displayed
- [ ] Language toggle works
- [ ] Chat history persists
- [ ] New chat clears conversation

### Performance
- [ ] Fast initial load
- [ ] Smooth animations (60fps)
- [ ] Responsive design

---

## File Structure

```
AttorneyGPT/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   └── ChatInput.jsx
│   │   ├── hooks/
│   │   │   └── useChat.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── i18n/
│   │   │   └── config.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── server/
│   │   ├── server.js
│   │   ├── routes/
│   │   │   └── chat.js
│   │   ├── rag/
│   │   │   ├── embeddings.js
│   │   │   ├── vectorStore.js
│   │   │   └── retriever.js
│   │   └── data/
│   │       └── ipc_dataset.json
│   └── package.json
│
└── SPEC.md
```

