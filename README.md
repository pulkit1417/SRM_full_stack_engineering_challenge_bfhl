# SRM Full Stack Engineering Challenge — BFHL Hierarchy Analyser

<div align="center">

[![Live Demo](https://img.shields.io/badge/Frontend-Live%20Demo-6366f1?style=for-the-badge&logo=vercel)](https://pulkit1417-bfhl-bfhl.vercel.app)
[![API](https://img.shields.io/badge/Backend%20API-Live-10b981?style=for-the-badge&logo=vercel)](https://pulkitgupta-bfhl.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-24292e?style=for-the-badge&logo=github)](https://github.com/pulkit1417/SRM_full_stack_engineering_challenge_bfhl)

**A full-stack REST API + interactive visualiser for processing node hierarchy strings, detecting cycles, and building tree structures.**

</div>

---

## 🔗 Links

| Resource | URL |
|---|---|
| 🖥️ **Frontend (Live)** | https://pulkit1417-bfhl.vercel.app |
| ⚙️ **Backend API (Live)** | https://pulkitgupta-bfhl.vercel.app |
| 📡 **POST /bfhl Endpoint** | https://pulkitgupta-bfhl.vercel.app/bfhl |
| 📁 **GitHub Repository** | https://github.com/pulkit1417/SRM_full_stack_engineering_challenge_bfhl |

---

## 🗂️ Project Structure

```
SRM_full_stack_engineering_challenge_bfhl/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json
│   └── Procfile           # Deployment config
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main React component
    │   └── index.css      # Tailwind + component styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express |
| **Frontend** | React 18, Vite, Tailwind CSS v3 |
| **Deployment** | Vercel (both frontend & backend) |
| **Fonts** | Inter, JetBrains Mono (Google Fonts) |

---

## 🚀 Local Setup

### Backend

```bash
cd backend
npm install
node server.js
# API running at http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

> **Note:** By default the frontend points to the live production API (`https://pulkitgupta-bfhl.vercel.app`). To use your local backend, update `API_BASE` in `frontend/src/App.jsx`.

---

## 📡 API Reference

### `GET /bfhl`

Health check — confirms the API is live.

**Response:**
```json
{
  "status": "ok",
  "message": "SRM BFHL API is live. Use POST /bfhl with { data: [...] } to process node strings.",
  "endpoint": "POST /bfhl"
}
```

---

### `POST /bfhl`

Processes an array of node strings and returns hierarchy analysis.

**Request:**
```json
{
  "data": ["A->B", "A->C", "B->D", "C->E"],
  "user_id": "john_doe_01012001",
  "email_id": "john@example.com",
  "college_roll_number": "RA2311XXXXXXXX"
}
```

**Response:**
```json
{
  "user_id": "john_doe_01012001",
  "email_id": "john@example.com",
  "college_roll_number": "RA2311XXXXXXXX",
  "hierarchies": [
    {
      "root": "A",
      "tree": { "A": { "B": { "D": {} }, "C": { "E": {} } } },
      "depth": 3,
      "has_cycle": false
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

## ⚙️ Processing Rules

| Rule | Behaviour |
|---|---|
| **Valid node** | `X->Y` where X and Y are single uppercase letters A–Z |
| **Invalid entries** | Anything that doesn't match the pattern — tracked & returned |
| **Duplicate edges** | First occurrence is used; duplicates are tracked separately |
| **Multi-parent (diamond)** | First-encountered parent edge wins |
| **Self-loops** | Treated as invalid (`A->A`) |
| **Cycle detection** | If a cycle exists: `has_cycle: true`, `tree: {}` |
| **Depth** | Number of nodes on the longest root-to-leaf path |

---

## 👤 Submitter

| Field | Value |
|---|---|
| **Name** | Pulkit Gupta |
| **Email** | pg1736@srmist.edu.in |
| **Roll Number** | RA23110028030014 |
| **User ID** | pulkitgupta_24082005 |
