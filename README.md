# CineMax

Premium streaming platform for movies and series — powered by [Net27](https://net27.cc) API with proxy-signed CDN streams, quality selection, and language/dub variants.

## Features

- **Net27 API integration** — trending, discover, search, title details, embed streams
- **Multi-quality streaming** — 360p / 480p / 720p / 1080p via proxy-signed CDN URLs
- **Dub & language variants** — switch between Original, Hindi dub, English dub, etc.
- **Vidstack player** — HLS.js + native MP4 with fullscreen, keyboard shortcuts, progress tracking
- **Auto-play next episode** — 10s countdown with cancel
- **TMDB metadata** — posters, backdrops, cast, genres, ratings, trailers
- **Responsive UI** — dark theme, horizontal scroll rows, hover effects
- **HLS proxy** — UA rotation, retry logic, manifest rewriting for protected streams

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Lucide icons |
| Player | Vidstack + hls.js |
| State | Redux Toolkit |
| Database | MongoDB + Mongoose |
| API | Net27.cc (streams), TMDB v3 (metadata) |

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local (see Environment Variables below)

# Run dev server (port 4000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `TMDB_API_KEY` | Yes | TMDB v3 API key |
| `ADMIN_KEY` | Yes | Shared secret for admin API routes |
| `NETMIRROR_API_KEY` | No | NetMirror/screenscape API key |
| `SITE_URL` | No | Public URL (default: `http://localhost:4000`) |

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Homepage — hero, trending, movies, series rows
│   ├── layout.tsx                  # Root layout (Header, Footer, Redux)
│   ├── movie/[slug]/page.tsx       # Movie detail — poster, cast, genres, recommendations
│   ├── series/[slug]/page.tsx      # Series detail — seasons, episodes, cast
│   ├── watch/[slug]/page.tsx       # Movie player — quality picker, Vidstack player
│   ├── series/watch/[slug]/page.tsx # Episode player — quality/dub picker, auto-play next
│   ├── search/page.tsx             # Search with type filter (All/Movies/Series)
│   └── api/
│       ├── net27/
│       │   ├── route.ts            # Proxy: trending / hero / discover
│       │   ├── search/route.ts     # Proxy: search-hybrid
│       │   ├── embed/[tmdbId]/     # Proxy: embed + stream resolution (proxy-signed URLs)
│       │   └── variants/[type]/[tmdbId]/ # Proxy: dub/language variants
│       ├── proxy/route.ts          # HLS proxy — UA rotation, retry, manifest rewrite
│       ├── tmdb/                   # TMDB search & details
│       ├── content/                # MongoDB CRUD
│       └── seed/                   # Seed sample data
├── components/
│   ├── Player.tsx                  # Vidstack player — HLS/MP4/DASH, error/timeout, retry
│   ├── Header.tsx                  # Nav bar — logo, links, search
│   ├── Footer.tsx                  # Site footer
│   ├── ContentCard.tsx             # Poster card — quality badge, rating, hover
│   └── ContentRow.tsx              # Horizontal scrollable row with nav arrows
├── lib/
│   ├── net27.ts                    # Net27 API client + stream URL resolver
│   ├── tmdb.ts                     # TMDB API client
│   ├── netmirror.ts                # NetMirror/screenscape API (legacy)
│   ├── db.ts                       # MongoDB connection (cached singleton)
│   └── models/Content.ts           # Mongoose schema
├── store/
│   ├── store.ts                    # Redux store config
│   └── slices/
│       ├── searchSlice.ts          # Search UI state
│       └── continueSlice.ts        # Continue watching tracker
└── types/
    ├── index.ts                    # IContent, Season, Episode, SearchResult
    └── net27.ts                    # Net27Item, Net27TitleDetail, Net27EmbedResponse, etc.
```

## API Routes

### Net27 Proxies

| Route | Method | Description |
|-------|--------|-------------|
| `/api/net27?action=trending` | GET | Trending content (day) |
| `/api/net27?action=hero` | GET | Hero carousel items |
| `/api/net27?action=discover&type=movie` | GET | Discover by type/genre/sort |
| `/api/net27/search?q=query` | GET | Hybrid search |
| `/api/net27/embed/[tmdbId]?type=movie` | GET | Embed source + all quality options (proxy-signed) |
| `/api/net27/variants/[type]/[tmdbId]` | GET | Dub/language variants |

### Other

| Route | Method | Description |
|-------|--------|-------------|
| `/api/proxy?url=...` | GET | HLS proxy with UA rotation & manifest rewrite |
| `/api/content` | GET/POST | MongoDB content CRUD |
| `/api/tmdb/search` | GET | TMDB search proxy |
| `/api/tmdb/details/[id]` | GET | TMDB movie/TV details |
| `/api/seed` | POST | Seed sample content (admin) |

## Streaming Flow

```
Client → /api/net27/embed/{tmdbId}?type=movie
       → net27.cc/api/embed-tmdb/{tmdbId} (fetches raw streams)
       → resolveAllSources() (proxy-signs CDN URLs via streamhub-proxy)
       → Returns { sources: [{label, url, mimeType}], captions: [...] }

Client → Player component
       → Vidstack MediaPlayer with auto-detected MIME type
       → Supports: MP4, HLS (.m3u8), DASH (.mpd)
       → Quality picker: switch between 360p/480p/720p/1080p
       → Dub picker: switch between Original/Hindi dub/English dub/etc.
```

## License

MIT
