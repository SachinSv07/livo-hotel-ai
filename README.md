# LIVO — AI-Powered Hotel Concierge & Operations Platform

LIVO is an AI-powered hotel concierge and operations platform designed to connect guests with hotel services and help hotel teams coordinate service requests through a unified workspace.

Guests can interact with a room-specific digital concierge through voice or text, while hotel staff can use the operations dashboard to review requests and coordinate day-to-day service workflows.

## Product Overview

Hotel guests often need to contact different departments for housekeeping, maintenance, room service, and general assistance. These requests can arrive through disconnected channels, making it difficult for staff to track progress and maintain a consistent guest experience.

LIVO brings guest communication and hotel operations into one workflow:

1. A guest opens the concierge for their room.
2. The guest communicates a request through voice or text.
3. The request is handled by the configured AI and application workflow.
4. The request is made available to the relevant hotel operations workflow.
5. Staff review and update the request as it progresses.

The application contains two primary experiences.

### Guest Concierge

- Room-specific guest interface accessible through a URL such as `/guest/403`.
- Voice interaction powered by the ElevenLabs Conversational AI client.
- Text-based conversation interface.
- Room context passed to the voice agent through dynamic variables.
- Quick actions for common hotel needs, including housekeeping, maintenance, room service, and hotel information.
- Mobile-oriented interface designed for guests using their own devices.

### Staff Operations Dashboard

- Centralized workspace for hotel operations.
- Guest request views and department-oriented workflows.
- Task management and request status interfaces.
- Role-aware navigation and staff-oriented views.
- Guest conversation and operational information views.
- Additional dashboard areas for analytics, knowledge, messaging, receptionist workflows, sales workflows, and settings.
- Supabase-backed request and conversation functionality where configured.

> **Implementation note:** The repository contains both connected application workflows and interface modules that currently use local or demonstration data. The presence of a dashboard screen does not necessarily mean that the screen is backed by a production service.

## Key Capabilities

| Capability | Description |
| --- | --- |
| Guest communication | Guests can interact with the concierge through voice or text. |
| Room context | The guest experience receives a room identifier from its route and can pass room context to the voice agent. |
| Service requests | Supported request workflows use Supabase to store and retrieve request records. |
| Staff coordination | Staff-facing views provide interfaces for reviewing requests and coordinating operational work. |
| Conversation records | The application includes Supabase integration for supported guest conversation data. |
| Separate guest build | The guest experience can be built independently from the full staff application. |

## Application Architecture

LIVO is implemented as a React application with separate entry points for the full staff application and the guest-only experience.

```text
                           LIVO
                            |
               +------------+------------+
               |                         |
         Guest Concierge           Staff Dashboard
          /guest/:room                    |
               |                  Operations workspace
          React + Vite                     |
               |                 +--------+---------+
        Voice / Text UI           |        |         |
               |               Requests  Tasks   Other views
        ElevenLabs client          |        |
               |                  +--------+
               |                      |
               +----------------------+
                                      |
                                   Supabase
                           Requests & Conversations
                                      |
                              Realtime updates
```

### Main Components

| Component | Responsibility |
| --- | --- |
| Guest Concierge | Room-specific interface for guest voice and text interactions. |
| ElevenLabs Conversational AI | Provides the voice conversation client and receives configured room context. |
| Staff Dashboard | Provides staff-facing operational and management interfaces. |
| Supabase | Provides database and realtime functionality for supported request and conversation workflows. |
| Google GenAI SDK | Supports AI-related functionality where configured in the application. |

The guest experience has its own application entry point and build target. This allows the guest interface to be deployed separately from the full staff dashboard.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript |
| Build tooling | Vite, npm |
| Styling | Tailwind CSS 4, custom CSS |
| UI and animation | Lucide React, Motion |
| Voice AI | ElevenLabs Conversational AI (`@elevenlabs/client`) |
| Backend services | Supabase |
| Database | PostgreSQL (through Supabase) |
| AI integration | Google GenAI SDK |
| Data visualization | Recharts |

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- A Supabase project for database-backed features
- An ElevenLabs agent for guest voice conversations

### 1. Clone the repository

```bash
git clone https://github.com/SachinSv07/livo-hotel-ai.git
cd livo-hotel-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file from the example.

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux**

```bash
cp .env.example .env
```

Configure the variables required by the features you intend to run:

| Variable | Purpose |
| --- | --- |
| `VITE_ELEVENLABS_AGENT_ID` | ElevenLabs agent identifier used by the guest voice client. |
| `VITE_SUPABASE_URL` | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Supabase client key used by the frontend. |
| `GEMINI_API_KEY` | Gemini API credential for the integration where configured. |
| `APP_URL` | Application URL used by the relevant runtime configuration. |

**Credential handling**

- Only expose values intended for browser use through `VITE_*` variables.
- Do not commit `.env` files or private credentials.
- Never put a Gemini secret, Supabase service-role key, or private provider API key in client-side code.
- Keep server-side secrets in a trusted backend or the relevant provider's secure environment configuration.

### 4. Start the development server

```bash
npm run dev
```

Open the application at the local URL printed by Vite. The configured development server uses port `3000`.

- Staff application: `http://localhost:3000/`
- Guest concierge example: `http://localhost:3000/guest/403`

