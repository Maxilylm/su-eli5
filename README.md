# ELI5

> Paste dense text and get the same thing explained at three levels: five-year-old, high schooler, and expert.

**[Live demo](https://eli5-mlx.vercel.app)**

Legal contracts, medical reports, and academic abstracts are written for people who already understand them. ELI5 takes a block of that text — up to 10,000 characters — and returns three explanations in a single call: an under-80-word version using everyday analogies, an under-150-word version pitched at a teenager with technical terms defined, and an under-120-word expert summary that assumes full domain knowledge. Each explanation comes back with its own word count and a labelled reading level.

## Features

- Three comprehension levels generated from one input, switchable via tabs
- Each level reports its word count and reading level (Grade 1-2, Grade 9-10, College/Professional)
- 10,000-character input cap validated server-side
- Handles models that wrap JSON in markdown fences by stripping them before parsing
- Low temperature (0.3) to keep explanations faithful to the source text

## Stack

- Next.js 16 (App Router) with React 19 and TypeScript
- Tailwind CSS v4
- Groq API — `llama-3.3-70b-versatile`

## Running locally

```bash
npm install
npm run dev
```

Requires `GROQ_API_KEY` in `.env.local` (see `.env.example`).

---

Part of a series of 91 small web apps. [Browse them all](https://lorenzoylosada.vercel.app).
