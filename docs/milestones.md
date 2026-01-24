# Milestone Progress

## M1: Scaffold (Completed)

**Commit:** `4a49b76` - Scaffold M1: React frontend, Azure Functions API, and project config

### What Was Built
- React frontend with Vite + Tailwind CSS (`client/`)
- Azure Functions backend with Node.js v4 programming model (`api/`)
- Project documentation (CLAUDE.md, architecture.md, decisions.md)
- Health check endpoint (`GET /api/health`)
- TypeScript configuration for both frontend and backend
- ESLint config for frontend

### Key Files
| File | Purpose |
|------|---------|
| `client/` | React + Vite + Tailwind frontend scaffold |
| `api/src/functions/health.ts` | Health check endpoint |
| `api/host.json` | Azure Functions host config |
| `api/tsconfig.json` | TypeScript config (ESNext modules) |
| `api/local.settings.json` | Local env vars template |
| `docs/CLAUDE.md` | Project context and conventions |
| `docs/architecture.md` | System diagram and data flows |
| `docs/decisions.md` | Architecture Decision Records |

---

## M2: Backend + Data (Completed)

**Description:** Azure Functions API, scholarship dataset, embeddings, and RAG pipeline

### What Was Built
- 25 curated real Indian government scholarships (central + state schemes)
- Vector embeddings infrastructure (cosine similarity search)
- RAG-powered chat endpoint with Azure OpenAI GPT
- 9-step bilingual guided eligibility wizard
- Translation endpoint with language auto-detection
- Chat history persistence via Azure Table Storage

### Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Free-form chat with RAG (translate → embed → vector search → GPT → respond) |
| `/api/guided-flow` | POST | Step-by-step eligibility wizard (9 questions, EN/HI) |
| `/api/translate` | POST | Text translation with language detection |

### Key Files
| File | Purpose |
|------|---------|
| `data/scholarships.json` | 25 scholarship records with full eligibility, benefits, steps |
| `data/embeddings.json` | Vector store (generated via script) |
| `api/src/functions/chat.ts` | Chat endpoint - RAG pipeline |
| `api/src/functions/guidedFlow.ts` | Guided flow - stateless step machine |
| `api/src/functions/translate.ts` | Translation endpoint |
| `api/src/shared/openai.ts` | Azure OpenAI client (chat + embeddings) |
| `api/src/shared/embeddings.ts` | Cosine similarity + top-K search |
| `api/src/shared/scholarshipData.ts` | Data loading, vector search, filter logic |
| `api/src/shared/translator.ts` | Azure Translator REST wrapper |
| `api/src/shared/tableStorage.ts` | Chat history CRUD (Table Storage) |
| `api/src/scripts/generateEmbeddings.ts` | One-time embedding generation script |

### Dependencies Added
- `openai` - Azure OpenAI SDK
- `@azure/data-tables` - Azure Table Storage
- `axios` - HTTP client for Translator API

### Environment Variables Required
| Variable | Service |
|----------|---------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI |
| `AZURE_OPENAI_KEY` | Azure OpenAI |
| `AZURE_OPENAI_DEPLOYMENT` | Azure OpenAI (GPT model) |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | Azure OpenAI (ada-002) |
| `AZURE_TRANSLATOR_KEY` | Azure Translator |
| `AZURE_TRANSLATOR_ENDPOINT` | Azure Translator |
| `AZURE_TRANSLATOR_REGION` | Azure Translator |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Table Storage |

### Gotchas
1. **Run `npm run generate-embeddings` before first use** - chat falls back to first 5 results without embeddings
2. **Translator endpoint** must be `https://api.cognitive.microsofttranslator.com`
3. **Guided flow is stateless** - client accumulates answers and sends full object each step
4. **Table Storage auto-creates** - `ChatHistory` table created on first write; chat still works if storage is unavailable
5. **ESM imports** use `.js` extensions as required by ESNext module resolution

---

## M3: Frontend + Chat (Open)

**Description:** React UI components, chat interface, guided flow, and language toggle

---

## M4: Integration + Deploy (Open)

**Description:** Supabase auth, Azure deployment, end-to-end testing, and polish
