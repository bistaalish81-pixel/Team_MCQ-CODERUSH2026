# Sarathi Smart Features — Standalone

This is the **Person 4 / Smart Features** module for the Sarathi hackathon project.

It is intentionally **separate from the team's GitHub project and separate from Supabase**.

## Features

- Smart complaint category detection
- Priority detection: Low / Medium / High / Critical
- Automatic department routing
- Confidence score
- Browser geolocation
- Interactive Leaflet/OpenStreetMap map
- Local complaint storage with localStorage
- Smart statistics
- Recent complaints table
- SmartRoute pipeline visualization

## Run in VS Code

1. Extract the folder.
2. Open the folder in VS Code.
3. Open `index.html` with **Live Server**.
4. Allow location permission when testing GPS.

You can also open `index.html` directly in a browser, but Live Server is recommended.

## Important

There is **no Supabase connection** in this version.

There is also no AI API key. The analyzer is a local rule-based prototype designed for a reliable hackathon demo.

Later, the `analyzeComplaint()` function in `app.js` can be replaced with a real AI/API call without changing the UI.

## Integration later

When the rest of the team is ready, this module can expose these values to the backend:

- `category`
- `priority`
- `department`
- `confidence`
- `lat`
- `lng`
- `status`

For now, everything stays inside this standalone project.
