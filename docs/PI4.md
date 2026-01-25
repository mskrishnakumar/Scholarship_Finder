# PI4 — API Infrastructure: Standalone Azure Functions

## Overview
Migrate the API from Azure Static Web Apps managed functions to a standalone Azure Functions App. This resolves the v4 programming model compatibility issues (see issue #46) and provides better control, scalability, and debugging capabilities.

**Related Issue:** #46 - API endpoints returning 404 - Azure SWA + Functions v4 compatibility issue

---

## PI4.1: Azure Functions App Setup

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| [#69](https://github.com/mskrishnakumar/Scholarship_Finder/issues/69) | Create Azure Functions App resource | Todo | S |
| [#70](https://github.com/mskrishnakumar/Scholarship_Finder/issues/70) | Configure environment variables | Todo | S |
| [#71](https://github.com/mskrishnakumar/Scholarship_Finder/issues/71) | Configure CORS for frontend access | Todo | S |

### Step-by-Step Azure Portal Guide

#### Step 1: Create the Function App

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** → Search **"Function App"** → Click **Create**

3. **Basics tab:**
   | Field | Value |
   |-------|-------|
   | Subscription | Your subscription |
   | Resource Group | Same as your SWA (or create new) |
   | Function App name | `scholarship-finder-api` (must be globally unique) |
   | Runtime stack | **Node.js** |
   | Version | **20 LTS** |
   | Region | **Same region as your SWA** |
   | Operating System | **Linux** (recommended) |
   | Hosting Plan | **Consumption (Serverless)** - free tier |

4. **Storage tab:**
   - Create new storage account or use existing
   - This is for Functions runtime (not your app data)

5. **Networking tab:**
   - Keep defaults (Enable public access: On)

6. **Monitoring tab:**
   - Enable Application Insights: **Yes** (helps debugging)

7. Click **Review + Create** → **Create**

#### Step 2: Configure Environment Variables

Once the Function App is created:

1. Go to your Function App → **Settings** → **Environment variables**

2. Click **+ Add** for each variable:

   | Name | Value | Notes |
   |------|-------|-------|
   | `AZURE_OPENAI_ENDPOINT` | `https://your-resource.openai.azure.com/` | Your Azure OpenAI endpoint |
   | `AZURE_OPENAI_KEY` | `your-key` | Azure OpenAI API key |
   | `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` (or your deployment name) | Chat model |
   | `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | `text-embedding-ada-002` | Embedding model |
   | `AZURE_TRANSLATOR_KEY` | `your-translator-key` | Azure Translator key |
   | `AZURE_TRANSLATOR_ENDPOINT` | `https://api.cognitive.microsofttranslator.com/` | Translator endpoint |
   | `AZURE_TRANSLATOR_REGION` | `eastus` (or your region) | Translator region |
   | `AZURE_STORAGE_CONNECTION_STRING` | `DefaultEndpointsProtocol=https;...` | For chat history |
   | `SUPABASE_URL` | `https://your-project.supabase.co` | Supabase URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | Supabase admin key |

3. Click **Apply** → **Confirm**

#### Step 3: Configure CORS

1. Go to Function App → **API** → **CORS**

2. Add these origins:
   ```
   https://zealous-plant-00cfa4000.4.azurestaticapps.net
   http://localhost:5173
   ```

3. Check **"Enable Access-Control-Allow-Credentials"** if needed

4. Click **Save**

#### Step 4: Get Your Function App URL

1. Go to Function App → **Overview**
2. Copy the **URL** (e.g., `https://scholarship-finder-api.azurewebsites.net`)

### Acceptance Criteria
- [ ] Function App created in Azure Portal
- [ ] All 10 environment variables configured
- [ ] CORS configured for frontend origins
- [ ] Health endpoint accessible: `https://<app>.azurewebsites.net/api/health`

---

## PI4.2: Deployment Pipeline

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| [#72](https://github.com/mskrishnakumar/Scholarship_Finder/issues/72) | Create GitHub Actions workflow for Functions | Todo | M |
| [#73](https://github.com/mskrishnakumar/Scholarship_Finder/issues/73) | Configure deployment credentials | Todo | S |

### Get Publish Profile

1. Azure Portal → Function App → **Overview** → **Get publish profile**
2. Download the `.PublishSettings` file
3. Open it and copy the entire XML content

### Add GitHub Secret

1. GitHub → Repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `AZURE_FUNCTIONS_PUBLISH_PROFILE`
4. Value: Paste the entire publish profile XML
5. Click **Add secret**

### Create Workflow File

Create `.github/workflows/azure-functions.yml`:

```yaml
name: Deploy Azure Functions

on:
  push:
    branches: [main]
    paths:
      - 'api/**'
      - '.github/workflows/azure-functions.yml'
  workflow_dispatch:  # Manual trigger

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    name: Build and Deploy Functions
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: api/package-lock.json

      - name: Install dependencies
        run: |
          cd api
          npm ci

      - name: Build TypeScript
        run: |
          cd api
          npm run build

      - name: Deploy to Azure Functions
        uses: Azure/functions-action@v1
        with:
          app-name: 'scholarship-finder-api'  # Change to your app name
          package: './api'
          publish-profile: ${{ secrets.AZURE_FUNCTIONS_PUBLISH_PROFILE }}
```

### Acceptance Criteria
- [ ] Workflow file created at `.github/workflows/azure-functions.yml`
- [ ] Publish profile secret added to GitHub
- [ ] Deployment triggers on push to `api/` folder
- [ ] Build and deploy succeeds
- [ ] All 7 functions visible in Azure Portal → Function App → Functions

---

## PI4.3: Frontend API URL Update

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| [#74](https://github.com/mskrishnakumar/Scholarship_Finder/issues/74) | Update frontend to use standalone Functions URL | Todo | S |
| [#75](https://github.com/mskrishnakumar/Scholarship_Finder/issues/75) | Test all API endpoints from frontend | Todo | M |

### Update SWA Environment Variable

1. Azure Portal → Static Web App → **Settings** → **Environment variables**

2. Add:
   | Name | Value |
   |------|-------|
   | `VITE_API_BASE_URL` | `https://scholarship-finder-api.azurewebsites.net/api` |

3. Click **Save**

4. **Trigger a redeploy** of your SWA (push a commit or manual redeploy from GitHub Actions)

### Local Development

Add to `client/.env`:
```
VITE_API_BASE_URL=http://localhost:7071/api
```

### How It Works

The frontend already supports this via `apiClient.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
```

### Test All Endpoints

| Endpoint | Method | Test Action |
|----------|--------|-------------|
| `/api/health` | GET | Open in browser |
| `/api/chat` | POST | Use chat feature as student |
| `/api/guided-flow` | POST | Use guided search |
| `/api/recommendations` | POST | View recommendations tab |
| `/api/translate` | POST | Switch language |
| `/api/scholarships` | GET | View scholarships as donor/admin |
| `/api/scholarships` | POST | Create scholarship as donor |
| `/api/scholarships/:id` | PUT | Edit scholarship |
| `/api/scholarships/:id` | DELETE | Delete scholarship |
| `/api/scholarships/:id/status` | PATCH | Approve/reject as admin |
| `/api/users` | GET | View users as admin |

### Acceptance Criteria
- [ ] SWA environment variable configured
- [ ] Frontend successfully calls standalone Functions
- [ ] All endpoints working
- [ ] Local development works with `http://localhost:7071/api`

---

## PI4.4: Data Persistence Migration

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| [#76](https://github.com/mskrishnakumar/Scholarship_Finder/issues/76) | Migrate data files to Azure Blob Storage | Todo | L |

### Problem
Standalone Azure Functions have an ephemeral filesystem. The current approach of reading/writing JSON files won't persist across function instances.

**Current files that need migration:**
- `api/data/scholarships.json` (read-only, 40+ records)
- `api/data/private-scholarships.json` (read-write, donor scholarships)
- `api/data/embeddings.json` (read-only, vector data)

### Solution: Azure Blob Storage

#### Step 1: Create Storage Container

1. Azure Portal → Storage Account (same one used by Functions)
2. **Containers** → **+ Container**
3. Name: `scholarship-data`
4. Public access level: **Private**
5. Click **Create**

#### Step 2: Upload Initial Data

1. Open the container → **Upload**
2. Upload these files from `api/data/`:
   - `scholarships.json`
   - `private-scholarships.json` (empty array: `[]`)
   - `embeddings.json`

#### Step 3: Add Blob Storage Package

```bash
cd api
npm install @azure/storage-blob
```

#### Step 4: Create Blob Storage Helper

Create `api/src/shared/blobStorage.ts`:

```typescript
import { BlobServiceClient } from '@azure/storage-blob'

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || ''
const containerName = 'scholarship-data'

async function streamToString(readable: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of readable) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf-8')
}

export async function readJsonBlob<T>(blobName: string): Promise<T> {
  const client = BlobServiceClient.fromConnectionString(connectionString)
  const container = client.getContainerClient(containerName)
  const blob = container.getBlobClient(blobName)
  const response = await blob.download()
  const text = await streamToString(response.readableStreamBody!)
  return JSON.parse(text)
}

export async function writeJsonBlob<T>(blobName: string, data: T): Promise<void> {
  const client = BlobServiceClient.fromConnectionString(connectionString)
  const container = client.getContainerClient(containerName)
  const blob = container.getBlockBlobClient(blobName)
  const content = JSON.stringify(data, null, 2)
  await blob.upload(content, content.length, {
    blobHTTPHeaders: { blobContentType: 'application/json' }
  })
}
```

#### Step 5: Update scholarshipData.ts

Replace file system operations with blob storage calls. Add in-memory caching for performance.

### Acceptance Criteria
- [ ] Blob Storage container created with initial data
- [ ] `@azure/storage-blob` added to api dependencies
- [ ] New `blobStorage.ts` helper created
- [ ] `scholarshipData.ts` updated to use Blob Storage
- [ ] Read operations work (scholarships load correctly)
- [ ] Write operations work (donor can create/edit scholarships)
- [ ] Data persists across function restarts

### Note: Can Be Deferred

This step can be done in Phase 2. Without it:
- ✅ Read operations work (data bundled in deployment)
- ❌ Write operations won't persist (donor creates temporary only)

---

## PI4.5: Cleanup & Documentation

| Issue | Title | Status | Estimate |
|-------|-------|--------|----------|
| [#77](https://github.com/mskrishnakumar/Scholarship_Finder/issues/77) | Remove SWA managed functions config | Todo | S |
| [#78](https://github.com/mskrishnakumar/Scholarship_Finder/issues/78) | Update documentation for new architecture | Todo | S |

### Remove SWA API Deployment

Edit `.github/workflows/azure-static-web-apps-zealous-plant-00cfa4000.yml`:

```yaml
# Remove or comment out these lines:
# api_location: "./api"
# api_build_command: "npm run build"
```

The SWA will now deploy frontend only. API is deployed separately via the new workflow.

### Acceptance Criteria
- [ ] SWA workflow no longer deploys API
- [ ] CLAUDE.md updated with new architecture
- [ ] README includes deployment steps
- [ ] Local dev guide documented

---

## Implementation Order

```
PI4.1 (Azure Setup) ─────────────────────────────────┐
  #69 Create Function App                            │
  #70 Configure env vars                             │ ~2 hours
  #71 Configure CORS                                 │
                                                     │
PI4.2 (Deployment Pipeline) ─────────────────────────┤
  #72 Create GitHub Actions workflow                 │ ~2 hours
  #73 Configure publish profile secret               │
                                                     │
PI4.3 (Frontend Update) ─────────────────────────────┤
  #74 Update VITE_API_BASE_URL                       │ ~2 hours
  #75 Test all endpoints                             │
                                                     │
─────────────────── Phase 1 Complete ────────────────┘
                    API IS WORKING!
                          │
                          ▼
PI4.4 (Data Persistence) ────────────────────────────┐
  #76 Migrate to Blob Storage                        │ ~6 hours
                                                     │
PI4.5 (Cleanup) ─────────────────────────────────────┤
  #77 Remove SWA API config                          │ ~2 hours
  #78 Update documentation                           │
                                                     │
─────────────────── Phase 2 Complete ────────────────┘
```

---

## Architecture After PI4

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│            Azure Static Web Apps (React + Vite)                  │
│         zealous-plant-00cfa4000.4.azurestaticapps.net           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS (VITE_API_BASE_URL)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API (Standalone)                            │
│              Azure Functions App (Node.js 20)                    │
│            scholarship-finder-api.azurewebsites.net              │
│                                                                  │
│  Functions (7):                                                  │
│  ├── health          GET  /api/health                            │
│  ├── chat            POST /api/chat                              │
│  ├── guidedFlow      POST /api/guided-flow                       │
│  ├── recommendations POST /api/recommendations                   │
│  ├── translate       POST /api/translate                         │
│  ├── scholarships    CRUD /api/scholarships/*                    │
│  └── users           GET  /api/users                             │
└───────────┬─────────────────────┬───────────────────────────────┘
            │                     │
            ▼                     ▼
┌───────────────────┐   ┌───────────────────────────────┐
│   Azure OpenAI    │   │     Azure Blob Storage        │
│  ├── GPT-4o       │   │   ├── scholarships.json       │
│  └── Embeddings   │   │   ├── private-scholarships.json│
└───────────────────┘   │   └── embeddings.json          │
                        └───────────────────────────────┘
┌───────────────────┐
│ Azure Translator  │   ┌───────────────────────────────┐
│  EN ↔ HI/TA/TE    │   │   Azure Table Storage         │
└───────────────────┘   │   └── ChatHistory table        │
                        └───────────────────────────────┘
┌───────────────────┐
│     Supabase      │
│  ├── Auth         │
│  └── User metadata│
└───────────────────┘
```

---

## Environment Variables Reference

### Azure Functions App Settings (10 variables)

| Variable | Example Value | Required |
|----------|---------------|----------|
| `AZURE_OPENAI_ENDPOINT` | `https://myopenai.openai.azure.com/` | Yes |
| `AZURE_OPENAI_KEY` | `abc123...` | Yes |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` | Yes |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | `text-embedding-ada-002` | Yes |
| `AZURE_TRANSLATOR_KEY` | `def456...` | Yes |
| `AZURE_TRANSLATOR_ENDPOINT` | `https://api.cognitive.microsofttranslator.com/` | Yes |
| `AZURE_TRANSLATOR_REGION` | `eastus` | Yes |
| `AZURE_STORAGE_CONNECTION_STRING` | `DefaultEndpointsProtocol=https;...` | Yes |
| `SUPABASE_URL` | `https://xyz.supabase.co` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Yes |

### Static Web App Settings (3 variables)

| Variable | Example Value | Required |
|----------|---------------|----------|
| `VITE_SUPABASE_URL` | `https://xyz.supabase.co` | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJ...` (anon key) | Yes |
| `VITE_API_BASE_URL` | `https://scholarship-finder-api.azurewebsites.net/api` | Yes |

---

## Local Development

### Running API Locally

```bash
cd api
npm install
npm start
# Functions available at http://localhost:7071/api/*
```

### Running Frontend Locally

```bash
cd client
npm install

# Create .env file:
echo "VITE_API_BASE_URL=http://localhost:7071/api" >> .env

npm run dev
# Frontend available at http://localhost:5173
```

### Running Both Together

Terminal 1:
```bash
cd api && npm start
```

Terminal 2:
```bash
cd client && npm run dev
```

---

## Troubleshooting

### API returns 404
- Check Function App → Functions → verify all 7 functions listed
- Check CORS configuration includes your frontend URL
- Verify `VITE_API_BASE_URL` is set correctly in SWA

### Environment variables not working
- After changing env vars, redeploy the Functions App
- Check for typos in variable names
- Verify values don't have extra quotes or spaces

### Deployment fails
- Check GitHub Actions logs for errors
- Verify publish profile secret is correct
- Ensure `api/package.json` has all dependencies

### CORS errors in browser
- Add frontend URL to CORS allowed origins
- Include `http://localhost:5173` for local dev
- Check browser console for specific CORS error message

---

## Estimates Summary

| Phase | Issues | Effort |
|-------|--------|--------|
| Phase 1 (Get API Working) | #69-#75 | ~6-8 hours |
| Phase 2 (Full Persistence) | #76-#78 | ~6-8 hours |
| **Total** | 10 issues | ~12-16 hours |

---

## Parallel Execution Plan (with PI3)

PI4 tasks can run **in parallel** with PI3 UI work since they touch different parts of the codebase.

### Wave 0: Prerequisites (Manual/Human Tasks)
These require Azure Portal access - cannot be automated:
- [ ] #69 Create Azure Functions App resource
- [ ] #70 Configure environment variables
- [ ] #71 Configure CORS

### Wave 1: Automation (parallel with PI3 Wave 1)

| Agent | Issues | Files | Notes |
|-------|--------|-------|-------|
| **Agent D** | #72 | `.github/workflows/azure-functions.yml` | Can run parallel with PI3 agents |

**Prerequisite:** #73 requires manual GitHub secret setup after #72 is created.

### Wave 4: Frontend Integration (after PI3 Waves 1-3)

| Agent | Issues | Dependencies |
|-------|--------|--------------|
| **Agent K** | #74, #75 | Frontend API URL + endpoint testing | Wave 0 complete + PI3 layout done |

### Wave 5: Cleanup (after all integration)

| Agent | Issues | Notes |
|-------|--------|-------|
| **Agent L** | #76 | Blob Storage migration (can be deferred) |
| **Agent M** | #77, #78 | SWA config cleanup + documentation |

### Combined PI3 + PI4 Timeline

```
MANUAL (Wave 0)          WAVE 1                    WAVE 4              WAVE 5
─────────────────────────────────────────────────────────────────────────────

PI4: #69,70,71 ──────────────────────────────────┬──→ #74,75 ─────────┐
(Azure Portal)                                   │                    │
       │                                         │                    ▼
       └──→ #72 (GH Actions) ──→ #73 (secret) ───┴────────────────→ #77,78
                                                                       │
                                                 PI3 Waves 1-3 ────────┘
                                                 must complete
                                                 before #74,75

PI4 #76 (Blob Storage) can run anytime after Wave 0, or be deferred
```

### Key Integration Points

| PI4 Task | Depends On | Blocks |
|----------|------------|--------|
| #72 GitHub Actions | #69 (Function App exists) | #73, #77 |
| #74 API URL update | #69-71 (Azure setup), PI3 layout | #75 testing |
| #76 Blob Storage | #69 (Function App) | Nothing (optional) |
| #77 SWA cleanup | #72 working | #78 docs |

### How to Activate

**For PI4 Wave 1 (with PI3):**
```
Run these 4 tasks in parallel:
1. PI3 #79+80: Theme + common UI
2. PI3 #47: Sidebar
3. PI3 #68: 404 page
4. PI4 #72: GitHub Actions workflow
```

**For PI4 Wave 5 (cleanup):**
```
Run cleanup tasks in parallel:
1. #77: Remove SWA API config
2. #78: Update documentation
```

---

## Quick Reference: What Goes Where

| Component | Azure Service | URL |
|-----------|---------------|-----|
| Frontend | Static Web Apps | `zealous-plant-00cfa4000.4.azurestaticapps.net` |
| API | Functions App | `scholarship-finder-api.azurewebsites.net/api/*` |
| Auth | Supabase | Your Supabase project |
| AI | Azure OpenAI | Your OpenAI resource |
| Data | Blob Storage | Same storage account as Functions |
| Chat History | Table Storage | Same storage account as Functions |
