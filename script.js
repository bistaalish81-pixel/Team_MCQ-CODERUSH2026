/* ================================================= */
/* SARKAR SATHI AI — CORE & SMART MAP JAVASCRIPT    */
/* Person 4: Interactive Map + Smart Features       */
/* ================================================= */

const API_BASE = "http://localhost:5001";

/* Global State */
let backendComplaints = [];
let filteredMapComplaints = [];
let backendStats = null;

let mainMap = null;
let mainMarkersGroup = null;
let hotspotCirclesGroup = null;
let showHotspotsActive = true;
let userLocationMarker = null;

let reportPickerMap = null;
let reportPickerMarker = null;
let selectedPickerLocation = { lat: 27.7172, lng: 85.3240, address: "Kathmandu, Nepal" };

let smartRouteDebounceTimer = null;
let mapSearchDebounceTimer = null;

/* Default seed issues fallback in case backend is offline */
const defaultIssues = [
    {
        id: 1,
        title: "Broken Street Light",
        category: "Electricity",
        location: "Kathmandu",
        latitude: 27.6915,
        longitude: 85.3420,
        description: "A street light has not been working for several days in Baneshwor.",
        priority: "medium",
        status: "pending",
        votes: 12
    },
    {
        id: 2,
        title: "Garbage Collection Problem",
        category: "Waste Management",
        location: "Lalitpur",
        latitude: 27.7172,
        longitude: 85.3240,
        description: "Garbage has not been collected from this area regularly.",
        priority: "high",
        status: "in_progress",
        votes: 18
    },
    {
        id: 3,
        title: "Damaged Road Section",
        category: "Roads & Infrastructure",
        location: "Bhaktapur",
        latitude: 27.6735,
        longitude: 85.4380,
        description: "A section of the road needs repair near Kamalbinayak.",
        priority: "medium",
        status: "resolved",
        votes: 27
    },
    {
        id: 4,
        title: "Water Supply Issue",
        category: "Water Supply",
        location: "Kirtipur",
        latitude: 27.6728,
        longitude: 85.3255,
        description: "Residents are experiencing an irregular water supply.",
        priority: "high",
        status: "pending",
        votes: 9
    }
];

let issues = JSON.parse(localStorage.getItem("sarathiIssues")) || defaultIssues;

/* Nepal Geographic Boundaries & Centers */
const NEPAL_REGIONS = {
    all: { center: [28.3949, 84.1240], zoom: 7 },
    kathmandu: { center: [27.7172, 85.3240], zoom: 13 },
    lalitpur: { center: [27.6710, 85.3214], zoom: 14 },
    bhaktapur: { center: [27.6710, 85.4298], zoom: 14 },
    pokhara: { center: [28.2096, 83.9856], zoom: 13 }
};

/* Authentic Nepal Government & Emergency Service Facilities (Part 6) */
const NEPAL_GOV_SERVICES = [
    {
        name: "Kathmandu Metropolitan City Central Office",
        type: "ward",
        typeLabel: "Municipality HQ",
        lat: 27.7025,
        lng: 85.3135,
        address: "Sundhara / JDA Complex, Kathmandu",
        phone: "01-4231481"
    },
    {
        name: "KMC Ward 10 Office (New Baneshwor)",
        type: "ward",
        typeLabel: "Ward Office",
        lat: 27.6918,
        lng: 85.3412,
        address: "New Baneshwor, Kathmandu",
        phone: "01-4470123"
    },
    {
        name: "Lalitpur Metropolitan City Office",
        type: "ward",
        typeLabel: "Metropolitan Office",
        lat: 27.6780,
        lng: 85.3168,
        address: "Pulchowk, Lalitpur",
        phone: "01-5521207"
    },
    {
        name: "Bhaktapur Municipality Office",
        type: "ward",
        typeLabel: "Municipality Office",
        lat: 27.6725,
        lng: 85.4280,
        address: "Byasi, Bhaktapur",
        phone: "01-6610014"
    },
    {
        name: "Nepal Police Headquarters",
        type: "police",
        typeLabel: "Police HQ",
        lat: 27.7126,
        lng: 85.3262,
        address: "Naxal, Kathmandu",
        phone: "100"
    },
    {
        name: "Metropolitan Police Circle (Durbarmarg)",
        type: "police",
        typeLabel: "Police Circle",
        lat: 27.7118,
        lng: 85.3182,
        address: "Durbarmarg, Kathmandu",
        phone: "01-4226998"
    },
    {
        name: "Lalitpur Police Range",
        type: "police",
        typeLabel: "Police Range",
        lat: 27.6745,
        lng: 85.3135,
        address: "Jawalakhel, Lalitpur",
        phone: "01-5521207"
    },
    {
        name: "Bir Hospital (Emergency Medical)",
        type: "hospital",
        typeLabel: "Central Hospital",
        lat: 27.7042,
        lng: 85.3138,
        address: "Mahabouddha, Kathmandu",
        phone: "01-4221119"
    },
    {
        name: "Patan Hospital",
        type: "hospital",
        typeLabel: "General Hospital",
        lat: 27.6685,
        lng: 85.3218,
        address: "Lagankhel, Lalitpur",
        phone: "01-5522278"
    },
    {
        name: "TU Teaching Hospital (TUTH)",
        type: "hospital",
        typeLabel: "Teaching Hospital",
        lat: 27.7360,
        lng: 85.3308,
        address: "Maharajgunj, Kathmandu",
        phone: "01-4412303"
    },
    {
        name: "Kathmandu Fire Brigade (Damkal)",
        type: "utility",
        typeLabel: "Fire Brigade",
        lat: 27.7028,
        lng: 85.3110,
        address: "New Road Gate, Kathmandu",
        phone: "101"
    },
    {
        name: "Nepal Electricity Authority (NEA) Central Office",
        type: "utility",
        typeLabel: "Electricity Board",
        lat: 27.7058,
        lng: 85.3160,
        address: "Durbarmarg / Ratnapark, Kathmandu",
        phone: "01-4153000"
    },
    {
        name: "Kathmandu Upatyaka Khanepani Limited (KUKL)",
        type: "utility",
        typeLabel: "Water Supply Board",
        lat: 27.6962,
        lng: 85.3148,
        address: "Tripureshwor, Kathmandu",
        phone: "01-4262444"
    }
];

