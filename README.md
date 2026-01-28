# Repo Atlas SaaS

GitHub repository scanner and mapper — now as a SaaS web app.

Ported from the [Electron desktop app](https://github.com/CryptoJym/repo-atlas) to Next.js with GitHub API integration, Clerk auth, and subscription billing.

## Features

- **GitHub OAuth Login** — Sign in with GitHub via Clerk
- **Repository Scanning** — Scan all your GitHub repos (personal + org) via API
- **Health Scoring** — Automated health grades (A-F) based on activity, docs, community signals
- **Activity Tracking** — Active/moderate/stale/dormant classification
- **Language Analysis** — Full language breakdown per repo and across portfolio
- **Detailed Analysis** — Per-repo deep dive: branches, commits, contributors, languages
- **Subscription Billing** — Clerk Billing with Free, Developer ($15/mo), Team ($49/mo) plans
- **Dark Mode** — Built-in dark theme

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Auth**: Clerk (GitHub OAuth, no orgs)
- **Billing**: Clerk Billing (Stripe-powered)
- **GitHub API**: Octokit REST
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/CryptoJym/repo-atlas-saas.git
cd repo-atlas-saas
npm install
```

### 2. Set up Clerk

1. Create a new application at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Enable **GitHub** as a social connection (OAuth)
3. Copy your publishable key and secret key
4. **Disable Organizations** in Clerk Dashboard → Settings → Organizations

### 3. Set up Billing Plans (in Clerk Dashboard)

1. Go to **Billing** → **Subscription Plans**
2. Create plans:
   - **Free**: $0/mo — 10 repo scans, public repos only
   - **Developer**: $15/mo — Unlimited scans, private repos, advanced analysis, export reports
   - **Team**: $49/mo — Everything in Dev + org scanning, team reports, API access, priority support
3. Connect your Stripe account

### 4. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Clerk keys
```

### 5. Run

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── pricing/page.tsx            # Pricing with Clerk PricingTable
│   ├── sign-in/[[...sign-in]]/     # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/     # Clerk sign-up
│   ├── dashboard/
│   │   ├── page.tsx                # Overview dashboard
│   │   ├── repos/page.tsx          # Repository list + filters
│   │   └── analysis/page.tsx       # Per-repo analysis
│   └── api/
│       ├── scan/route.ts           # POST: scan user/org repos
│       └── analyze/route.ts        # POST: deep analyze single repo
├── components/
│   ├── dashboard-overview.tsx      # Stats, health distribution, activity
│   ├── repo-list.tsx               # Filterable, sortable repo list
│   └── analysis-dashboard.tsx      # Detailed repo analysis view
├── lib/
│   ├── github-scanner.ts           # Core scanner (ported from Electron)
│   └── github.ts                   # Clerk OAuth → GitHub token helper
└── middleware.ts                    # Clerk auth middleware
```

## Ported From

The scanner logic was ported from `~/repo-atlas/scanner.js` (Electron app):
- **Original**: Scans local filesystem for `.git` directories, runs `git` CLI commands
- **SaaS**: Scans GitHub API for repos, uses Octokit REST for all metadata
- **Same concepts**: Health scoring, activity levels, repo enrichment

## License

ISC — Utlyze
