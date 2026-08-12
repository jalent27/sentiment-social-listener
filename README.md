[README.md](https://github.com/user-attachments/files/30973180/README.md)
# Sentiment-Mapped Social Listener

A full-stack web app that lets you search any topic — "Tesla," "Lakers," a company name — and see how it's being talked about right now. It pulls live news articles and YouTube comments, scores each one with sentiment analysis, stores the results in a database, and displays them on a React dashboard.

**Status: Actively in development (Week 4 of a 6-week build).** Core data pipeline and sentiment scoring are working end to end. Visualization features (timeline chart, breakdown chart, color-coded feed) are in progress. See [Roadmap](#roadmap) below for exactly what's done vs. what's next.

---

## What it does today

- Search any topic from the React frontend
- Backend fetches live articles from **NewsAPI** and comments/videos from the **YouTube Data API v3**
- Every post is scored with **VADER** sentiment analysis (-1 to +1)
- Results are persisted to a **Supabase (PostgreSQL)** `posts` table, so sentiment history accumulates over time per topic
- Dashboard displays an **Overall Sentiment Score** and renders the underlying articles/comments in a list

## In progress (Week 4)

- [ ] Timeline chart — average sentiment over time, via a dedicated Supabase-querying endpoint
- [ ] Sentiment breakdown pie chart (Recharts) — % positive / neutral / negative
- [ ] Color-coded post feed cards (green / gray / red by sentiment)

## Roadmap

- **Week 5 — AI Summary:** Use the Claude/OpenAI API to generate a short paragraph explaining *why* the sentiment looks the way it does, as a contextual layer on top of the VADER scores (not blended into the score itself)
- **Week 6 — Deploy & polish:** Backend to Render, frontend deployment, edge case handling, final README pass with screenshots and a live demo link

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + TypeScript | Search UI and dashboard |
| Backend | Python + FastAPI | API endpoints, data fetching, sentiment scoring |
| NLP | VADER | Rule-based sentiment scoring, -1 to +1 |
| Data Sources | NewsAPI, YouTube Data API v3 | Live articles and video/comment data |
| Database | Supabase (PostgreSQL) | Stores posts, scores, and timestamps |
| Charts | Recharts | Timeline and breakdown visualizations |
| AI Summary (planned) | Claude / OpenAI API | Generates a sentiment explanation paragraph |
| Deployment (planned) | Render | Backend hosting (free tier) |

## Architecture

```
User enters topic in React search bar
        │
        ▼
GET /analyze/{topic}  (FastAPI)
        │
        ├──► NewsAPI       → recent articles about {topic}
        ├──► YouTube API   → recent videos/comments about {topic}
        │
        ▼
Each post scored with VADER (-1 to +1)
        │
        ▼
Stored in Supabase `posts` table
(id, topic, content, sentiment_score, created_at)
        │
        ▼
Overall sentiment score computed server-side
        │
        ▼
JSON returned to React → rendered on dashboard
```

Sentiment scoring and the overall-score calculation happen on the backend by design — the frontend receives and displays computed results rather than recalculating them, keeping the scoring logic centralized in one place.

## Key technical decisions

- **VADER over a transformer-based model.** Chosen for speed and to stay light enough for Render's free tier. The tradeoff — VADER can't reliably detect sarcasm — is a known and explainable limitation rather than a blind spot.
- **YouTube Data API v3 over Reddit/PRAW.** The project originally used Reddit as a data source; a change to Reddit's API access policy made that impractical, so the data pipeline was rebuilt around YouTube instead. This is reflected in the current architecture, not a leftover of the original plan.
- **Server-side business logic.** The overall sentiment score is computed in FastAPI, not in React, so there's a single source of truth for how a topic's score is derived.

## Setup

**Backend**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
# runs on http://127.0.0.1:8000
```

**Frontend**
```bash
cd frontend
npm install
npm start
# runs on http://localhost:3000
```

**Environment variables** (backend `.env`)
```
NEWSAPI_KEY=your_key_here
YOUTUBE_API_KEY=your_key_here
SUPABASE_URL=your_url_here
SUPABASE_KEY=your_key_here
```

---

## Why this project

Built as a self-directed project to go beyond single-layer tutorials: it touches a live data pipeline, NLP, a real database, and (soon) generative AI in one system, end to end, rather than in isolation. Every part of it was written to be explainable line by line — the goal wasn't just a working demo, but being able to walk through architectural decisions (like the VADER tradeoff and the Reddit→YouTube pivot) in a technical interview.

---

*Jalen · UCLA Mathematics of Computation · Summer 2026*