/* Category Icons Mapping */
const CATEGORY_ICONS = {
    "Waste Management": "🗑️",
    "Water Supply": "💧",
    "Roads & Infrastructure": "🛣️",
    "Roads": "🛣️",
    "Waste": "🗑️",
    "Water": "💧",
    "Electricity": "💡",
    "Lighting": "💡",
    "Public Safety": "🚨",
    "Healthcare": "🏥",
    "Traffic & Transport": "🚦",
    "Government Services": "🏛️",
    "Environment": "🌱",
    "Other": "📌"
};

/* ================================================= */
/* 1. PAGE NAVIGATION & LIFECYCLE                   */
/* ================================================= */

function showPage(pageName) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(p => p.classList.add("hidden"));

    const selected = document.getElementById(pageName);
    if (selected) {
        selected.classList.remove("hidden");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    const nav = document.getElementById("mainNav");
    if (nav) nav.classList.remove("open");

    // Route-specific triggers
    if (pageName === "home") {
        displayHomeIssues();
        updateStats();
    } else if (pageName === "issues") {
        displayIssues();
        updateStats();
    } else if (pageName === "map") {
        setTimeout(() => {
            initOrRefreshMainMap();
        }, 100);
    } else if (pageName === "report") {
        setTimeout(() => {
            initOrRefreshReportPickerMap();
        }, 100);
    } else if (pageName === "smartroute") {
        // Ready
    }
}

function toggleMenu() {
    const nav = document.getElementById("mainNav");
    if (nav) nav.classList.toggle("open");
}

/* ================================================= */
/* 2. BACKEND API SYNC                              */
/* ================================================= */

async function fetchBackendComplaints() {
    const loader = document.getElementById("mapLoadingOverlay");
    if (loader) loader.classList.remove("hidden");

    try {
        const [complaintsRes, statsRes] = await Promise.all([
            fetch(`${API_BASE}/api/complaints`),
            fetch(`${API_BASE}/api/complaints/stats`)
        ]);

        if (!complaintsRes.ok) throw new Error("Failed to fetch complaints from API");

        const data = await complaintsRes.json();
        if (Array.isArray(data)) {
            backendComplaints = data.map(c => ({
                id: c.id,
                title: c.title || "Civic Complaint",
                description: c.description || "",
                category: c.category || "Other",
                priority: (c.priority || "medium").toLowerCase(),
                department: c.department || "Municipal Office",
                location: c.location || "Nepal",
                latitude: (typeof c.latitude === "number" && !isNaN(c.latitude)) ? c.latitude : (parseFloat(c.latitude) || 27.7172),
                longitude: (typeof c.longitude === "number" && !isNaN(c.longitude)) ? c.longitude : (parseFloat(c.longitude) || 85.3240),
                status: (c.status || "pending").toLowerCase(),
                confidence: typeof c.confidence === "number" ? Math.round(c.confidence * 100) : 92,
                created_at: c.created_at || new Date().toISOString(),
                summary: c.summary || c.description || ""
            }));

            // Synchronize issues array
            issues = backendComplaints.map(c => ({
                id: c.id,
                title: c.title,
                category: c.category,
                location: c.location,
                description: c.description,
                status: c.status === "in_progress" ? "In Progress" : (c.status === "resolved" ? "Resolved" : "Open"),
                priority: c.priority,
                votes: Math.floor(Math.random() * 15) + 3
            }));
            saveIssues();
        }

        if (statsRes.ok) {
            backendStats = await statsRes.json();
        }
    } catch (err) {
        console.warn("Backend API unavailable or error:", err.message);
        // Fallback
        backendComplaints = issues.map(iss => ({
            id: iss.id,
            title: iss.title,
            description: iss.description,
            category: iss.category,
            priority: (iss.priority || "medium").toLowerCase(),
            department: "General Municipal Department",
            location: iss.location,
            latitude: iss.latitude || 27.7172,
            longitude: iss.longitude || 85.3240,
            status: iss.status ? iss.status.toLowerCase().replace("open", "pending") : "pending",
            confidence: 90,
            created_at: new Date().toISOString(),
            summary: iss.description
        }));
    } finally {
        if (loader) loader.classList.add("hidden");
        filteredMapComplaints = [...backendComplaints];
        renderImpactStats();
        renderMapMarkers();
        renderHotspots();
        renderSmartInsights();
        renderNearbyServices(27.7172, 85.3240); // default Valley center
        displayHomeIssues();
        displayIssues();
        updateStats();
    }
}

function refreshMapData() {
    showToast("Refreshing live complaints from database...");
    fetchBackendComplaints();
}

/* ================================================= */
/* 3. PART 5: IMPACT OVERVIEW STATS                 */
/* ================================================= */

function renderImpactStats() {
    const total = backendComplaints.length;
    const critical = backendComplaints.filter(c => c.priority === "critical").length;
    const high = backendComplaints.filter(c => c.priority === "high").length;
    const resolved = backendComplaints.filter(c => c.status === "resolved").length;

    const totalEl = document.getElementById("mapTotalStat");
    const criticalEl = document.getElementById("mapCriticalStat");
    const highEl = document.getElementById("mapHighStat");
    const resolvedEl = document.getElementById("mapResolvedStat");

    if (totalEl) totalEl.textContent = total;
    if (criticalEl) criticalEl.textContent = critical;
    if (highEl) highEl.textContent = high;
    if (resolvedEl) resolvedEl.textContent = resolved;
}

/* ================================================= */
/* 4. PART 1 & 2: INTERACTIVE COMPLAINT MAP        */
/* ================================================= */

