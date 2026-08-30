# VedaAI — Answer Sheet Mapper & Evaluator

VedaAI helps a teacher map a handwritten answer sheet to its question paper, review marks with source evidence, and surface attempt-policy concerns for human review.

It is built for Indian school examinations from **Grade 1 to Grade 12**, initially covering **Physics, Chemistry, Biology, Mathematics, and Hindi**. Question papers and answers can be in English, Hindi (Devanagari), or a Hindi–English mix.

## What is in this repository today

The current build is a functional local-first product foundation:

- Exam setup for grade, subject, board, and paper language.
- Validated PDF/image upload UI with privacy and retention disclosure.
- Local IndexedDB session and image-blob persistence.
- Responsive question/answer review experience with zoom, highlighted answer regions, keyboard navigation, feedback, and editable marks.
- Subject-specific demonstration data for all five supported subjects, including Hindi.
- Next.js/OpenNext configuration for the intended Cloudflare Workers deployment.

The actual model-backed pipeline—PDF rasterisation, question and answer extraction, mapping, grading, integrity checks, and Cloudflare request guards—is specified but not yet implemented. The review screen currently uses subject-aware representative data after upload.

## Product principles

- **Teacher decides.** Flags are evidence for review, never automatic accusations or disciplinary actions.
- **Evidence before marks.** A non-zero mark must be supported by quoted answer evidence.
- **Local-first data.** Sessions and page blobs live in the browser’s IndexedDB; no server database is used.
- **Hindi is first-class.** Preserve Devanagari and Hindi–English code-switching verbatim. Do not penalise script mixing.
- **Subject notation matters.** Mathematical working, physics units, chemistry formulae, and biological diagrams are evidence, not OCR noise.

For the full product and safety requirements, read [PRD.md](PRD.md). Deployment, guard-chain, and Cloudflare design details are in [ARCHITECTURE.md](ARCHITECTURE.md).

## Stack

- Next.js 15, React 19, TypeScript
- IndexedDB via `idb` for browser-local persistence
- Cloudflare Workers through `@opennextjs/cloudflare` (deployment target)
- Planned model provider: Google Gemini through Cloudflare AI Gateway

## Prerequisites

- Node.js 20+ for the current Next.js build.
- Node.js 22+ is required by the currently installed Cloudflare Wrangler/OpenNext tooling for preview and deploy.
- npm

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npx tsc --noEmit
npm run build
```

## Using the starter

1. Choose a grade, subject, board, and paper language.
2. Upload a question paper and one answer sheet (`PDF`, `PNG`, `JPEG`, or `WebP`, up to 10 MB each).
3. Select **Start mapping**.
4. In review, choose a question to focus its mapped answer region, adjust zoom, or edit a mark.

Image uploads are stored as blobs in IndexedDB for the session. PDF rasterisation is part of the upcoming pipeline, so the current review mock is used for PDFs.

## Curriculum context

Each exam session stores the following context:

| Field | Options |
| --- | --- |
| Grade | 1–12 |
| Subject | Physics, Chemistry, Biology, Mathematics, Hindi |
| Board | CBSE, ICSE, State board, Other |
| Paper language | English, Hindi, Hindi + English |

This context will be included in extraction/grading requests and cache keys. It guides terminology and notation handling, but must never alter marking thresholds or independently produce a mark.

## Production configuration

The deployment target is Cloudflare Workers. Before deploying:

1. Use a Workers Paid plan, as required by the architecture.
2. Configure `wrangler.jsonc` with real account and origin values.
3. Set secrets only through Wrangler—never commit them:

   ```bash
   wrangler secret put GEMINI_API_KEY
   wrangler secret put SESSION_HMAC_SECRET
   wrangler secret put TURNSTILE_SECRET_KEY
   ```

4. Configure the AI Gateway spend cap, rate limits, Turnstile, Durable Object, and WAF rule described in [ARCHITECTURE.md](ARCHITECTURE.md).

`.dev.vars`, `.open-next`, and `.wrangler` are ignored by Git. Do not use `NEXT_PUBLIC_` for any secret.

## Repository layout

```text
src/
  app/                 Next.js pages and global styles
  components/          Upload and review interfaces
  client/
    db/                IndexedDB session/page adapters
    pipeline/          Current subject-aware demonstration data
    types.ts           Shared client session and exam-context contracts
PRD.md                 Product, safety, and acceptance requirements
ARCHITECTURE.md        Cloudflare and pipeline architecture
```

## Status and next steps

The next build stages are:

1. Add the guarded Cloudflare API/session path and Turnstile token minting.
2. Rasterise PDFs locally with `pdf.js` and persist each rendered page blob.
3. Implement structured question and answer extraction with Hindi/English and subject-specific schemas.
4. Add label-first mapping, constrained assignment, and accurate region refinement.
5. Implement evidence-validated grading, attempt-policy rules, teacher overrides, and integrity flags.

See the phase gates in [ARCHITECTURE.md](ARCHITECTURE.md) and the golden-set acceptance criteria in [PRD.md](PRD.md).
