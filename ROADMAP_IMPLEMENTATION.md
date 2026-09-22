# CareerForgeAI Roadmap

The roadmap page now follows the *interaction model* of modern developer roadmap products such as roadmap.sh without copying its wording or proprietary content.

## Implemented
- Role-specific roadmap generation; no Full Stack fallback for unrelated roles.
- Interactive center-line learning path with alternating topic cards.
- Course/role switcher across the supported CareerForge roles.
- Track filtering (Foundations, Core, Advanced, Workflow, Production, Projects, Career).
- Click a node to open a detailed side panel.
- Prerequisite-aware locked/unlocked nodes.
- Mark nodes complete and persist progress independently for every role in browser localStorage.
- Bookmark individual nodes.
- Progress percentage and next-up indicator.
- AI generation remains connected to the existing `/roadmap/generate` API.
- Existing CareerForge AI tutor remains available from the roadmap.
- Fallback roadmap is generated from the selected role instead of reusing a generic Full Stack roadmap.

## Run

Frontend:

```powershell
npm install
npm run dev
```

Backend:

```powershell
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
