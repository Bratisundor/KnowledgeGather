# 🌐 ChatChase Deployment & Live Hosting Guide

This guide explains how to run ChatChase live both immediately (via secure HTTPS tunnel) and permanently (via free cloud hosting on Vercel + Render).

---

## ⚡ Option 1: Instant Live Public URL (Active Right Now)

Your local full-stack app (Backend + Frontend) is already proxied via a public secure HTTPS tunnel:

- **Live URL**: `https://cruel-ties-try.loca.lt`
- **Tunnel Password / IP (if prompted on first visit)**: `150.129.65.244`

*Anyone in the world on mobile, tablet, or PC can open this link and test all 4 specialized AI agents, WhatsApp chat bubbles, analytics charts, and evidence verification.*

---

## ☁️ Option 2: 24/7 Permanent Cloud Hosting (100% Free)

Deploy your GitHub repository (`https://github.com/Bratisundor/KnowledgeGather`) to the cloud in under 3 minutes:

### Step A: Deploy Backend (FastAPI) on Render.com
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your repository: `Bratisundor/KnowledgeGather`.
4. Configure:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Add Environment Variable**:
     - Key: `PYTHONPATH`, Value: `.`
5. Click **Deploy Web Service**.
6. Render will generate your live backend URL (e.g. `https://chatchase-backend.onrender.com`).

---

### Step B: Deploy Frontend (Next.js) on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import `Bratisundor/KnowledgeGather`.
4. Set **Root Directory**: `frontend`.
5. Under **Environment Variables**, add:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://chatchase-backend.onrender.com` (your Render backend URL from Step A)
6. Click **Deploy**.
7. Your app is live with custom `.vercel.app` domain and free SSL!

---

## 🐳 Option 3: Universal Docker Container
```bash
docker build -t chatchase .
docker run -p 8000:8000 chatchase
```

