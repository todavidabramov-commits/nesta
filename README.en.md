# NESTA — residential real estate in Amsterdam

**NESTA** platform on Payload 3 + Next.js 16: property catalog, smart matching, customer cabinet, CMS with RU/EN localization and Live Preview.

Design: [Figma](https://www.figma.com/design/p9mgvNBdfGlU7dB3XjaVt2/nesta_promo)

> [Русская версия](./README.md)

## Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| CMS | Payload 3.89, Lexical, RU/EN admin UI + content localization, Live Preview |
| Data | Vercel Postgres / Neon (Docker locally) |
| Files | Vercel Blob (production), disk locally |
| Validation | Zod |
| Toasts | Sonner |

## Features

### Public site

- **Home** — hero, search, curated property picks
- **Buy / Rent** — catalog with filters, map, and compare
- **Property detail** — gallery, description, agent, favorites, book a viewing
- **Compare** — several listings side by side
- **Neighborhoods** — directory and detail guides with accordions and stats
- **Smart matching** — preference wizard (intent, priorities, budget, bedrooms) and ranked matches
- **Agents** — advisor profile, listings, inquire form
- **Localization** RU / EN across the frontend

### Customer account

- Register and sign-in (separate `customers` collection, no CMS admin access)
- Cabinet (`/dashboard`): overview, profile (photo, name, password change)
- **Favorites** — heart on cards, list at `/favorites`
- **Viewings** — book a slot, request list at `/viewings`
- **Messages** — admin-only outbound; read / unread state
- **Saved searches** — persist smart-matching criteria (signed-in users only)

### Payload admin

- Manage properties, neighborhoods, agents, pages, media
- Customers and their favorites / saved searches
- Customer messages
- Viewing requests
- Header / Footer / Site settings
- Live Preview, admin UI language and content locale switchers

## Local setup

Requires Node.js 20+ and Docker:

```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

In another terminal (after first start, once the schema exists):

```bash
npm run seed -- --force
```

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin  

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and start |
| `npm run seed` | Seed (if empty) |
| `npm run seed -- --force` | Overwrite seed |
| `npm run generate:types` | Payload types |
| `npm run generate:importmap` | Admin import map |
| `npm run lint` | ESLint |

## Routes

| Path | Content |
| --- | --- |
| `/` | Home |
| `/buy`, `/rent` | Buy / rent catalog |
| `/properties/[slug]` | Property detail |
| `/compare` | Compare listings |
| `/neighborhoods`, `/neighborhoods/[slug]` | Neighborhoods |
| `/matching` | Smart matching |
| `/agents/[slug]` | Agent page |
| `/sign-in`, `/register` | Sign-in and registration |
| `/dashboard` | Cabinet (overview, messages, profile, saved searches) |
| `/favorites` | Favorites |
| `/viewings`, `/viewings/book` | Viewings and booking |
| `/admin` | Payload admin |

## CMS collections (main)

| Collection | Purpose |
| --- | --- |
| `properties` | Listings |
| `neighborhoods` | Neighborhoods |
| `agents` | Agents |
| `customers` | Site customers (auth) |
| `customer-messages` | Messages to customers (admin create only) |
| `viewing-requests` | Viewing requests |
| `media`, `pages`, `users` | Media, pages, admins |

Globals: `header`, `footer`, `site-settings`.
