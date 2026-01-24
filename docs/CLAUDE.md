# Scholarship Finder - Project Context

## Overview
A chatbot that helps students from underserved communities in India discover government schemes and scholarships they're eligible for. Built for the Magic Bus hackathon.

## Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS, hosted on Azure Static Web Apps
- **Backend:** Azure Functions (Node.js)
- **LLM:** Azure OpenAI (GPT model for chat completion)
- **Embeddings:** OpenAI text-embedding-ada-002 (vector semantic search)
- **Database:** JSON files (scholarship data) + Azure Table Storage
- **Translation:** Azure Translator API (English <-> Hindi)
- **Authentication:** Supabase (Student & Admin roles)

## Project Structure (Planned)
```
Scholarship_Finder/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React context providers
│   │   ├── services/        # API client functions
│   │   ├── utils/           # Helper utilities
│   │   └── assets/          # Static assets
│   ├── tailwind.config.js
│   └── vite.config.js
├── api/                     # Azure Functions backend
│   ├── chat/                # Chat endpoint
│   ├── translate/           # Translation endpoint
│   ├── guided-flow/         # Guided conversation endpoint
│   └── shared/              # Shared utilities
├── data/                    # Scholarship JSON data + embeddings
├── docs/                    # Project documentation
└── infra/                   # Azure infrastructure config
```

## Key Features
- **Dual interaction modes:** Guided step-by-step flow AND free-form natural language chat
- **Comprehensive filters:** State, caste category, income, education, gender, disability, religion, urban/rural, course/field
- **Bilingual:** English/Hindi toggle for full UI and chat
- **Scholarship results:** Eligibility details, benefits, deadlines, step-by-step application instructions
- **Auth:** Student and Admin login via Supabase

## Conventions
- Use TypeScript throughout (frontend and backend)
- Tailwind CSS for all styling (no custom CSS files)
- Azure Functions use the v4 programming model
- Component files use PascalCase (e.g., `ChatWindow.tsx`)
- Utility files use camelCase (e.g., `apiClient.ts`)
- Environment variables prefixed with `VITE_` for frontend, standard for backend

## Azure SWA + Functions v4: Avoiding API 404 Errors

When deploying Azure Functions (v4 programming model) as managed APIs on Azure Static Web Apps, the following requirements MUST be met or all `/api/*` routes will return 404:

### 1. Node.js Runtime Version
Azure SWA defaults to Node 18 for managed functions, but `@azure/functions@4.x` (v4.8+) requires Node >= 20. You MUST set the runtime explicitly:

**File: `client/public/staticwebapp.config.json`** (goes in the app's `output_location` root)
```json
{
  "platform": {
    "apiRuntime": "node:20"
  }
}
```

Without this, functions will silently fail to load at runtime — the deployment succeeds but every API call returns 404.

### 2. Single Entry Point (v4 programming model)
The v4 model uses `app.http()` registrations instead of `function.json` files. Azure needs a single `main` entry in `package.json` that imports all function registrations:

**`api/package.json`:**
```json
{
  "main": "dist/index.js"
}
```

**`api/src/index.ts`:**
```typescript
import './functions/chat.js'
import './functions/guidedFlow.js'
import './functions/health.js'
// ... all function files
```

A glob pattern like `"main": "dist/functions/*.js"` does NOT work.

### 3. CommonJS Output
Azure SWA managed functions require CommonJS output. Ensure `tsconfig.json` produces `require()` calls, not ES module `import` statements:
```json
{
  "compilerOptions": {
    "module": "Node16",
    "target": "ES2022"
  }
}
```
With `"module": "Node16"` and no `"type": "module"` in package.json, TypeScript emits CommonJS.

### 4. Separate Embedding Endpoint (Multi-resource Azure OpenAI)
If the embedding model and chat model are on different Azure OpenAI resources, you need separate env vars:
- `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_KEY` — for chat completions
- `AZURE_OPENAI_EMBEDDING_ENDPOINT` / `AZURE_OPENAI_EMBEDDING_KEY` — for embeddings

The code in `api/src/shared/openai.ts` falls back to the main endpoint if embedding-specific vars are not set.

### Debugging Checklist
When API endpoints return 404 after a successful deployment:
1. Check the deploy log for `Function Runtime Information` — verify `node version: 20`
2. Confirm `staticwebapp.config.json` is in the built output (e.g., `client/dist/`)
3. Confirm `api/package.json` has `"main"` pointing to a concrete `.js` file (not a glob)
4. Confirm that file exists after `npm run build` and `require()`s all function registrations
5. Check for Node engine warnings: `npm warn EBADENGINE` for `@azure/functions`

## Development Commands
```bash
# Frontend
cd client && npm run dev        # Start dev server
cd client && npm run build      # Production build

# Backend
cd api && npm start             # Start Azure Functions locally
cd api && npm run build         # Build functions

# Full stack
npm run dev                     # Start both (if configured)
```