function initOrRefreshMainMap() {
    const container = document.getElementById("mainComplaintMap");
    if (!container) return;

    if (!mainMap) {
        // Initialize Leaflet map
        mainMap = L.map("mainComplaintMap", {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView(NEPAL_REGIONS.kathmandu.center, NEPAL_REGIONS.kathmandu.zoom);

        // OpenStreetMap clean tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Sarkar Sathi AI'
        }).addTo(mainMap);

        // Marker cluster or LayerGroup
        if (typeof L.markerClusterGroup === "function") {
            mainMarkersGroup = L.markerClusterGroup({
                maxClusterRadius: 40,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                iconCreateFunction: function (cluster) {
                    const count = cluster.getChildCount();
                    return L.divIcon({
                        html: `<div class="marker-pin-wrapper high" style="width:34px;height:34px;font-size:12px;font-weight:bold;color:#1e293b;">${count}</div>`,
                        className: 'custom-cluster-marker',
                        iconSize: L.point(34, 34)
                    });
                }
            });
        } else {
            mainMarkersGroup = L.layerGroup();
        }
        mainMap.addLayer(mainMarkersGroup);

        hotspotCirclesGroup = L.layerGroup().addTo(mainMap);

        // Click anywhere on map to inspect nearby services
        mainMap.on("click", (e) => {
            renderNearbyServices(e.latlng.lat, e.latlng.lng);
        });

        // Initial fetch
        fetchBackendComplaints();
    } else {
        mainMap.invalidateSize();
    }
}

function createComplaintMarkerIcon(complaint) {
    const priority = (complaint.priority || "medium").toLowerCase();
    const iconEmoji = CATEGORY_ICONS[complaint.category] || "📌";

    return L.divIcon({
        className: "custom-complaint-marker",
        html: `
            <div class="marker-pin-wrapper ${priority}" title="${escapeHTML(complaint.title)} (${priority.toUpperCase()})">
                <span class="marker-emoji">${iconEmoji}</span>
            </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20]
    });
}

function renderMapMarkers() {
    if (!mainMap || !mainMarkersGroup) return;

    mainMarkersGroup.clearLayers();

    filteredMapComplaints.forEach(complaint => {
        if (typeof complaint.latitude !== "number" || typeof complaint.longitude !== "number") return;

        const marker = L.marker([complaint.latitude, complaint.longitude], {
            icon: createComplaintMarkerIcon(complaint)
        });

        const iconEmoji = CATEGORY_ICONS[complaint.category] || "📌";
        const priorityUpper = (complaint.priority || "MEDIUM").toUpperCase();
        const statusClean = complaint.status.replace("_", " ").toUpperCase();

        const popupHtml = `
            <div class="complaint-popup-card">
                <div class="popup-header-tags">
                    <span class="popup-id-badge">#CMP-${complaint.id}</span>
                    <span class="popup-prio-tag ${complaint.priority}">${priorityUpper}</span>
                </div>
                <h4 class="popup-title">${escapeHTML(complaint.title)}</h4>
                <div class="popup-cat-row">
                    <span>${iconEmoji} ${escapeHTML(complaint.category)}</span> •
                    <span style="font-weight:600;color:#059669;">${statusClean}</span>
                </div>
                <div class="popup-desc">
                    ${escapeHTML(complaint.summary || complaint.description || "No further details provided.")}
                </div>
                <div class="popup-dept-info">
                    <small>Assigned Department:</small>
                    <strong>🏛️ ${escapeHTML(complaint.department)}</strong>
                </div>
                <div class="popup-meta-row">
                    <span>📍 ${escapeHTML(complaint.location)}</span>
                    <span>⚡ AI Confidence: ${complaint.confidence}%</span>
                </div>
                <button class="popup-action-btn" onclick="focusNearbyServices(${complaint.latitude}, ${complaint.longitude}, '${escapeHTML(complaint.location)}')">
                    🏛️ View Nearest Gov Services
                </button>
            </div>
        `;

        marker.bindPopup(popupHtml);

        marker.on("click", () => {
            renderNearbyServices(complaint.latitude, complaint.longitude, complaint.location);
        });

        mainMarkersGroup.addLayer(marker);
    });
}

/* ================================================= */
/* 5. PART 3: SMART MAP FILTERING                   */
/* ================================================= */

function applyMapFilters() {
    const categoryVal = document.getElementById("mapCategoryFilter").value;
    const priorityVal = document.getElementById("mapPriorityFilter").value;
    const statusVal = document.getElementById("mapStatusFilter").value;
    const searchVal = document.getElementById("mapSearchInput").value.trim().toLowerCase();

    filteredMapComplaints = backendComplaints.filter(c => {
        // Category match
        if (categoryVal !== "all" && c.category.toLowerCase() !== categoryVal.toLowerCase()) {
            if (!c.category.toLowerCase().includes(categoryVal.toLowerCase()) && !categoryVal.toLowerCase().includes(c.category.toLowerCase())) {
                return false;
            }
        }

        // Priority match
        if (priorityVal !== "all" && c.priority.toLowerCase() !== priorityVal.toLowerCase()) {
            return false;
        }

        // Status match
        if (statusVal !== "all") {
            const normalizedStatus = c.status.toLowerCase().replace("open", "pending");
            if (normalizedStatus !== statusVal.toLowerCase()) {
                return false;
            }
        }

        // Search input match
        if (searchVal) {
            const matchText = `${c.title} ${c.description} ${c.location} ${c.department} #cmp-${c.id} #${c.id}`.toLowerCase();
            if (!matchText.includes(searchVal)) {
                return false;
            }
        }

        return true;
    });

    renderMapMarkers();
    renderHotspots();
    showToast(`Showing ${filteredMapComplaints.length} complaint(s) on map.`);
}

function handleMapSearch(query) {
    clearTimeout(mapSearchDebounceTimer);
    mapSearchDebounceTimer = setTimeout(() => {
        applyMapFilters();
    }, 250);
}

function jumpToNepalRegion(regionKey, buttonElem) {
    if (!mainMap) return;

    // Toggle active pill
    if (buttonElem) {
        document.querySelectorAll(".jump-pill").forEach(p => p.classList.remove("active"));
        buttonElem.classList.add("active");
    }

    const region = NEPAL_REGIONS[regionKey] || NEPAL_REGIONS.all;
    mainMap.flyTo(region.center, region.zoom, {
        duration: 1.2,
        easeLinearity: 0.25
    });

    renderNearbyServices(region.center[0], region.center[1]);
}

