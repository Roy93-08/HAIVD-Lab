# HAIDE Lab Website

Official website and content management system for the **Human-Computer Interaction and Design Engineering Laboratory (HAIDE Lab)**.

## Version 1.0

**Release date:** August 24, 2026

Version 1.0 establishes the laboratory's first complete public website and its supporting content management workflow. It provides a concise English-language introduction to the lab, recent news, ongoing and completed research projects, and contact information.

### Included in Version 1.0

- A narrow, editorial-style public website designed for an academic research group
- Laboratory introduction with an editable hero image, headline, and description
- News displayed automatically from newest to oldest, with the latest four items shown on the homepage
- Four-column project cards with detailed project dialogs, status, researchers, profile images, and publication links
- A dedicated contact page
- An administrative interface for creating, editing, saving, and safely deleting news and projects
- Image uploads and editable site content backed by Cloudflare D1 and R2 storage
- Responsive safeguards for smaller screens while preserving the desktop-oriented narrow layout

## Local Development

Requirements: Node.js `>=22.13.0`

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the website. The content management interface is available at `/admin`.

## Verification

```bash
npm test
```

This builds the application and runs the automated rendering and content-system checks.

## Administrator Access

The public site and content management system share one domain. The administration interface is available at `/admin` and is intended to sit behind Cloudflare Access.

- Set `ADMIN_EMAIL` in the Cloudflare Worker environment; do not commit administrator credentials.
- Create Cloudflare Access policies for `/admin*`, `/api/upload`, and `/api/content`, allowing only the administrator email.
- Keep `/api/media/*` public so uploaded images remain visible on the website.
- Disable the public `workers.dev` route, or protect it with the same Access policy, so it cannot bypass the custom-domain policy.
- Local administration is allowed only on a localhost address while Vite is running in development mode.

## Technology

- React and vinext
- Cloudflare Workers
- Cloudflare D1 for site content
- Cloudflare R2 for uploaded media
- Drizzle ORM

## Production

- Public site: `https://haidelab.org`
- Administrator: `https://haidelab.org/admin`
- Cloudflare Worker: `haide-lab`
- D1 database: `haide-lab-db`
- R2 media bucket: `haide-lab-media`
