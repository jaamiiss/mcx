# mcx

A lightweight workflow operations console built with HTMX 4, Server-Sent Events (SSE), and Express. Demonstrates HTMX 4 capabilities including native morphing, stream handling, and view transitions.

## Features

- **HTMX 4 SSE Integration**: Direct connection using `hx-sse:connect` without legacy extension wrappers.
- **Morph Swapping**: Real-time updates using `innerMorph` for live log streaming and `outerMorph` for out-of-band partial updates.
- **Request State Management**: Automatic button and form disabling during requests using `hx-disabled-elt`.
- **SSE Lifecycle Handling**: Real-time connection status indicators via `hx-on:htmx:sse:*` events.
- **View Transitions**: Browser-native transitions enabled globally with `globalViewTransitions`.
- **Human-in-the-Loop Gates**: Step-approval modal with diff inspection.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
# or
pnpm install
```

### Running the App

```bash
# Development (watch mode)
npm run dev

# Production
npm start
```

The application will be available at `http://localhost:3010`.

## Project Structure

```
mcx/
├── public/
│   ├── css/
│   │   └── style.css            # Styles and design tokens
│   ├── js/
│   │   ├── htmx.min.js          # HTMX 4 core
│   │   └── hx-sse.min.js        # HTMX 4 SSE extension
│   └── favicon.svg              # App icon
├── src/
│   ├── engine/
│   │   ├── missionRunner.js     # State machine and execution runner
│   │   └── scenarios.js         # Workflow presets
│   └── views/
│       ├── index.ejs            # Main dashboard layout
│       └── partials/
│           ├── approval-gate.ejs   # Approval modal dialog
│           ├── artifact-view.ejs   # Formatted report view
│           ├── mission-status.ejs  # Status header and controls
│           ├── reasoning-feed.ejs  # Stream log container
│           └── task-board.ejs      # Task pipeline matrix
├── server.js                    # Express app and SSE streaming route
├── package.json
└── README.md
```

## License

ISC
