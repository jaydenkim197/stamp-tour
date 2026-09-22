# Stamp Tour

Stamp Tour is a Melbourne tram travel-guide web application. It combines station and place browsing, map views, visitor stamps, reviews, a ranking page, multilingual UI support, and route recommendations.

## Repository layout

```text
.
├── src/                            # React frontend
├── public/                         # Static frontend assets
├── backend/                        # PHP backend, consolidated here in August 2026
└── legacy/melbourne-map-guide_MVP/ # Preserved early Vite prototype
```

`backend/` is the canonical backend source. The former standalone backend repository was verified to be an exact duplicate and is retained only as archival history until it is archived or removed.

## Frontend

The frontend uses React, React Router, Leaflet, and React Leaflet.

```bash
npm install
npm start
```

To create a production bundle:

```bash
npm run build
```

## Current scope

Routes in the application cover the home page, station and place views, map browsing, sign-up and login, place reviews, stamp collection, rankings, recent reviews, and route recommendations.

## Project history

The original Melbourne map-guide prototype is preserved under `legacy/melbourne-map-guide_MVP/` for reference. It is not the current application and should not be used as the development entry point.
