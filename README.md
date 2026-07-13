<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Net27-API-brightgreen?style=for-the-badge" alt="Net27">
  <img src="https://img.shields.io/badge/Player-Vidstack-EA2845?style=for-the-badge" alt="Vidstack">
</p>

<h1 align="center">
  <br>
  🎬 CineMax
  <br>
</h1>

<p align="center">
  <b>Premium streaming platform for movies & series</b><br>
  <sub>Powered by Net27 API · Proxy-signed CDN streams · Multi-quality · Dub variants · Vidstack player</sub>
</p>

<p align="center">
  <a href="https://github.com/bunny123373/cinemax">
    <img src="https://img.shields.io/github/stars/bunny123373/cinemax?style=social" alt="Stars">
  </a>
  <a href="https://github.com/bunny123373/cinemax/fork">
    <img src="https://img.shields.io/github/forks/bunny123373/cinemax?style=social" alt="Forks">
  </a>
  <img src="https://img.shields.io/github/license/bunny123373/cinemax" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome">
</p>

---

## ✨ Features

<table>
  <tr>
    <td>

**🔍 Smart Search**
Hybrid search across movies & series with type filters

    </td>
    <td>

**📺 Multi-Quality**
360p / 480p / 720p / 1080p with quality picker

    </td>
  </tr>
  <tr>
    <td>

**🌍 Dub & Languages**
Original, Hindi dub, English dub, French, Spanish & more

    </td>
    <td>

**🎬 Premium Player**
Vidstack + HLS.js · Fullscreen · Keyboard shortcuts · Progress tracking

    </td>
  </tr>
  <tr>
    <td>

**⏭️ Auto-Play Next**
10s countdown to next episode with cancel

    </td>
    <td>

**📊 TMDB Metadata**
Posters, backdrops, cast, genres, ratings, trailers

    </td>
  </tr>
  <tr>
    <td>

**🌙 Dark Theme**
Premium dark UI with gold accents

    </td>
    <td>

**🔄 HLS Proxy**
UA rotation · Retry logic · Manifest rewriting

    </td>
  </tr>
</table>

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/bunny123373/cinemax.git
cd cinemax

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Start dev server
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technology | Purpose |
|:--------:|:----------:|:--------|
| 🖥️ | **Next.js 16** | App Router + Turbopack |
| ⚛️ | **React 19** | UI components |
| 🎨 | **Tailwind CSS 4** | Utility-first styling |
| 📝 | **TypeScript 5** | Type safety |
| 🎬 | **Vidstack** | Video player + HLS.js |
| 📊 | **Redux Toolkit** | State management |
| 🗄️ | **MongoDB** | Database |
| 🔗 | **Net27 API** | Streaming sources |
| 🎭 | **TMDB v3** | Movie/TV metadata |

</div>

---

## 📁 Architecture

```
src/
├── app/
│   ├── page.tsx                      # 🏠 Homepage — hero banner, trending, movies, series
│   ├── layout.tsx                    # 📐 Root layout
│   ├── movie/[slug]/page.tsx         # 🎬 Movie detail — poster, cast, genres
│   ├── series/[slug]/page.tsx        # 📺 Series detail — seasons, episodes
│   ├── watch/[slug]/page.tsx         # ▶️ Movie player — quality picker
│   ├── series/watch/[slug]/page.tsx  # ⏭️ Episode player — dub/quality, auto-play
│   ├── search/page.tsx               # 🔍 Search with filters
│   └── api/
│       ├── net27/                    # 🔗 Net27 API proxies
│       ├── proxy/route.ts            # 🔄 HLS proxy
│       ├── tmdb/                     # 🎭 TMDB proxy
│       └── content/                  # 🗄️ MongoDB CRUD
├── components/
│   ├── Player.tsx                    # 🎬 Vidstack player component
│   ├── Header.tsx                    # 📌 Navigation bar
│   ├── Footer.tsx                    # 📎 Site footer
│   ├── ContentCard.tsx               # 🃏 Poster card
│   └── ContentRow.tsx                # 📜 Horizontal scroll row
├── lib/
│   ├── net27.ts                      # 🔗 Net27 API client
│   ├── tmdb.ts                       # 🎭 TMDB API client
│   └── db.ts                         # 🗄️ MongoDB connection
├── store/                            # 📊 Redux store
└── types/                            # 📝 TypeScript types
```

---

## 🔌 API Endpoints

### Net27 Proxies

| Endpoint | Description |
|----------|-------------|
| `GET /api/net27?action=trending` | Trending content |
| `GET /api/net27?action=hero` | Hero carousel |
| `GET /api/net27?action=discover&type=movie` | Discover by type |
| `GET /api/net27/search?q=query` | Hybrid search |
| `GET /api/net27/embed/[tmdbId]?type=movie` | Embed + quality options |
| `GET /api/net27/variants/[type]/[tmdbId]` | Dub/language variants |

### Other

| Endpoint | Description |
|----------|-------------|
| `GET /api/proxy?url=...` | HLS proxy with UA rotation |
| `GET /api/content` | List content |
| `POST /api/content` | Create content (admin) |
| `GET /api/tmdb/search` | TMDB search |
| `GET /api/tmdb/details/[id]` | TMDB details |

---

## 🎬 Streaming Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────────────┐
│  Client  │────▶│ /api/net27  │────▶│   net27.cc API   │
│          │     │  /embed/    │     │  /api/embed-tmdb │
└─────────┘     └─────────────┘     └──────────────────┘
     │                │                        │
     │                │    ┌───────────────────┘
     │                │    │
     │                ▼    ▼
     │         ┌──────────────────┐
     │         │  resolveAllSources()  │
     │         │  Proxy-sign CDN URLs  │
     │         └──────────────────┘
     │                │
     │                ▼
     │    ┌───────────────────────────┐
     │    │  streamhub-proxy           │
     │    │  ?url={cdn_url}            │
     │    │  &exp={timestamp}          │
     │    │  &sig={signature}          │
     │    └───────────────────────────┘
     │                │
     ▼                ▼
┌─────────────────────────────┐
│       Vidstack Player       │
│  ┌─────┬─────┬─────┬─────┐  │
│  │360p │480p │720p │1080p│  │
│  └─────┴─────┴─────┴─────┘  │
│  ┌─────────────────────────┐│
│  │ Original │ Hindi │ English││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `TMDB_API_KEY` | ✅ | TMDB v3 API key |
| `ADMIN_KEY` | ✅ | Admin authentication secret |
| `NETMIRROR_API_KEY` | ❌ | NetMirror/screenscape API key |
| `SITE_URL` | ❌ | Public URL (default: `http://localhost:4000`) |

---

## 📦 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bunny123373/cinemax)

### Docker

```bash
docker build -t cinemax .
docker run -p 4000:4000 cinemax
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a PR.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [bunny123373](https://github.com/bunny123373)**

If this project helps you, consider giving it a ⭐

</div>
