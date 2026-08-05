# ⚡ AETH-1 - Advanced Enterprise Technology Hub

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

**From Binary Loops to Global White Papers**

[🚀 Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/aeth-1/future-insights-platform) •
[📖 Documentation](#documentation) •
[🔗 Live Demo](#live-preview)

</div>

---

## 🌟 Overview

AETH-1 is a **revolutionary scientific data platform** that transforms raw binary streams from global sources (satellites, particle accelerators, climate sensors) into actionable intelligence, peer-reviewed white papers, and collaborative discovery tools.

### Vision

> *"To create an interconnected ecosystem where every byte of scientific data flows seamlessly into the hands of curious minds, enabling anyone with technical skill to extract meaning, publish insights, and advance human understanding."*

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm**, **yarn**, or **pnpm**
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/aeth-1/future-insights-platform.git
cd future-insights-platform

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### One-Click Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aeth-1/future-insights-platform)

---

## 📱 Application Previews

The platform includes **5 fully functional preview pages**:

| Route | Description | Features |
|-------|-------------|----------|
| `/` | Main Router | Navigation hub to all previews |
| `/preview1` | Landing Page | Hero, features, CTAs, animations |
| `/preview2` | API Dashboard | Crypto, quotes, facts connectors |
| `/preview3` | Components | UI library showcase |
| `/preview4` | **Studio IDE** | Full IDE with embedded preview |
| `/preview5` | Full Demo | Complete application overview |

### ★ Preview 4: Studio IDE (Featured)

The **Studio IDE** is the centerpiece - a complete development environment showing:

```
┌─────────────────────────────────────────────────────┐
│  EXPLORER  │  CODE EDITOR        │  LIVE PREVIEW    │
│            │                     │                  │
│  📁 src/   │  1 'use client';   │  ⚡ AETH-1 App  │
│  📄 page   │  2 import React     │                 │
│  📄 layout │  3 export function │  [181 PB] Storage│
│  📁 api/   │  4  StudioIDE() {  │  [47K+] Users    │
│            │  5   return (       │  [3.8K] Papers   │
│            │  6     <IDE>        │                 │
│            │  7   )              │  ✓ Connected     │
│            │  8 }                │                 │
├─────────────────────────────────────────────────────┤
│  $ aeth-1 build... ✓ Ready in 633ms               │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **UI Library** | React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **State** | Zustand, React Query |
| **Database** | Prisma ORM + PostgreSQL |
| **Auth** | NextAuth.js + JWT |
| **API** | RESTful routes with middleware |

### Backend Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── users/         # User management
│   │   ├── papers/        # White paper publishing
│   │   ├── data/          # Data connectors
│   │   ├── storage/       # Blob storage management
│   │   └── status/        # System health monitoring
│   └── [previews]/        # Frontend pages
├── middleware/
│   ├── auth.ts            # JWT authentication
│   ├── api.ts             # API middleware (CORS, rate limiting)
│   └── error-handler.ts   # Error handling utilities
├── lib/
│   ├── database.ts        # Prisma client & helpers
│   └── utils.ts           # Utility functions
└── components/            # React UI components
```

### Middleware Stack

```
Request → CORS → Rate Limit → Auth → Validation → Handler → Response
                                    ↓
                              Logging → Metrics
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/register` | Register new user (admin) |
| DELETE | `/api/auth/logout` | Invalidate session |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (paginated) |
| POST | `/api/users` | Create user (admin) |

### White Papers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/papers` | List papers with filters |
| POST | `/api/papers` | Create new paper |

### Data Connectors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data/connectors` | List all connectors |
| POST | `/api/data/connectors/:id/start` | Start connector |

### Storage
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/storage` | List containers & status |
| POST | `/api/storage/container` | Create container |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | System health check |

---

## 🛰️ Data Sources Integration

### Supported Connectors

| Source Type | Protocol | Format | Status |
|-------------|----------|--------|--------|
| Earth Observation Satellites | CCSDS | HDF5, GeoTIFF | ✅ Active |
| LHC / Particle Accelerators | ROOT | ROOT, HDF5 | ✅ Active |
| Climate Sensor Networks | HTTP | NetCDF, GRIB2 | ✅ Syncing |
| Genomic Sequencing | FTP | FASTQ, BAM | ⏸️ Maintenance |
| Financial Feeds | WebSocket | JSON | ✅ Active |

### Blob Storage Tiers

| Tier | Use Case | Latency | Cost |
|------|----------|--------|------|
| Hot (Real-time) | Active satellite feeds | <1ms | $$$ |
| Hot (Active) | Current experiments | <10ms | $$ |
| Warm (Recent) | Analysis datasets | <100ms | $ |
| Cold (Archive) | Published results | Minutes | ¢ |
| Deep Freeze | Long-term backup | Hours | ¢¢ |

---

## 📝 White Paper Publishing Pipeline

```
Data Selection → Parsing & Transformation → Analysis & Insight Discovery
                                                    ↓
Drafting → Peer Review → DOI Assignment → Global Distribution
```

### Templates Available

- `WP-SAT-001`: Satellite Image Analysis
- `WP-HPP-001`: High Energy Physics Findings
- `WP-CLIM-001`: Climate Pattern Discovery
- `WP-CROSS-001`: Cross-Domain Correlation
- `WP-METHOD-001`: Novel Methodology
- And more...

---

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm start           # Start production server

# Database
npm run db:push      # Push schema changes
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations

# Linting
npm run lint         # Run ESLint
```

### Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/aeth1"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# External Services
ORCID_CLIENT_ID="your-orcid-id"
DOI_API_KEY="your-doi-key"

# Storage (optional - for blob storage)
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
S3_BUCKET="aeth1-blob-storage"
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository at [vercel.com/new](https://vercel.com/new)
3. Configure environment variables
4. Deploy!

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Manual Deployment

```bash
npm run build
npm start  # Runs on port 3000
```

---

## 📊 Project Statistics

- **Framework**: Next.js 16 with Turbopack
- **Pages**: 5 preview pages + main router
- **API Routes**: 15+ endpoints
- **Components**: 50+ UI components
- **Middleware**: Auth, rate limiting, CORS, error handling
- **Lines of Code**: ~25,000+
- **Test Coverage**: Coming soon

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **CERN** for open LHC data
- **NASA** for satellite imagery APIs
- **Next.js Team** for the amazing framework
- **shadcn/ui** for beautiful components
- **Vercel** for hosting and deployment tools

---

## 📞 Support

- **Documentation**: [docs.aeth-1.science](https://docs.aeth-1.science) (coming soon)
- **Issues**: [GitHub Issues](https://github.com/aeth-1/future-insights-platform/issues)
- **Discord**: [Join Community](https://discord.gg/aeth1) (coming soon)
- **Email**: support@aeth-1.science

---

<div align="center">

**⚡ AETH-1 - Transforming Data Into Discovery**

*Built with ❤️ for the global scientific community*

</div>