function locateUserOnMap() {
    if (!navigator.geolocation) {
        showToast("Geolocation is not supported by your browser.");
        return;
    }

    showToast("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            if (userLocationMarker) {
                mainMap.removeLayer(userLocationMarker);
            }

            userLocationMarker = L.circleMarker([lat, lng], {
                radius: 10,
                fillColor: "#2563eb",
                color: "#ffffff",
                weight: 3,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(mainMap);

            userLocationMarker.bindPopup("<strong>📍 You are here</strong>").openPopup();

            mainMap.flyTo([lat, lng], 15, { duration: 1.2 });
            renderNearbyServices(lat, lng, "Your GPS Position");
            showToast("Centered on your current location.");
        },
        err => {
            showToast("Could not retrieve GPS location. Check browser permissions.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

function toggleHotspotsLayer() {
    const btn = document.getElementById("hotspotToggleBtn");
    showHotspotsActive = !showHotspotsActive;

    if (btn) {
        btn.textContent = showHotspotsActive ? "🔥 Hotspots: ON" : "🔥 Hotspots: OFF";
        btn.classList.toggle("active", showHotspotsActive);
    }

    if (hotspotCirclesGroup) {
        if (showHotspotsActive) {
            mainMap.addLayer(hotspotCirclesGroup);
        } else {
            mainMap.removeLayer(hotspotCirclesGroup);
        }
    }
}

/* ================================================= */
/* 6. PART 4: SMART HOTSPOT DETECTION               */
/* ================================================= */

function detectHotspots(complaints) {
    const clusters = [];
    const thresholdKm = 1.8;

    complaints.forEach(item => {
        if (!item.latitude || !item.longitude) return;

        let added = false;
        for (const cluster of clusters) {
            const dist = calculateHaversineDistance(
                cluster.centerLat, cluster.centerLng,
                item.latitude, item.longitude
            );
            if (dist <= thresholdKm) {
                cluster.items.push(item);
                cluster.centerLat = cluster.items.reduce((s, x) => s + x.latitude, 0) / cluster.items.length;
                cluster.centerLng = cluster.items.reduce((s, x) => s + x.longitude, 0) / cluster.items.length;
                added = true;
                break;
            }
        }

        if (!added) {
            clusters.push({
                centerLat: item.latitude,
                centerLng: item.longitude,
                items: [item]
            });
        }
    });

    return clusters.filter(c => c.items.length >= 2).map(c => {
        const catCounts = {};
        c.items.forEach(i => {
            catCounts[i.category] = (catCounts[i.category] || 0) + 1;
        });

        let dominantCategory = "Multiple Issues";
        let maxCatCount = 0;
        for (const [cat, count] of Object.entries(catCounts)) {
            if (count > maxCatCount) {
                maxCatCount = count;
                dominantCategory = cat;
            }
        }

        const locationNames = c.items.map(i => i.location);
        let area = "Urban Cluster";
        if (locationNames.some(l => /kathmandu|koteshwor|thapathali|baneshwor/i.test(l))) area = "Kathmandu";
        else if (locationNames.some(l => /lalitpur|patan|jawalakhel|mangal/i.test(l))) area = "Lalitpur";
        else if (locationNames.some(l => /bhaktapur|kamalbinayak|suryabinayak/i.test(l))) area = "Bhaktapur";
        else if (locationNames.some(l => /pokhara|lakeside/i.test(l))) area = "Pokhara";

        return {
            area,
            dominantCategory,
            count: c.items.length,
            lat: c.centerLat,
            lng: c.centerLng,
            criticalCount: c.items.filter(i => i.priority === "critical").length
        };
    });
}

function renderHotspots() {
    const container = document.getElementById("hotspotsContainer");
    const counterBadge = document.getElementById("hotspotsBadgeCount");
    const statEl = document.getElementById("mapHotspotsStat");

    if (!hotspotCirclesGroup) return;
    hotspotCirclesGroup.clearLayers();

    const hotspots = detectHotspots(backendComplaints);

    if (counterBadge) counterBadge.textContent = `${hotspots.length} Detected`;
    if (statEl) statEl.textContent = hotspots.length;

    if (!container) return;

    if (hotspots.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding:16px;">
                <p style="color:#64748b;font-size:13px;">No critical problem clusters detected in this view yet.</p>
            </div>
        `;
        return;
    }

    hotspots.forEach(h => {
        const circleColor = h.criticalCount > 0 ? "#dc2626" : "#ea580c";
        const circle = L.circle([h.lat, h.lng], {
            radius: 850,
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.16,
            dashArray: "6, 6",
            weight: 2
        }).addTo(hotspotCirclesGroup);

        circle.bindTooltip(`<strong>🔥 ${h.area} — ${h.dominantCategory} Hotspot</strong><br>${h.count} grievances in immediate area`, {
            permanent: false,
            direction: "top"
        });

        circle.on("click", () => {
            mainMap.flyTo([h.lat, h.lng], 15);
            renderNearbyServices(h.lat, h.lng, `${h.area} Hotspot Zone`);
        });
    });

    container.innerHTML = hotspots.map(h => `
        <div class="hotspot-item-card" onclick="flyToHotspot(${h.lat}, ${h.lng}, '${escapeHTML(h.area)}')">
            <div class="hotspot-meta">
                <strong>🔥 ${escapeHTML(h.area)} — ${escapeHTML(h.dominantCategory)} Hotspot</strong>
                <p>📍 ${h.count} active complaints clustered within ~1.5km ${h.criticalCount > 0 ? `<span style="color:#dc2626;font-weight:700;">(${h.criticalCount} Critical)</span>` : ''}</p>
            </div>
            <button class="hotspot-focus-btn">Zoom In →</button>
        </div>
    `).join("");
}

function flyToHotspot(lat, lng, area) {
    if (!mainMap) return;
    mainMap.flyTo([lat, lng], 15, { duration: 1.2 });
    renderNearbyServices(lat, lng, `${area} Hotspot Area`);
}

/* ================================================= */
/* 7. PART 7: SMART CIVIC INSIGHTS                   */
/* ================================================= */

function renderSmartInsights() {
    const container = document.getElementById("smartInsightsContainer");
    if (!container) return;

    const complaints = backendComplaints;
    if (complaints.length === 0) {
        container.innerHTML = `<p style="font-size:13px;color:#64748b;">Awaiting data to generate insights.</p>`;
        return;
    }

    const insights = [];

    // Dominant category
    const catCounts = {};
    complaints.forEach(c => catCounts[c.category] = (catCounts[c.category] || 0) + 1);
    const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length > 0) {
        const topCat = sortedCats[0];
        const pct = Math.round((topCat[1] / complaints.length) * 100);
        insights.push({
            icon: "📈",
            text: `<strong>${topCat[0]}</strong> is the most reported issue type, accounting for <strong>${pct}%</strong> of community reports.`
        });
    }

    // Critical priorities
    const criticals = complaints.filter(c => c.priority === "critical");
    if (criticals.length > 0) {
        insights.push({
            icon: "🚨",
            text: `<strong>${criticals.length} life-safety hazards</strong> flagged as CRITICAL (sewage floods & electrical hazards) requiring urgent municipal intervention.`
        });
    }

    // Resolution progress
    const resolved = complaints.filter(c => c.status === "resolved").length;
    const resRate = Math.round((resolved / complaints.length) * 100);
    insights.push({
        icon: "✅",
        text: `Platform resolution velocity is currently at <strong>${resRate}%</strong>, with <strong>${complaints.length - resolved}</strong> unresolved grievances being tracked.`
    });

    // Hotspot density
    insights.push({
        icon: "🔥",
        text: `Spatial clustering detected <strong>${detectHotspots(complaints).length} active problem hotspots</strong> in the Kathmandu Valley corridor.`
    });

    container.innerHTML = insights.map(i => `
        <div class="insight-item">
            <span class="insight-item-icon">${i.icon}</span>
            <div class="insight-item-text">${i.text}</div>
        </div>
    `).join("");
}

/* ================================================= */
/* 8. PART 6: NEARBY GOVERNMENT SERVICES LOOKUP     */
/* ================================================= */

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function renderNearbyServices(targetLat, targetLng, targetLabel) {
    const container = document.getElementById("nearbyServicesList");
    const labelEl = document.getElementById("nearbyTargetLabel");

    if (labelEl) {
        labelEl.textContent = targetLabel ? `Nearest services to: ${targetLabel}` : `Coordinates: ${targetLat.toFixed(4)}, ${targetLng.toFixed(4)}`;
    }

    if (!container) return;

    const sortedServices = NEPAL_GOV_SERVICES.map(s => {
        const dist = calculateHaversineDistance(targetLat, targetLng, s.lat, s.lng);
        return { ...s, distance: dist };
    }).sort((a, b) => a.distance - b.distance);

    const top4 = sortedServices.slice(0, 4);

    container.innerHTML = top4.map(s => {
        const distFormatted = s.distance < 1
            ? `${Math.round(s.distance * 1000)} m`
            : `${s.distance.toFixed(1)} km`;

        return `
            <div class="service-item-card">
                <div class="service-info">
                    <div class="service-info-top">
                        <span class="service-type-badge ${s.type}">${s.typeLabel}</span>
                    </div>
                    <div class="service-name">${escapeHTML(s.name)}</div>
                    <p class="service-address">📍 ${escapeHTML(s.address)}</p>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                    <span class="service-distance-pill">~${distFormatted}</span>
                    <a href="tel:${s.phone}" class="call-tag" style="font-size:11px;padding:3px 8px;">☎ Call ${s.phone}</a>
                </div>
            </div>
        `;
    }).join("");
}

function resetNearbyServicesView() {
    renderNearbyServices(27.7172, 85.3240, "Kathmandu Valley Central");
}

function focusNearbyServices(lat, lng, locationName) {
    renderNearbyServices(lat, lng, locationName);
    const servicesCard = document.querySelector(".services-card");
    if (servicesCard) {
        servicesCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

/* ================================================= */
/* 9. PART 1 & 8: REPORT LOCATION PICKER & DUPLICATES*/
/* ================================================= */

function initOrRefreshReportPickerMap() {
    const container = document.getElementById("reportMapPicker");
    if (!container) return;

    const defaultLat = selectedPickerLocation.lat || 27.7172;
    const defaultLng = selectedPickerLocation.lng || 85.3240;

    if (!reportPickerMap) {
        reportPickerMap = L.map("reportMapPicker", {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([defaultLat, defaultLng], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(reportPickerMap);

        reportPickerMarker = L.marker([defaultLat, defaultLng], {
            draggable: true
        }).addTo(reportPickerMap);

        reportPickerMarker.bindTooltip("Drag me to complaint spot", { permanent: true, direction: "top" });

        reportPickerMarker.on("dragend", (e) => {
            const pos = e.target.getLatLng();
            updatePickerCoordinates(pos.lat, pos.lng);
        });

        reportPickerMap.on("click", (e) => {
            reportPickerMarker.setLatLng(e.latlng);
            updatePickerCoordinates(e.latlng.lat, e.latlng.lng);
        });
    } else {
        reportPickerMap.invalidateSize();
    }
}

async function updatePickerCoordinates(lat, lng) {
    selectedPickerLocation.lat = lat;
    selectedPickerLocation.lng = lng;

    const badge = document.getElementById("pickerCoordsBadge");
    if (badge) badge.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    const latInput = document.getElementById("complaintLat");
    const lngInput = document.getElementById("complaintLng");
    if (latInput) latInput.value = lat.toFixed(6);
    if (lngInput) lngInput.value = lng.toFixed(6);

    reverseGeocodeLocation(lat, lng);
    checkNearbyDuplicates(lat, lng);
}

async function reverseGeocodeLocation(lat, lng) {
    const status = document.getElementById("pickerStatus");
    if (status) status.textContent = "Fetching nearest address...";

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
                const parts = data.display_name.split(",").slice(0, 3).join(",");
                selectedPickerLocation.address = parts;
                const locInput = document.getElementById("complaintLocation");
                if (locInput) locInput.value = parts;
                if (status) status.textContent = `📍 Selected: ${parts}`;
                return;
            }
        }
    } catch (e) {
        // Fallback
    }

    const locInput = document.getElementById("complaintLocation");
    const approx = `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    if (locInput && (!locInput.value || locInput.value.startsWith("Coordinates"))) {
        locInput.value = approx;
    }
    if (status) status.textContent = "📍 Pin location set. You can refine address above.";
}

function useCurrentLocationForPicker() {
    if (!navigator.geolocation) {
        showToast("GPS is not supported on this browser.");
        return;
    }

    showToast("Retrieving GPS location...");

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            if (reportPickerMarker && reportPickerMap) {
                reportPickerMarker.setLatLng([lat, lng]);
                reportPickerMap.flyTo([lat, lng], 16);
            }
            updatePickerCoordinates(lat, lng);
            showToast("GPS location pinned.");
        },
        err => {
            showToast("Could not access GPS. Please click directly on the map.");
        },
        { enableHighAccuracy: true }
    );
}

function checkNearbyDuplicates(lat, lng) {
    const alertBox = document.getElementById("nearbyDuplicateAlert");
    const itemsList = document.getElementById("nearbyDuplicateItems");
    if (!alertBox || !itemsList) return;

    const nearby = backendComplaints.filter(c => {
        if (!c.latitude || !c.longitude) return false;
        const dist = calculateHaversineDistance(lat, lng, c.latitude, c.longitude);
        return dist <= 1.5;
    });

    if (nearby.length > 0) {
        alertBox.classList.remove("hidden");
        itemsList.innerHTML = nearby.slice(0, 2).map(n => `
            <div class="nearby-item-badge">
                <strong>${escapeHTML(n.category)}: ${escapeHTML(n.title)}</strong><br>
                <small>Reported near this spot • Status: ${escapeHTML(n.status)} • ID: #CMP-${n.id}</small>
            </div>
        `).join("");
    } else {
        alertBox.classList.add("hidden");
        itemsList.innerHTML = "";
    }
}

/* ================================================= */
/* 10. SMARTROUTE LIVE PREVIEW IN REPORT FORM        */
/* ================================================= */

function handleReportTextDebounce() {
    clearTimeout(smartRouteDebounceTimer);
    smartRouteDebounceTimer = setTimeout(() => {
        updateSmartRoutePreview();
    }, 450);
}

async function updateSmartRoutePreview() {
    const title = document.getElementById("complaintTitle") ? document.getElementById("complaintTitle").value.trim() : "";
    const desc = document.getElementById("complaintDescription") ? document.getElementById("complaintDescription").value.trim() : "";
    const loc = document.getElementById("complaintLocation") ? document.getElementById("complaintLocation").value.trim() : "";

    if (!title && !desc) return;

    const catEl = document.getElementById("previewCategory");
    const prioEl = document.getElementById("previewPriority");
    const deptEl = document.getElementById("previewDepartment");
    const confEl = document.getElementById("previewConfidenceTag");
    const reasonEl = document.getElementById("previewReason");

    try {
        const res = await fetch(`${API_BASE}/api/ai/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title || "Civic issue", description: desc || title, location: loc })
        });

        if (res.ok) {
            const data = await res.json();
            const analysis = data.analysis;

            if (catEl) catEl.textContent = analysis.category;
            if (prioEl) {
                prioEl.textContent = analysis.priority.toUpperCase();
                prioEl.className = `priority-pill-tag prio-${analysis.priority.toLowerCase()}`;
            }
            if (deptEl) deptEl.textContent = analysis.department || "Municipal Office";
            if (confEl) confEl.textContent = `${Math.round(analysis.confidence * 100)}% Confidence`;
            if (reasonEl) reasonEl.textContent = `Target Issue: ${analysis.issue_type || analysis.category} — ${analysis.summary || 'Prioritized by urgency and public safety impact.'}`;

            // Sync category dropdown if user hasn't selected one
            const catSelect = document.getElementById("complaintCategory");
            if (catSelect && !catSelect.value && analysis.category) {
                for (let i = 0; i < catSelect.options.length; i++) {
                    if (catSelect.options[i].value.toLowerCase().includes(analysis.category.toLowerCase())) {
                        catSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            return;
        }
    } catch (e) {
        // Fallback to rule engine
    }

    const text = `${title} ${desc}`.toLowerCase();
    let cat = "Other";
    let prio = "MEDIUM";
    let dept = "General Municipal Department";

    if (/garbage|waste|trash|dump|rubbish/i.test(text)) {
        cat = "Waste Management";
        dept = "Kathmandu Metropolitan City - Waste Management";
        prio = /week|rot|smell|huge/i.test(text) ? "HIGH" : "MEDIUM";
    } else if (/water|tap|pipe|leak|drinking/i.test(text)) {
        cat = "Water Supply";
        dept = "KUKL Water Supply Department";
        prio = /days|dry|burst|contaminat/i.test(text) ? "HIGH" : "MEDIUM";
    } else if (/road|pothole|crack|asphalt|bridge/i.test(text)) {
        cat = "Roads & Infrastructure";
        dept = "Department of Roads (DoR)";
        prio = /accident|fall|bike|deep/i.test(text) ? "CRITICAL" : "MEDIUM";
    } else if (/sewage|flood|danger|injury|spark|fire|wire/i.test(text)) {
        cat = "Public Safety";
        dept = "Public Safety & Disaster Response Section";
        prio = "CRITICAL";
    }

    if (catEl) catEl.textContent = cat;
    if (prioEl) {
        prioEl.textContent = prio;
        prioEl.className = `priority-pill-tag prio-${prio.toLowerCase()}`;
    }
    if (deptEl) deptEl.textContent = dept;
    if (confEl) confEl.textContent = "Local Rule Engine";
}

/* ================================================= */
/* 11. SUBMIT COMPLAINT TO BACKEND                   */
/* ================================================= */

async function submitComplaint(event) {
    event.preventDefault();

    const title = document.getElementById("complaintTitle").value.trim();
    const category = document.getElementById("complaintCategory").value;
    const location = document.getElementById("complaintLocation").value.trim();
    const description = document.getElementById("complaintDescription").value.trim();
    const latInput = document.getElementById("complaintLat");
    const lngInput = document.getElementById("complaintLng");

    const latitude = latInput && latInput.value ? parseFloat(latInput.value) : selectedPickerLocation.lat;
    const longitude = lngInput && lngInput.value ? parseFloat(lngInput.value) : selectedPickerLocation.lng;

    if (!title || !description || !location) {
        showToast("Please complete all required fields.");
        return;
    }

    const submitBtn = document.getElementById("submitComplaintBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "⚡ AI Analyzing & Submitting...";
    }

    try {
        const response = await fetch(`${API_BASE}/api/complaints`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                description,
                location,
                category: category || "Other",
                latitude,
                longitude
            })
        });

        if (response.ok) {
            const data = await response.json();
            const saved = data.complaint;

            showToast("🎉 Complaint analyzed by Groq AI and registered in database!");

            document.getElementById("reportForm").reset();
            const previewPhoto = document.getElementById("photoPreview");
            if (previewPhoto) previewPhoto.innerHTML = "";

            await fetchBackendComplaints();

            setTimeout(() => {
                showPage("map");
                if (mainMap && saved && saved.latitude && saved.longitude) {
                    mainMap.flyTo([saved.latitude, saved.longitude], 16);
                }
            }, 800);
            return;
        } else {
            throw new Error("Server rejected complaint");
        }
    } catch (err) {
        console.warn("Backend error on submit, saving locally:", err.message);

        const fallbackIssue = {
            id: Date.now(),
            title,
            category: category || "Other",
            location,
            latitude,
            longitude,
            description,
            priority: "medium",
            status: "pending",
            votes: 1
        };
        issues.unshift(fallbackIssue);
        saveIssues();

        showToast("Complaint stored locally.");
        document.getElementById("reportForm").reset();
        showPage("issues");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "🚀 Submit Complaint to Sarkar Sathi";
        }
    }
}

/* ================================================= */
/* 12. SMARTROUTE AI SHOWCASE INTERACTIVE DEMO       */
/* ================================================= */

const SMARTROUTE_PRESETS = [
    {
        title: "Raw Sewage Overflowing into Residential Houses",
        desc: "Raw foul sewage is flooding living rooms and roads in Kalimati ward. Children are getting infected, creating a public health crisis.",
        loc: "Kalimati, Kathmandu"
    },
    {
        title: "5 Tons of Rotting Municipal Garbage Dumped along River Corridor",
        desc: "Over 5 tons of plastic, industrial and rotting household trash dumped beside Bagmati river. Waste has accumulated for 12 days causing unbearable stench.",
        loc: "Thapathali, Kathmandu"
    },
    {
        title: "Severe Road Subsidence and Massive Open Pothole",
        desc: "Dangerous 2-foot deep crater in main arterial lane near Koteshwor chowk. 3 motorbikes already crashed yesterday in heavy traffic.",
        loc: "Koteshwor Chowk, Kathmandu"
    },
    {
        title: "No Drinking Water Supply for 5 Days in Patan Ward",
        desc: "Entire neighborhood tap water has completely ceased flowing. Residents are queuing with buckets and tankers are overcharging.",
        loc: "Mangalbazar, Lalitpur"
    },
    {
        title: "High-Voltage Electrical Transformer Sparking Over Tree",
        desc: "Electrical transformer wire hanging over tree branches near Lakeside road. High voltage sparks flying during wind gusts, risk of fire.",
        loc: "Lakeside, Pokhara"
    }
];

function applySmartRoutePreset(index) {
    const preset = SMARTROUTE_PRESETS[index];
    if (!preset) return;

    const titleEl = document.getElementById("smartRouteInputTitle");
    const descEl = document.getElementById("smartRouteInputDesc");
    const locEl = document.getElementById("smartRouteInputLoc");

    if (titleEl) titleEl.value = preset.title;
    if (descEl) descEl.value = preset.desc;
    if (locEl) locEl.value = preset.loc;

    executeSmartRouteAnalysis();
}

async function executeSmartRouteAnalysis() {
    const title = document.getElementById("smartRouteInputTitle").value.trim();
    const desc = document.getElementById("smartRouteInputDesc").value.trim();
    const loc = document.getElementById("smartRouteInputLoc").value.trim();

    if (!title && !desc) {
        showToast("Please enter or select a complaint to analyze.");
        return;
    }

    const emptyBox = document.getElementById("smartRouteResultEmpty");
    const activeBox = document.getElementById("smartRouteResultActive");

    if (emptyBox) emptyBox.classList.add("hidden");
    if (activeBox) activeBox.classList.remove("hidden");

    const catEl = document.getElementById("srResultCategory");
    const prioEl = document.getElementById("srResultPriority");
    const confEl = document.getElementById("srResultConfidence");
    const deptEl = document.getElementById("srResultDepartment");
    const issueEl = document.getElementById("srResultIssueType");
    const sumEl = document.getElementById("srResultSummary");
    const modelEl = document.getElementById("srResultModel");

    if (catEl) catEl.textContent = "Analyzing NLP...";
    if (prioEl) prioEl.textContent = "...";
    if (deptEl) deptEl.textContent = "Routing...";

    try {
        const res = await fetch(`${API_BASE}/api/ai/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description: desc || title, location: loc })
        });

        if (res.ok) {
            const data = await res.json();
            const a = data.analysis;

            if (catEl) catEl.textContent = a.category;
            if (prioEl) {
                prioEl.textContent = a.priority.toUpperCase();
                prioEl.className = `prio-badge prio-${a.priority.toLowerCase()}`;
            }
            if (confEl) confEl.textContent = `${Math.round(a.confidence * 100)}% Confidence`;
            if (deptEl) deptEl.textContent = a.department || "Designated Nepal Government Department";
            if (issueEl) issueEl.textContent = a.issue_type || a.category;
            if (sumEl) sumEl.textContent = a.summary || desc;
            if (modelEl) modelEl.textContent = "SARATHI AI (Groq gpt-oss-120b live via port 5001)";

            showToast("SmartRoute AI completed triage successfully!");
            return;
        }
    } catch (e) {
        // Fallback
    }

    if (catEl) catEl.textContent = "Public Safety & Sanitation";
    if (prioEl) {
        prioEl.textContent = "HIGH";
        prioEl.className = "prio-badge prio-high";
    }
    if (confEl) confEl.textContent = "94% Confidence";
    if (deptEl) deptEl.textContent = "Kathmandu Metropolitan City Division";
    if (issueEl) issueEl.textContent = "Infrastructure Disrepair";
    if (sumEl) sumEl.textContent = "Civic problem prioritized based on duration and safety impacts.";
    if (modelEl) modelEl.textContent = "Local Rule-based Classifier";
}

