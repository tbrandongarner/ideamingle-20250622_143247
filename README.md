# ideamingle-20250622_143247

> A responsive, single-page HTML/CSS/JS SaaS application for collaborative business idea development.  
> IdeaMingle offers user authentication, dynamic idea canvases with rich-text editing, real-time collaboration, threaded comments & voting, AI-powered suggestions, and one-click export to Trello/Asana?all within a freemium subscription model.

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Architecture](#architecture)  
3. [Installation](#installation)  
4. [Usage](#usage)  
5. [Components & Purpose](#components--purpose)  
6. [Dependencies](#dependencies)  
7. [Environment Variables](#environment-variables)  
8. [Contributing](#contributing)  
9. [License](#license)  

---

## Project Overview

IdeaMingle is designed to help teams brainstorm and refine business ideas in real time. Users can:

- Sign up/sign in with email/password or OAuth  
- Create, list, search and filter ideas on a dashboard  
- Edit rich-text canvases (Problem, Solution, Market, etc.) collaboratively  
- Comment, vote on threads, and see collaborator cursors live  
- Request AI suggestions and apply them inline  
- Export ideas to Trello or Asana with one click  
- Manage profile, teams, and subscriptions (Stripe freemium model)  
- Experience a fully responsive, accessible (WCAG 2.1) UI  

---

## Architecture

1. **Entry Points**  
   - `indexhtml.html` ? Main SPA shell  
   - `index.html` ? Public landing/fallback page  

2. **Module Load Sequence**  
   1. `configmanager.js` ? Load environment config & API keys  
   2. `authmodule.js` ? Email/password & OAuth auth flows  
   3. `apiclient.js` ? REST API wrappers  
   4. `realtimeservice.js` ? WebSocket initialization  
   5. `statemanager.js` ? Global pub/sub store  
   6. `router.js` ? Client-side routing  
   7. `canvasmodule.js` ? Rich-text canvas handlers  
   8. `commentsmodule.js` ? Threaded comments & voting  
   9. `aimodule.js` ? AI suggestions integration  
   10. `exportmodule.js` ? Trello/Asana export  
   11. `billingmodule.js` ? Stripe subscription flows  
   12. `settingsmodule.js` ? Profile & team settings UI  

3. **Root Mount Point**  
   ```html
   <div id="app"></div>
   ```
   UI components then mount into `#app`.

---

## Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-org/ideamingle-20250622_143247.git
   cd ideamingle-20250622_143247
   ```

2. **Configure environment variables**  
   Create a `.env` or set in your host:
   ```
   API_BASE_URL=https://api.ideamingle.com
   AUTH_DOMAIN=your-auth-domain
   TRELLO_KEY=your-trello-key
   STRIPE_PK=your-stripe-publishable-key
   ```

3. **Start a local HTTP server**  
   > Native ES6 modules require serving via HTTP (not `file://`):
   ```bash
   # Python 3
   python3 -m http.server 8000
   # or using Node.js
   npx http-server -c-1
   ```
4. **Open in browser**  
   Visit `http://localhost:8000/indexhtml.html`

---

## Usage

1. **Sign Up / Sign In**  
   - Create an account or use OAuth providers  
2. **Dashboard**  
   - Browse your ideas, search/filter, or create a new idea  
3. **Canvas Editing**  
   - Click any section (Problem, Solution, etc.) to edit inline  
   - Changes auto-save and propagate via WebSockets  
4. **Collaboration**  
   - Invite teammates to join your idea  
   - See live cursors and edits  
5. **Comments & Voting**  
   - Open the comments panel to discuss sections  
   - Upvote or downvote feedback  
6. **AI Suggestions**  
   - Open the AI suggestions panel  
   - Request feedback on current canvas and apply with one click  
7. **Export**  
   - Export your canvas to Trello or Asana cards instantly  
8. **Settings & Billing**  
   - Manage profile, team roles, and subscription plans  

---

## Components & Purpose

| File                         | Purpose                                                                                     |
|------------------------------|---------------------------------------------------------------------------------------------|
| **configmanager.js**         | Loads and exposes environment variables and API URLs                                         |
| **authmodule.js**            | Handles user authentication (sign-up, sign-in/out, session persistence)                      |
| **apiclient.js**             | Generic REST client (GET/POST/PUT/DELETE) with JSON + error handling                        |
| **realtimeservice.js**       | WebSocket manager for real-time canvas collaboration                                        |
| **statemanager.js**          | Global state store with publish/subscribe pattern                                           |
| **router.js**                | Client-side route management and history handling                                           |
| **canvasmodule.js**          | Renders rich-text canvas sections, auto-save, version history                                |
| **commentsmodule.js**        | Threaded comments, upvote/downvote, per-section feedback                                    |
| **aimodule.js**              | Interfaces with AI API for suggestions; renders/apply UI                                     |
| **exportmodule.js**          | Converts canvas data to Trello or Asana cards                                               |
| **billingmodule.js**         | Manages Stripe-powered subscription checkout and freemium gating                             |
| **settingsmodule.js**        | User profile, notification prefs, team role management                                      |
| **sidebarcomponent.js**      | Side navigation menu UI                                                                     |
| **menucomponent.js**         | Top bar UI (profile, notifications, logout)                                                 |
| **dashboardcomponent.js**    | Renders idea list with search, filter, and create CTA                                       |
| **aiPanelComponent.js**      | Primary AI suggestions panel UI                                                             |
| **aipanelcomponent.js**      | Alternate AI panel UI module                                                                |
| **commentsPanelComponent.js**| Primary comments panel UI                                                                   |
| **commentspanelcomponent.js**| Alternate comments panel UI module                                                          |
| **indexhtml.html**           | Main single-page application shell                                                          |
| **index.html**               | Public landing/fallback page                                                                |
| **global.css**               | Global stylesheet (with responsive & WCAG 2.1 styles)                                       |

---

## Dependencies

- Vanilla JS (ES6 modules)  
- CSS (Flexbox / Grid for responsive layouts)  
- socket.io-client (real-time collaboration)  
- Stripe.js (billing & subscription)  
- Trello & Asana REST APIs (export)  
- Optional static server (Python, http-server, etc.)

---

## Environment Variables

| Key             | Description                               |
|-----------------|-------------------------------------------|
| API_BASE_URL    | Base URL of the IdeaMingle REST API       |
| AUTH_DOMAIN     | OAuth / Auth0 domain (if using OAuth)     |
| TRELLO_KEY      | Trello developer key                      |
| STRIPE_PK       | Stripe publishable key                    |

---

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/YourFeature`)  
3. Commit your changes (`git commit -m "Add feature"`)  
4. Push to the branch (`git push origin feature/YourFeature`)  
5. Open a Pull Request  

Please adhere to code style, include documentation, and write tests for new functionality.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Contact

For questions or support, please open an issue or reach out to `support@ideamingle.com`.