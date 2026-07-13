# CineMax

Premium streaming platform for movies and web series, powered by TMDB metadata and NetMirror HLS streams.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4, Framer Motion
- **Player**: Vidstack + hls.js
- **State**: Redux Toolkit
- **Database**: MongoDB + Mongoose
- **Content**: TMDB API (metadata), NetMirror / screenscapeapi.dev (HLS streams)

## Quick Start

```bash
# Install
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your MongoDB credentials and TMDB API key

# Run dev server (port 4000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Homepage — featured & category rows
│   ├── layout.tsx            # Root layout (Header, Footer, Redux)
│   ├── movie/[slug]/         # Movie detail page
│   ├── series/[slug]/        # Series detail page
│   ├── watch/[slug]/         # Video player page
│   ├── series/watch/[slug]/  # Episode player page
│   ├── search/               # Search with filters
│   └── api/                  # Backend API routes
│       ├── proxy/            # HLS proxy with header rotation & retries
│       ├── tmdb/             # TMDB search & details
│       ├── netmirror/        # NetMirror stream resolution
│       ├── content/          # MongoDB CRUD
│       └── seed/             # Seed sample data
├── components/
│   ├── Player.tsx            # Vidstack + hls.js player with error/timeout states
│   ├── Header.tsx            # Navigation, search bar, logo
│   ├── Footer.tsx            # Site footer
│   ├── ContentCard.tsx       # Movie/series card
│   └── ContentRow.tsx        # Horizontal scrollable row
├── lib/
│   ├── db.ts                 # MongoDB connection (cached singleton)
│   ├── tmdb.ts               # TMDB API client
│   ├── netmirror.ts          # NetMirror API client
│   └── models/Content.ts     # Mongoose schema
├── store/                    # Redux store
│   ├── slices/searchSlice.ts
│   └── slices/continueSlice.ts
└── types/index.ts            # Shared TypeScript interfaces
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_USER` | MongoDB username |
| `MONGODB_PASS` | MongoDB password |
| `TMDB_API_KEY` | TMDB API v3 key |
| `ADMIN_KEY` | Shared admin auth secret |
| `SITE_URL` | Public site URL (default: `http://localhost:4000`) |
| `NETMIRROR_API_KEY` | NetMirror API key |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/content` | GET | List content (query: `type`, `category`, `search`, `limit`, `featured`) |
| `/api/content` | POST | Create content (requires `x-admin-key` header) |
| `/api/content/[id]` | GET/PUT/DELETE | Single content CRUD |
| `/api/tmdb/search` | GET | Search TMDB (query: `query`, `type`) |
| `/api/tmdb/details/[id]` | GET | TMDB details by TMDB ID |
| `/api/netmirror` | GET | Resolve NetMirror ID to HLS URL |
| `/api/proxy` | GET | Proxy HLS streams (query: `url`) |
| `/api/seed` | POST | Seed sample content |
