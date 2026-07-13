# Vercel Environment Variables Setup

## 🔴 CRITICAL: You Must Set These in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://alphalegalgpt.onrender.com` | Production |
| `VITE_SOCKET_URL` | `https://alphalegalgpt.onrender.com` | Production |

### Why Both?

1. **VITE_API_URL** - REST API calls (fallback when socket fails)
2. **VITE_SOCKET_URL** - Socket.IO connections

Both currently point to Vercel's proxy which doesn't work correctly for WebSocket/SSE connections.

## 🔄 After Setting Variables

1. Redeploy your Vercel project
2. Refresh the page
3. Check browser console for: `✅ Socket connected:`

## 🧪 Alternative Test

If you want to test immediately without waiting for Vercel:

1. Visit: `https://alphalegalgpt.onrender.com/api/health` directly
2. If it returns `{"status":"ok"}`, the backend is running
3. If you see an error, check Render logs for MongoDB/Gemini issues

## 📋 Render Environment Variables Check

Also verify in Render dashboard:
- `MONGODB_URI` - MongoDB Atlas connection string
- `GEMINI_API_KEY` - Your Gemini API key
- `ALLOWED_ORIGINS` - `https://alphalegalgpt.vercel.app`