# BFHL Frontend — Vercel

Single-page hierarchy visualizer for the SRM Full Stack Engineering Challenge.

## Setup

1. Open `app.js` and update the `API_BASE` variable to your Heroku backend URL:

```js
const API_BASE = "https://your-app.herokuapp.com";
```

2. Deploy to Vercel:

```bash
cd frontend
npx vercel --prod
```

Or connect the `frontend/` folder to a Vercel project via the Vercel dashboard.

## Files

| File | Purpose |
|------|---------|
| `index.html` | App structure |
| `styles.css` | Light + dark theme styles |
| `app.js` | API calls + UI logic |
| `vercel.json` | Vercel routing config |
