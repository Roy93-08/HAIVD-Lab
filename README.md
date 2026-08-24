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

## Technology

- React and vinext
- Cloudflare Workers
- Cloudflare D1 for site content
- Cloudflare R2 for uploaded media
- Drizzle ORM
