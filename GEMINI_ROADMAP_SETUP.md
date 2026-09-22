# CareerForge AI — Gemini Roadmap Agent

## 1. Get a Gemini API key
Create a key in Google AI Studio and keep it server-side.

## 2. Configure backend
Copy `backend/.env.example` to `backend/.env` and set:

```env
GEMINI_API_KEY=YOUR_KEY
AI_PROVIDER=gemini
```

## 3. Run backend
```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

## 4. Run frontend
```powershell
npm install
npm run dev
```

The roadmap page calls `POST /api/v1/roadmap/generate`. The floating CareerForge AI Agent calls `POST /api/v1/ai/tutor`. If Gemini is unavailable, the roadmap falls back to a local template so the demo still works.
