# LIVO Project Guide

LIVO is a React and Vite hotel operations platform with two user experiences:

1. A staff/admin operations dashboard.
2. A mobile-first guest concierge opened from a room QR code.

The guest experience is implemented in the same repository but has its own build entry and deployment output. The staff dashboard is not imported by the guest-only build.

## Technology

- React 19 with TypeScript
- Vite
- Tailwind CSS v4 through `@tailwindcss/vite`
- `lucide-react` for icons
- `motion` is installed for animation support
- ElevenLabs Conversational AI through `@elevenlabs/client`
- Supabase for requests and conversation data
- Recharts for dashboard analytics
- Gemini integration for staff-side AI workflows
- LocalStorage for staff dashboard mock state and persistence

## Run Locally

From the repository root:

```powershell
npm install
npm run dev
```

The development server runs on port `3000`.

Useful URLs:

```text
http://localhost:3000/
http://localhost:3000/guest/403
```

The room identifier is read from the guest URL. For example, `/guest/403` displays `Room 403`.

## Commands

```powershell
npm run dev          # Start Vite development server
npm run lint         # Run TypeScript without emitting files
npm run build        # Build the complete staff/dashboard application
npm run build:guest  # Build only the guest deployment into dist-guest
npm run preview      # Preview a generated Vite build
```

## Application Entry Points

### Complete application

- `index.html` is the normal Vite HTML entry.
- `src/main.tsx` mounts `src/App.tsx`.
- `src/App.tsx` checks the pathname first. A path beginning with `/guest/` renders the guest concierge without the staff provider or dashboard shell. Other paths render the staff application.

### Guest-only application

- `guest.html` is the guest-only HTML entry.
- `src/guest-main.tsx` mounts `GuestConcierge` directly.
- `vite.config.ts` uses `--mode guest` to output to `dist-guest`.
- `scripts/prepare-guest-dist.mjs` renames the generated `guest.html` to `index.html` for static hosting.
- `public/vercel.json` rewrites `/guest/<room>` to `/index.html`.

The guest-only entry imports the guest page, the voice hook, shared CSS, and their dependencies. It does not import `AppProvider`, `Sidebar`, `Header`, or staff dashboard views.

## Staff Dashboard Architecture

The staff application is wrapped in `AppProvider` from `src/context/AppContext.tsx`.

`AppContext` owns:

- Current tab and role navigation
- Login state and selected language
- Staff, guests, requests, tasks, opportunities, messages, knowledge, notifications, and AI logs
- Toasts and global modal state
- Task transitions and request updates
- Staff-side AI prompt execution
- LocalStorage persistence
- Supabase request synchronization and realtime subscriptions

Staff navigation permissions are defined in `src/config/roleAccess.ts`. Roles include:

- Admin
- Manager
- Receptionist
- Housekeeping
- Engineering
- Sales
- Concierge

The main staff views are under `src/components/`:

- `dashboard/` - dashboard overview
- `receptionist/` - receptionist AI and conversation history
- `sales/` - sales AI
- `lancepad/` - staff operations/task hub
- `requests/` - guest request management
- `pipeline/` - sales pipeline
- `tasks/` - task management
- `messages/` - staff/guest messaging
- `analytics/` - analytics dashboards
- `knowledge/` - hotel knowledge base
- `settings/` - settings
- `landing/` - staff landing/login experience
- `common/` - shared header, sidebar, modals, drawers, and toasts

## Guest Concierge Architecture

The main guest component is `src/components/guest/GuestConcierge.tsx`.

It provides:

- Hotel-branded mobile-first layout
- Dynamic room display from the URL
- Invalid room-token state
- Language selector UI
- Voice CTA and status display
- Text chat composer and message history
- Quick request buttons
- Popular request chips
- Compact hotel information
- Guest confirmation toast
- Reduced-motion CSS support

Guest styling is isolated in `src/components/guest/GuestConcierge.css`.

The room token is currently treated as a room identifier. It is validated against:

```text
^[a-z0-9-]{1,24}$
```

This is intentionally structured so a future secure token can replace the URL value and be resolved by a backend.

## ElevenLabs Integration

The integration is isolated in `src/hooks/useVoiceAgent.ts`.

The hook exposes:

```ts
{
  startConversation,
  sendTextMessage,
  endConversation,
  messages,
  status,
  isListening,
  isSpeaking,
  error
}
```

The supported statuses are:

```text
idle
connecting
listening
thinking
speaking
error
```

The hook starts a session with:

```ts
Conversation.startSession({
  agentId,
  dynamicVariables: {
    room_number: roomNumber
  }
})
```

