
<div align="center">

# Dewan

### A Multilingual Pashto Poetry Platform

A modern web application dedicated to discovering,
reading, and preserving Pashto literature.

<br/>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)

<br/>

[Explore Website](https://dewan-lovat.vercel.app) |
[Source Code](https://github.com/miksi0078/dewan)

</div>

---

## Project Overview

Dewan is a multilingual literary web application
focused on Pashto poetry and cultural content.

The project combines a modern Next.js interface
with Supabase-backed content management.

### Project Scope

- Poetry and poet collections
- Multilingual content presentation
- Poetry search and browsing
- Audio, video, and PDF media support
- Administrative content management
- User feedback functionality
- Responsive web interface

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend Services | Supabase |
| Database | PostgreSQL via Supabase |
| Deployment | Vercel |

---

## Website Preview

### Desktop Homepage

<p align="center">
  <img src="./screenshots/dewan-desktop.png"
       alt="Dewan desktop homepage"
       width="100%">
</p>

### Poetry Browsing

<p align="center">
  <img src="./screenshots/dewan-browse.png"
       alt="Dewan poetry categories and featured poet"
       width="100%">
</p>

### Poet Directory

<p align="center">
  <img src="./screenshots/dewan-poets.png"
       alt="Dewan poet directory"
       width="100%">
</p>

### Mobile Experience

<p align="center">
  <img src="./screenshots/dewan-mobile.png"
       alt="Dewan mobile homepage"
       width="40%">
</p>

---

## System Architecture

Dewan follows a modern full-stack architecture using Next.js and Supabase.

```mermaid
flowchart TD
    A[Website Visitors] --> B[Next.js Application]
    B --> C[Public Website]
    B --> D[Admin Dashboard]
    C --> E[Supabase Database]
    D --> F[Supabase Authentication]
    D --> E
    D --> G[Supabase Storage]
    C --> H[Feedback API]
    H --> E
```

### Architecture Components

| Component | Responsibility |
|---|---|
| Next.js | Application routing and server-side rendering |
| React | Reusable user interface components |
| TypeScript | Type-safe application development |
| Tailwind CSS | Responsive interface styling |
| Supabase Database | Storing poets, poetry, and other records |
| Supabase Authentication | User authentication for administrative access |
| Supabase Storage | Managing uploaded media files |
| Next.js API Routes | Server-side operations such as feedback handling |

---

## Getting Started

### Prerequisites

Before running the project locally, install:

- Node.js 20 or later
- npm
- Git
- Access to a configured Supabase project

### Installation

Clone the repository:

```bash
git clone https://github.com/miksi0078/dewan.git
```

Navigate to the project:

```bash
cd dewan
```

Install the dependencies:

```bash
npm ci
```

### Environment Configuration

Create a `.env.local` file in the project's root directory.

Configure the environment variables:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_PRIVATE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The Supabase database schema is located in
`supabase/schema.sql`.

Apply the schema to your own Supabase project before running the application.

**Security:** Never commit `.env.local`, private API keys, or service-role credentials to GitHub.

### Start Development Server

```bash
npm run dev
```

Open:

http://localhost:3000

### Production Build

```bash
npm run build
```

To start the production server locally:

```bash
npm start
```

---

## Repository Structure

```text
dewan/
├── src/
│   ├── app/
│   │   ├── (site)/
│   │   ├── admin/
│   │   ├── api/
│   │   └── auth/
│   ├── components/
│   ├── lib/
│   └── middleware.ts
├── supabase/
│   ├── schema.sql
│   └── seed_optional.sql
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Project Status

Dewan is an academic and personal web development project.

The repository documents the application's implementation and development. Individual deployment features should be tested before production use.

## Developer

**Muhammad Ilyas**

BS Artificial Intelligence  
University of Central Punjab, Lahore

[GitHub Profile](https://github.com/miksi0078)
```

