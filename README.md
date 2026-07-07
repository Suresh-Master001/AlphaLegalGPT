# AlphaLegalGPT

AlphaLegalGPT is an advanced AI Legal Assistant web application powered by the Google Gemini API. It provides users with intelligent, context-aware legal assistance, featuring real-time chat capabilities, secure authentication with OTP verification, and document analysis functionality.

## 🎯 User Outcomes & Benefits

For the end-users (legal professionals, law students, and clients), AlphaLegalGPT delivers tangible, real-world value:

1. **Instant Legal Clarification**: Users can ask complex legal questions and receive immediate, context-aware, and easy-to-understand explanations, drastically reducing manual research time.
2. **Effortless Document Review**: By uploading lengthy legal PDFs (contracts, case files), users can instantly extract key clauses, summarize content, and ask specific questions about the document without having to read it cover-to-cover.
3. **Frictionless & Secure Onboarding**: Users experience a seamless sign-up process with highly secure, banking-grade OTP email verification, establishing immediate trust in the platform.
4. **Zero-Lag Conversations**: Thanks to real-time WebSocket streaming, users see AI responses generated instantly—reading along as the AI "types," which keeps them engaged and saves time.
5. **Accessible Anywhere**: A beautifully responsive, mobile-first design means users can consult their AI legal assistant from their phones in court, on a commute, or at their desks.
6. **Data Privacy Confidence**: Robust session management and isolated document parsing ensure that user queries and sensitive legal documents are handled securely and privately.

---

## 🌟 Comprehensive Feature List

### 🤖 AI-Powered Legal Assistant
- **Intelligent Chat Interface**: Context-aware conversational AI powered by Google Gemini API.
- **Real-Time Streaming**: Low-latency, real-time message streaming using Socket.io (WebSockets).
- **Markdown Support**: Renders complex legal responses, tables, and lists beautifully using `react-markdown`.

### 🔐 Advanced Authentication & Security
- **OTP Verification System**: 
  - 6-digit secure numeric codes for account activation.
  - 10-minute expiry window for all OTPs.
  - Secure Password Reset flow via OTP verification.
- **Robust Security Measures**:
  - Rate-limiting built-in (e.g., 60-second cooldown for OTP resend, 5-minute global cooldowns).
  - Passwords hashed via BcryptJS.
  - Secure session management using JSON Web Tokens (JWT).
- **Professional Email Delivery**: Beautifully formatted HTML email templates for verifications and password resets (via Nodemailer).

### 📄 Document Analysis & Management
- **PDF Uploads**: Securely upload legal documents (PDF format).
- **Text Extraction**: Server-side text parsing using `pdf-parse`.
- **AI Contextualization**: Extracted document text is fed into the Gemini API for document-specific legal Q&A and analysis.
- **File Validation**: Strict file type and size validation using Multer.

### ⚡ Performance & Optimization Outcomes
- **API Key Caching**: Backend caches the Gemini API key to eliminate redundant disk I/O operations, reducing request overhead.
- **Asynchronous Operations**: Non-blocking asynchronous file handling (`fs/promises`) for uploads and text extraction speeds up processing times.
- **Frontend Rendering Optimizations**: Extensive use of `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary component re-renders, resulting in a smooth UI.
- **Unified Error Handling**: Clear, user-friendly error messages (e.g., specific alerts for expired OTPs, rate limits, or validation errors).

---

## Technology Stack

### Frontend
- **React 18** (via Vite)
- **Tailwind CSS** (Styling & Layout)
- **Framer Motion** (Animations)
- **Socket.io-Client** (Real-time communication)
- **React Router** (Navigation)
- **React Markdown** (Formatting AI responses)

### Backend
- **Node.js & Express** (Server framework)
- **MongoDB & Mongoose** (Database)
- **@google/generative-ai** (Google Gemini API integration)
- **Socket.io** (WebSocket server)
- **Nodemailer** (Email delivery for OTP)
- **PDF-Parse** (Document text extraction)
- **Multer** (File uploads)
- **BcryptJS & JSONWebToken** (Authentication & Security)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Google Gemini API Key
- Email Account (for SMTP/OTP setup)

### Environment Variables

You need to configure the environment variables for both the backend and frontend.

#### Backend (`backend/.env`)
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key

# Email configuration for OTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AlphaLegalGPT
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## License

This project is proprietary and confidential.