The `room_number` dynamic variable is available to the ElevenLabs agent. The UI maps SDK connection, mode, and message events into its display state. After a guest message arrives, the UI stays in `thinking` until an agent response is received, avoiding an overly sensitive jump back to `listening`.

### Important tool behavior

The frontend does not automatically create hotel requests. The ElevenLabs agent must have the correct published tool configuration.

If the agent uses a server tool:

- The tool webhook must be publicly reachable over HTTPS.
- The published agent must contain the tool.
- The webhook must accept the expected parameters, including room context.

If the agent uses a client tool:

- A matching `clientTools` handler must be registered in `useVoiceAgent.ts`.
- The handler must call the application backend or Supabase.
- The tool name and parameter schema must exactly match the ElevenLabs agent configuration.

The ElevenLabs test console can appear to work even when the deployed browser client is missing a client-tool handler or is using a different published agent version.

## Environment Variables

`.env` is ignored by Git. Use `.env.example` as a reference.

Frontend variables currently used:

```env
VITE_ELEVENLABS_AGENT_ID=agent_your_agent_id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

`VITE_*` variables are embedded in browser JavaScript. An ElevenLabs Agent ID and Supabase anon key are intended to be public client values, but an ElevenLabs API key or Supabase service-role key must never be placed in a `VITE_*` variable or committed to the repository.

For Vercel, add the variables in **Project Settings > Environment Variables**, then redeploy. If deploying an already-built folder manually, the variables must exist before running the build.

## Supabase Services

### `src/services/supabaseClient.ts`

Creates the browser Supabase client when both public Supabase variables are present.

### `src/services/requestService.ts`

Reads, inserts, updates, and subscribes to guest requests in the `requests` table. It normalizes departments, priorities, and statuses for the staff dashboard.

### `src/services/conversationService.ts`

Reads and subscribes to ElevenLabs post-call records in the `guest_conversations` table. It maps database column names to frontend conversation models.

### SQL schemas

- `supabase/requests.sql` creates guest requests and enables realtime.
- `supabase/guest_conversations.sql` creates post-call conversation records and enables realtime.

The current request policies allow public reads, inserts, and updates. This is acceptable for a prototype but must be tightened before production guest data is used. Add authentication, signed room tokens, backend validation, and least-privilege row-level security before launch.

## Deployment

### Guest-only deployment

Build the guest bundle:

```powershell
npm run build:guest
```

Upload this folder to Vercel or another static host:

```text
dist-guest/
  index.html
  assets/
  vercel.json
```

For Vercel, the QR URL should be:

```text
https://your-domain.vercel.app/guest/403
```

Replace `403` with the room identifier. The host must support the rewrite in `vercel.json` so a direct QR visit does not return 404.

The guest deployment needs HTTPS for browser microphone access.

### Full application deployment

Build the complete application:

```powershell
npm run build
```

The output is `dist/`. This build includes the staff application and the guest route.

## Repository Structure

```text
index.html                 Staff/full-app HTML entry
guest.html                 Guest-only HTML entry
package.json               Scripts and dependencies
vite.config.ts             Vite config and guest build mode
scripts/                   Build preparation scripts
public/                    Static assets and Vercel rewrite
supabase/                  Database table definitions
src/
  App.tsx                  Full application route boundary
  guest-main.tsx           Guest-only React entry
  main.tsx                 Full application React entry
  components/              Staff and guest UI components
  config/                  Role access rules
  context/                 Staff application state
  data/                    Mock data
  hooks/                   Reusable hooks, including ElevenLabs
  services/                Supabase, AI, requests, tasks, guests, sales, and hotel services
  types/                   Shared TypeScript models
```

## Current Limitations

- There is no full client-side router; routing is based on `window.location.pathname`.
- Room identifiers are URL values, not secure room tokens.
- Guest request submission through ElevenLabs tools requires a configured backend/server tool or a client-tool implementation.
- The guest UI currently keeps chat messages in React memory and does not persist them by itself.
- The browser client uses a public Agent ID. Private-agent authentication requires a backend signed URL flow.
- The current Supabase SQL policies are intentionally permissive for prototyping.
- The production bundles are large because the existing app and dependency graph are not code-split.
- `npm audit` currently reports dependency vulnerabilities; review them before production deployment.

## Recommended Next Steps

1. Confirm the ElevenLabs agent, published version, tool name, and tool type.
2. Add a backend endpoint for signed ElevenLabs sessions if the agent should not be public.
3. Implement the towel/housekeeping tool against a protected request API or Supabase function.
4. Replace room numbers with short-lived signed QR tokens.
5. Tighten Supabase row-level security and remove public request updates.
6. Add browser/device testing for microphone permissions and direct QR URLs.
7. Add automated tests for guest token parsing, request submission, and deployment rewrites.
