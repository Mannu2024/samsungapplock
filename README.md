# TextToTeachingVideo

Production-ready monorepo MVP for generating grounded teaching videos from text.

## Why Node.js + Express backend?
- Shared TypeScript contracts across web/api/worker via `packages/shared`.
- BullMQ + Redis integration is first-class for async, retries, resumable jobs.
- Easy provider modularization for TTS/translation/avatar pipelines.

## Monorepo structure
- `apps/web`: Next.js + Tailwind UI (landing, create, jobs, result)
- `apps/api`: Express API + migrations + pipeline orchestration + job enqueue
- `apps/worker`: BullMQ consumer executing generation pipeline and persisting assets/scenes
- `packages/shared`: Zod schemas, shared types, supported language constants

## Supported languages
English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu.

## Environment variables
Create `.env` at repo root:

```env
API_PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/text_to_teaching_video
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:4000
STORAGE_BASE_URL=http://localhost:9000/mock
# optional providers
OPENAI_API_KEY=
AZURE_SPEECH_KEY=
GOOGLE_CLOUD_PROJECT=
```

## Run locally (docker)
```bash
docker compose up --build
```

## Run locally (without docker)
```bash
corepack enable
pnpm install
pnpm --filter @ttv/api dev
pnpm --filter @ttv/worker dev
pnpm --filter @ttv/web dev
```

## API endpoints
- `POST /auth/login`
- `POST /projects`
- `GET /projects`
- `POST /jobs`
- `GET /jobs/:id`
- `GET /jobs/:id/result`
- `POST /jobs/:id/regenerate`

## Pipeline notes
1. Normalize/chunk input with scene cap (20 scenes)
2. Generate grounded script JSON with `sourceSpans`
3. Translate through pluggable provider interface (fidelity-preserving)
4. TTS through pluggable provider interface (mock included)
5. Slide render metadata + subtitles generation
6. Worker stores output assets and marks job done

Accuracy mode is ON by default and external facts are disabled unless explicitly enabled.

## Add new language / voices
1. Add ISO code to `supportedLanguages` in `packages/shared/src/index.ts`.
2. Add voice IDs in web create-page options and provider defaults.
3. Ensure TTS provider supports locale/voice and update provider adapter.

## Provider cost notes (approx, subject to vendor pricing)
- OpenAI TTS: billed per character/tokenized output.
- Azure Speech: billed per character/voice tier.
- Google Cloud TTS: billed per million chars with neural voice premium.
- Avatar APIs (D-ID/HeyGen): billed per render-minute/credit.

## Testing
```bash
pnpm --filter @ttv/shared test
pnpm --filter @ttv/api test
```

## Example request
```json
POST /jobs
{
  "projectId": "<uuid>",
  "settings": {
    "targetLanguage": "hi",
    "voice": "hi-teacher-1",
    "speakingSpeed": 1,
    "tone": "teacher-friendly",
    "style": "slides",
    "subtitles": true,
    "bilingualSubtitles": true,
    "quiz": true,
    "addExamples": true,
    "level": "school",
    "allowExternalReferences": false,
    "transliteration": false,
    "accuracyMode": true
  }
}
```

## Sample output
```json
{
  "jobId": "...",
  "assets": [
    { "type": "video", "url": "mock://render/output.mp4" },
    { "type": "subtitles", "url": "inline://srt/..." },
    { "type": "audio", "url": "mock://audio/abcd1234.mp3" }
  ]
}
```