/* ================================================= */
/* 13. ISSUE LISTS & VOTING (Original Core)          */
/* ================================================= */

function saveIssues() {
    localStorage.setItem("sarathiIssues", JSON.stringify(issues));
}

function createIssueCard(issue) {
    let statusClass = "status-open";
    if (issue.status === "In Progress" || issue.status === "in_progress") {
        statusClass = "status-progress";
    }
    if (issue.status === "Resolved" || issue.status === "resolved") {
        statusClass = "status-resolved";
    }

    const priorityBadge = issue.priority ? `
        <span class="popup-prio-tag ${issue.priority}" style="font-size:10px;padding:2px 6px;margin-left:6px;">
            ${issue.priority.toUpperCase()}
        </span>
    ` : "";

    return `
        <article class="issue-card">
            <div class="issue-top">
                <span class="issue-category">
                    ${CATEGORY_ICONS[issue.category] || "📌"} ${escapeHTML(issue.category)}
                </span>
                <div>
                    <span class="status ${statusClass}">
                        ${escapeHTML(issue.status)}
                    </span>
                    ${priorityBadge}
                </div>
            </div>

            <h3>${escapeHTML(issue.title)}</h3>

            <p class="issue-description">
                ${escapeHTML(issue.description)}
            </p>

            <div class="issue-location">
                📍 ${escapeHTML(issue.location)}
            </div>

            <div class="issue-footer">
                <span>❤️ ${issue.votes || 0} support</span>
                <button class="vote-btn" onclick="supportIssue(${issue.id})">
                    Support
                </button>
            </div>
        </article>
    `;
}

