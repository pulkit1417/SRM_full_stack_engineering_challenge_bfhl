# BFHL Backend — Heroku

Express REST API for SRM Full Stack Engineering Challenge.

## Deploy to Heroku

```bash
cd backend
heroku login
heroku create your-app-name
git init
heroku git:remote -a your-app-name
git add .
git commit -m "initial"
git push heroku main
```

## Local Dev

```bash
npm install
npm run dev
```

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/bfhl` | Health check |
| POST | `/bfhl` | Process node data |

## POST /bfhl Body

```json
{
  "data": ["A->B", "A->C", "B->D"],
  "user_id": "optional_override",
  "email_id": "optional_override",
  "college_roll_number": "optional_override"
}
```
