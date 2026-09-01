[README.md](https://github.com/user-attachments/files/30973180/README.md)
# Sentiment-Mapped Social Listener

A full-stack web app that analyzes real-time public sentiment on any topic by pulling live news articles and YouTube comments, scoring them with NLP, and generating an AI-written summary of *why* the sentiment looks the way it does.

**[Live Demo →](https://sentiment-social-listener-omega.vercel.app/)**

*Note: the backend is hosted on Render's free tier, which spins down after periods of inactivity. If the site feels slow on your first search, that's why — give it up to a minute on a cold start, and it'll be fast after that.*

---

## What It Does

Type any topic — a person, company, event, whatever — and the dashboard pulls real, current news articles and YouTube comments about it, scores each one for sentiment using VADER, and visualizes the results:

- **Overall Sentiment Score** — a single 0–100 index summarizing how the topic is trending
- **AI-generated summary** — a Claude-powered explanation of *why* sentiment looks the way it does, grounded in real sample articles and comments, not just the raw number
- **Sentiment Distribution** — a pie chart breaking results into positive / neutral / negative
- **Articles vs. Comments comparison** — side-by-side sentiment scores, since news coverage and public comments often diverge
- **Sentiment histogram** — shows the *shape* of the distribution (tightly clustered vs. polarized) for both articles and comments
- **Top & bottom examples** — the most positive and most negative articles/comments, so you can see exactly what's driving the score
- **Color-coded feed** — every article and comment is displayed with sentiment-based coloring (green/gray/red)

Every search is also persisted to a database, building a historical record over time.

---

## Tech Stack

**Backend:** Python, FastAPI, VADER Sentiment, Supabase (PostgreSQL)
**Frontend:** React, TypeScript, Recharts
**APIs:** NewsAPI, YouTube Data API v3, Claude API (Anthropic)
**Deployment:** Render (backend), Vercel (frontend)

---

## How It Works

1. User submits a topic through the search bar
2. The backend queries **NewsAPI** and **YouTube Data API v3** in parallel for real, current content on that topic
3. Every article and comment is scored using **VADER**, a rule-based sentiment analysis tool
4. Aggregate statistics are computed server-side — overall score, positive/neutral/negative breakdown, articles-vs-comments comparison, histogram bins, and the most extreme (highest/lowest scoring) examples
5. A curated sample of the most extreme examples is sent to **Claude** (Haiku model) to generate a short, grounded explanation of what's driving the sentiment — this acts as a contextual layer on top of VADER's scoring, not a replacement for it
6. Every scored article and comment is saved to **Supabase**
7. The frontend renders everything as an interactive dashboard

---

## Known Limitations

Being upfront about tradeoffs made along the way:

- **VADER can't detect sarcasm or context.** A sarcastic comment using positive-sounding words will often score as positive, even when a human reader would immediately catch the sarcasm. This is a real, demonstrable limitation of rule-based sentiment scoring — the AI summary feature partially compensates for this by reading actual content in context, but the underlying VADER scores themselves don't account for it.
- **YouTube comment relevance varies significantly by topic.** Broadly-discussed cultural topics (politics, celebrities, sports) tend to generate genuinely on-topic public reaction. Narrower or more technical topics often surface comments that are tangential or unrelated to the actual search, which can add noise to the aggregate score. This was a deliberate tradeoff — the feature was kept because it adds real value for the topics where it works well.
- **Each search pulls a fresh, independent sample.** Searching the same topic on different days queries different articles and videos, since content availability changes over time. This means changes observed between searches may reflect differences in *what content exists* as much as genuine shifts in public sentiment — worth keeping in mind if comparing the same topic across sessions.
- **Keyword-based search has real limits.** Ambiguous single-word topics can occasionally return tangentially related results, since NewsAPI's search matches on keyword presence rather than true topical relevance.

---

## What I'd Improve Next

- Swap VADER for a transformer-based sentiment model (e.g., a fine-tuned BERT/RoBERTa model, or an LLM-based classifier). These are slower and more resource-intensive than a rule-based scorer like VADER, but are meaningfully better at picking up on sarcasm, slang, emojis, and context — VADER's biggest blind spots
- Reddit integration (originally planned, blocked by Reddit's current API approval policy — application pending)
- Tighter relevance filtering for ambiguous topics (e.g., NewsAPI's `qInTitle` parameter, tested and partially implemented)
- Automated test coverage
- Weighting or filtering YouTube comments by relevance before including them in the aggregate score
- Info buttons next to charts (e.g., the histogram) explaining how to read each distribution
- A filter/sort option to view all articles and comments ordered by sentiment score, highest to lowest

---

## Running Locally

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

You'll need your own API keys for NewsAPI, YouTube Data API v3, Supabase, and Claude — add them to a `.env` file in `backend/` (see `.env.example` if provided, or check `main.py` for the required variable names).

---

Built by Jalen Tran — UCLA Mathematics of Computation, Summer 2026