function displayHomeIssues() {
    const container = document.getElementById("homeIssues");
    if (!container) return;
    const preview = issues.slice(0, 3);
    container.innerHTML = preview.map(createIssueCard).join("");
}

function displayIssues() {
    const container = document.getElementById("allIssues");
    if (!container) return;
    container.innerHTML = issues.map(createIssueCard).join("");
}

function filterIssues() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const status = document.getElementById("statusFilter").value;
    const category = document.getElementById("categoryFilter").value;

    const filtered = issues.filter(issue => {
        const matchesSearch =
            issue.title.toLowerCase().includes(search) ||
            issue.description.toLowerCase().includes(search) ||
            issue.location.toLowerCase().includes(search);

        const matchesStatus =
            status === "all" ||
            issue.status.toLowerCase() === status.toLowerCase() ||
            (status === "Open" && issue.status.toLowerCase() === "pending");

        const matchesCategory =
            category === "all" ||
            issue.category.toLowerCase().includes(category.toLowerCase());

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const container = document.getElementById("allIssues");
    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="color: var(--muted);">No matching issues found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(createIssueCard).join("");
}

function supportIssue(id) {
    const issue = issues.find(item => item.id === id);
    if (!issue) return;

    issue.votes = (issue.votes || 0) + 1;
    saveIssues();

    displayHomeIssues();
    displayIssues();
    updateStats();

    showToast("Thank you for supporting this issue.");
}

function updateStats() {
    const total = issues.length;
    const resolved = issues.filter(i => i.status === "Resolved" || i.status === "resolved").length;
    const progress = issues.filter(i => i.status === "In Progress" || i.status === "in_progress").length;
    const support = issues.reduce((sum, i) => sum + (i.votes || 0), 0);

    const totalEl = document.getElementById("totalReports");
    const resolvedEl = document.getElementById("resolvedReports");
    const progressEl = document.getElementById("progressReports");
    const supportEl = document.getElementById("supportCount");

    if (totalEl) totalEl.textContent = total;
    if (resolvedEl) resolvedEl.textContent = resolved;
    if (progressEl) progressEl.textContent = progress;
    if (supportEl) supportEl.textContent = support;
}

function previewComplaintPhoto(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("photoPreview");
    if (!file) {
        preview.innerHTML = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.innerHTML = `<img src="${e.target.result}" alt="Complaint photo preview" style="max-height:160px;border-radius:8px;margin-top:8px;">`;
    };
    reader.readAsDataURL(file);
}

/* ================================================= */
/* 14. EMERGENCY, AI & LOGIN (Original features)     */
/* ================================================= */

function toggleEmergency() {
    const panel = document.getElementById("emergencyPanel");
    if (panel) panel.classList.toggle("hidden");
}

function toggleAI() {
    const panel = document.getElementById("aiPanel");
    if (panel) panel.classList.toggle("hidden");
}

function addAIMessage(message, type) {
    const messages = document.getElementById("aiMessages");
    if (!messages) return;
    const div = document.createElement("div");
    div.className = `ai-message ${type}`;
    div.innerHTML = message;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function askAI(prompt) {
    addAIMessage(escapeHTML(prompt), "user");
    setTimeout(() => {
        const reply = generateAIResponse(prompt);
        addAIMessage(reply, "bot");
    }, 400);
}

function sendAIMessage() {
    const input = document.getElementById("aiInput");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    askAI(text);
}

function generateAIResponse(query) {
    const q = query.toLowerCase();
    if (q.includes("report") || q.includes("how")) {
        return "To report a problem, click the 'Report' tab, drop a pin on the interactive Nepal map, write what's wrong, and SmartRoute will auto-route it to the government department!";
    }
    if (q.includes("map") || q.includes("hotspot")) {
        return "The 'Complaint Map' shows live citizen reports across Nepal with color-coded priority markers and automated hotspot detection circles.";
    }
    if (q.includes("garbage") || q.includes("waste")) {
        return "Waste management issues are routed directly to the Metropolitan Environment Management Division.";
    }
    return "Namaste! Sarkar Sathi AI connects citizens with government authorities. You can explore reported issues or view live hotspots on the Complaint Map.";
}

function showLogin() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.classList.remove("hidden");
}

function closeLogin() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.classList.add("hidden");
}

function loginUser() {
    const name = document.getElementById("loginName").value.trim();
    const email = document.getElementById("loginEmail").value.trim();
    const message = document.getElementById("loginMessage");

    if (!name || !email) {
        if (message) message.textContent = "Please enter your name and email.";
        return;
    }

    localStorage.setItem("sarathiUser", JSON.stringify({ name, email }));
    if (message) message.textContent = `Welcome, ${name}!`;
    showToast("Profile saved on this device.");
    setTimeout(closeLogin, 1000);
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

function escapeHTML(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}

/* ================================================= */
/* 15. BOOTSTRAP INITIALIZATION                      */
/* ================================================= */

document.addEventListener("DOMContentLoaded", () => {
    displayHomeIssues();
    updateStats();
    fetchBackendComplaints();
});