# Sarathi

AI-powered citizen-to-government civic complaint and service routing platform for Nepal with interactive geospatial mapping, automated priority assessment, and spatial hotspot detection.

## Team Information

**Team Name:** Team MCQ

**Team Members:**

| Name | Email | GitHub Username |
|---|---|---|
| Alish Bista | bistaalish81@gmail.com | @bistaalish81-pixel |
| Nischal Kandel | kandelnischal734@gmail.com | @kandelnischal734-maker |
| Krishav Shrestha | krishavshrestha@gmail.com | @krishavshrestha |

## Project Details

**Project Title:** Sarathi (सारथि)

**Category:** [ ] FinTech &nbsp; [ ] EdTech &nbsp; [x] E-Governance &nbsp; [ ] IoT &nbsp; [x] Open Innovation

**Problem Statement:**
In Nepal, citizens face significant friction reporting everyday municipal and public infrastructure problems—such as damaged roads, raw sewage floods, accumulated waste, broken water mains, and fallen power lines. Traditional reporting channels and social media complaints lack exact geographic coordinates, get lost in bureaucratic silos, and rarely reach the responsible department, causing prolonged delays, public health hazards, and citizen frustration.

**Solution Overview:**
Sarathi bridges citizens and government agencies through an intelligent, transparent platform. Citizens report problems with pinpoint GPS or interactive map selection. Using Groq AI (LLMs), the system autonomously categorizes the complaint, calculates urgency/priority, extracts key issue summaries, routes the complaint to the designated government department (DoR, KUKL, NEA, Ward Offices), and warns of nearby duplicate reports. The interactive Nepal map displays real-time complaint markers, spatial hotspot clusters, impact overview statistics, and nearest municipal/emergency services calculated via Haversine distance.

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Vanilla CSS, JavaScript (ES6+), Leaflet 1.9.4, Leaflet.markercluster |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (`pg`) |
| AI / LLM | Groq API (`openai/gpt-oss-120b` / Llama-3-70b via OpenAI SDK) |
| Mapping & Geocoding | OpenStreetMap Cartography, Nominatim Reverse Geocoding |

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or remote)
- Git

### Steps

```bash
# Clone the repository
git clone https://github.com/bistaalish81-pixel/Team_MCQ-CODERUSH2026.git

# Navigate to the project folder
cd Team_MCQ-CODERUSH2026

# Install backend dependencies
cd backend
npm install

# Start the backend server
node server.js
# Backend runs on http://localhost:5001

# In another terminal, start the frontend static server
cd ..
python3 -m http.server 8080
# Or open index.html directly using VS Code Live Server
```

The web application will be running at `http://localhost:8080` (or `http://localhost:5500` via Live Server).

### Environment Variables (if applicable)

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=sarathi
DB_PORT=5432
GROQ_API_KEY=your_groq_api_key_here
PORT=5001
```

| Variable | Required | Description |
|---|---|---|
| `DB_USER` | Yes | PostgreSQL database user |
| `DB_HOST` | Yes | PostgreSQL host (default: `localhost`) |
| `DB_NAME` | Yes | PostgreSQL database name (`sarathi`) |
| `DB_PORT` | Yes | PostgreSQL port (default: `5432`) |
| `GROQ_API_KEY` | Yes | API key from Groq Console for LLM classification |
| `PORT` | No | Express server port (default: `5001`) |

## Demo Credentials (if applicable)

| Role | Access |
|---|---|
| Citizen / Judge | Open `http://localhost:8080/index.html` — full public access to Map, Report, and SmartRoute without mandatory authentication |
| Local Profile | Click **"👤 Account"** in top navbar to save a demonstration user profile locally |

## Demo Flow

1. **Open Complaint Map**:
   - Navigate to `http://localhost:8080/index.html` and click **"🗺️ Complaint Map"** in the navigation header.
2. **Impact Overview & Priority Visualization**:
   - Inspect the top cards showing live metrics: **Total Complaints**, **Critical Priority** (with pulsing radar animation), **High Priority**, **Resolved**, and **Active Hotspots**.
   - See color-coded complaint markers plotted across Kathmandu, Lalitpur, Bhaktapur, and Pokhara.
3. **Filter & Search**:
   - Filter by category (*Water Supply*, *Roads & Infrastructure*, *Waste Management*), priority (*Critical*, *High*), or status.
   - Use the search bar or quick region pills (*Kathmandu*, *Lalitpur*, *Bhaktapur*, *Pokhara*, *All Nepal*) to fly across districts.
4. **Inspect Complaint Hotspots**:
   - View spatial cluster zones detected under **"🔥 Complaint Hotspots"** (e.g. Kathmandu Waste Hotspot, Lalitpur Water Supply Hotspot). Click **"Zoom In →"** to focus the map on the cluster radius.
5. **Nearby Government & Emergency Services**:
   - Click any complaint marker or spot on the map. The **"Nearby Government Services"** card displays the nearest Ward Office, Police Post, Hospital, and Emergency dispatch with calculated distances.
6. **Submit a Complaint with Interactive Map Pin**:
   - Click **"Report"**. Pinpoint a location on the interactive mini map—notice the street/ward address reverse-geocodes automatically.
   - If placed near an existing issue, notice the **"⚠️ Similar complaints already reported nearby"** warning to prevent civic spam.
7. **SmartRoute™ AI Live Preview**:
   - In Description, type: *"Raw sewage flooding into houses and playground near Kalimati"*.
   - Watch the live AI preview automatically determine:
     `Complaint ➔ Public Safety ➔ CRITICAL ➔ Water Supply / Sanitation Department`.
8. **Submit & Instant Map Sync**:
   - Submit the complaint. It saves to PostgreSQL, and the user is redirected to the **Complaint Map** where the new marker immediately appears!
9. **SmartRoute AI Engine Showcase**:
   - Click **"🤖 SmartRoute AI"** in the navbar to test preset scenarios (*Sewage Overflow*, *Waste Dumping*, *Dangerous Pothole*, *Dry Taps*, *Sparking Transformer*) through the interactive 4-step decision pipeline.
10. **Admin Panel & Operations**:
   - Click **"🔐 Admin"** in the top navigation.
   - Enter credentials: Username: `admin` | Password: `admin123`.
   - Access the Admin Control Center: view all complaints in a table, update statuses (Pending, In Progress, Resolved), reassign priorities, view full AI metadata, and manage complaints.

## Screenshots / Demo

- **Interactive Complaint Map**: Live complaints with priority markers, status badges, and Leaflet clustering.
- **Automated Hotspot Heatmap**: Radius circles highlighting high-density issue zones across Nepal.
- **SmartRoute Decision Pipeline**: `Complaint ➔ Category ➔ Priority ➔ Department` automated triage.

## Project Structure

```
Team_MCQ-CODERUSH2026/
├── backend/
│   ├── .env                  # Environment configuration (gitignored)
│   ├── package.json          # Node.js dependencies (express, pg, openai, cors)
│   └── server.js             # Express API server, PostgreSQL schema, Groq AI pipeline
├── index.html                # Main application UI (Home, Issues, Report, Map, SmartRoute)
├── script.js                 # Client application logic, Leaflet map engine, AI integration
├── style.css                 # Design system, responsive layout, animations, badges
├── app.js                    # Standalone SmartRoute rule prototype
└── README.md                 # Project documentation
```

## License

This project was built for **CodeRush 2026**, organized by Nepalaya IT Club.
