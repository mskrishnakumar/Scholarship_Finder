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