Replace `403` with the room identifier you want to use for local testing.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Builds the full application. |
| `npm run build:guest` | Builds the guest-only application. |
| `npm run preview` | Previews a production build locally. |
| `npm run lint` | Runs the configured TypeScript validation command. |

## Supabase Configuration

The repository includes SQL scripts for the database structures used by supported application workflows.

1. Create a Supabase project.
2. Open the project's SQL Editor.
3. Review and execute the SQL files in the `supabase/` directory in the required dependency order:
   - `requests.sql` — request table setup and related configuration.
   - `guest_conversations.sql` — guest conversation records.
   - `staff.sql` — staff profile-related structures.
   - `role_rls.sql` — role-oriented row-level security configuration; review its dependencies before applying.
4. Add the project URL and client key to your local environment.
5. Configure and verify Supabase Authentication, database permissions, and Realtime for the workflows you plan to use.

Review every SQL policy before connecting real guest or employee data. Apply least-privilege access and verify that users can access only the records permitted by their role.

## Guest-Only Build and Deployment

The guest concierge can be built independently:

```bash
npm run build:guest
```

The build output is written to `dist-guest/`.

Deploy that directory to a static hosting provider that supports the required route handling. Guest URLs such as `/guest/403` must resolve to the guest application entry point. The repository includes a Vercel rewrite configuration under `public/`.

Use HTTPS in deployed environments. Browser microphone access requires a secure context, except for local development.

## Repository Structure

```text
livo-hotel-ai/
├── public/
│   ├── assets/                 Static assets
│   └── vercel.json             Guest route rewrite configuration
├── scripts/
│   └── prepare-guest-dist.mjs  Guest build output preparation
├── src/
│   ├── components/
│   │   ├── analytics/          Analytics views
│   │   ├── common/             Shared dashboard components
│   │   ├── dashboard/          Operations overview
│   │   ├── guest/              Guest concierge interface
│   │   ├── knowledge/          Hotel knowledge views
│   │   ├── lancepad/            Staff operations workspace
│   │   ├── landing/             Landing and login views
│   │   ├── messages/            Messaging views
│   │   ├── pipeline/            Pipeline views
│   │   ├── receptionist/        Receptionist AI views
│   │   ├── requests/             Guest request management
│   │   ├── sales/                Sales views
│   │   ├── settings/             Application settings
│   │   └── tasks/                Task management
│   ├── config/                  Role and permission configuration
│   ├── context/                 Shared application state
│   ├── data/                    Initial and demonstration data
│   ├── hooks/                   Reusable React hooks
│   ├── services/                AI, authentication, Supabase and domain services
│   ├── types/                   Shared TypeScript types
│   ├── App.tsx                  Main application route boundary
│   ├── guest-main.tsx           Guest-only application entry point
│   └── main.tsx                 Full application entry point
├── supabase/                    Database schemas and policies
├── .env.example                 Environment variable template
├── guest.html                   Guest build HTML entry
├── index.html                   Main application HTML entry
├── package.json
└── vite.config.ts
```

## Configuration and Integration Notes

### Voice agent

The guest voice experience uses the ElevenLabs client and the agent identifier configured through `VITE_ELEVENLABS_AGENT_ID`. The agent must be configured in the ElevenLabs workspace with the appropriate conversation instructions, dynamic variables, and any tools required by the intended workflow.

A frontend connection to a voice agent does not, by itself, guarantee that a guest request is persisted or routed to a staff member. Verify the agent's tool configuration and the corresponding backend handler before enabling request actions.

### Room context

The guest route uses a room identifier, for example `/guest/403`. Treat this value as application context, not as proof that the person using the link is an authorized occupant of that room.

For a real deployment, use a secure guest-session or signed-token mechanism and validate room access on the server.

### Dashboard data

Some dashboard modules currently use local state or demonstration data. Confirm the persistence and backend integration of each module before relying on it for hotel operations.

## Security and Production Considerations

Before deploying LIVO in a live hotel environment:

- Review and harden all Supabase Row Level Security policies.
- Replace permissive development policies with least-privilege policies.
- Do not treat a room number in a URL as an authentication credential.
- Keep private API keys and service-role credentials out of the browser bundle.
- Verify the complete voice-agent-to-backend request workflow.
- Add server-side validation for room identity, request fields, and staff permissions.
- Test authentication, authorization, error handling, and data isolation.
- Add automated tests and operational monitoring for critical request workflows.
- Review privacy, retention, and consent requirements for guest voice and conversation data.

These are deployment requirements, not claims that every item is already implemented.

## Contributors

- Sachin S V
- Dharshan 
---

LIVO — Connecting guest experiences with hotel operations.
