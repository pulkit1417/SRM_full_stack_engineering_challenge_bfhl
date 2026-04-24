# SRM Full Stack Engineering Challenge — BFHL API

## Overview
REST API (`POST /bfhl`) that accepts an array of node strings, processes hierarchical relationships, and returns structured insights. Includes a single-page frontend for interactive use.

## Stack
- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JS

## Setup

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## API

### POST /bfhl

**Request:**
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

**Response:**
```json
{
  "user_id": "...",
  "email_id": "...",
  "college_roll_number": "...",
  "hierarchies": [...],
  "invalid_entries": [...],
  "duplicate_edges": [...],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

## Processing Rules
- Valid nodes: `X->Y` where X, Y are single uppercase letters (A-Z)
- Self-loops (`A->A`) are invalid
- Duplicate edges: first occurrence is used, subsequent ones tracked
- Diamond/multi-parent: first-encountered parent edge wins
- Cycle detection: if a cycle exists, `has_cycle: true` and `tree: {}`
- Depth: count of nodes on longest root-to-leaf path
