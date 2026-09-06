const STORAGE_KEY = "sarathi_smart_complaints_v1";

const departments = {
  "Waste Management": "Sanitation Department",
  "Road Damage": "Road Maintenance",
  "Streetlight": "Electrical Department",
  "Water Supply": "Water Supply Department",
  "Public Safety": "Public Safety Department",
  "Drainage": "Drainage Department",
  "Infrastructure": "Infrastructure Department",
  "Other": "General Municipal Department"
};

const rules = [
  {
    category: "Waste Management",
    words: ["garbage", "waste", "trash", "rubbish", "dump", "litter", "bin", "sewage"],
    reason: "Waste-related terms were detected."
  },
  {
    category: "Road Damage",
    words: ["pothole", "road", "street", "crack", "broken road", "accident", "bike fell", "motorcycle fell"],
    reason: "Road or transport-safety terms were detected."
  },
  {
    category: "Streetlight",
    words: ["streetlight", "street light", "lamp", "light is off", "dark street", "electric pole"],
    reason: "Street lighting terms were detected."
  },
  {
    category: "Water Supply",
    words: ["water", "tap", "pipe", "leak", "drinking water", "no water"],
    reason: "Water-supply terms were detected."
  },
  {
    category: "Public Safety",
    words: ["fire", "danger", "unsafe", "crime", "theft", "accident", "emergency", "fallen", "injury"],
    reason: "Public-safety or emergency terms were detected."
  },
  {
    category: "Drainage",
    words: ["drain", "drainage", "flood", "flooded", "waterlogging", "blocked drain"],
    reason: "Drainage or flooding terms were detected."
  },
  {
    category: "Infrastructure",
    words: ["building", "bridge", "footpath", "sidewalk", "park", "public toilet", "infrastructure"],
    reason: "General infrastructure terms were detected."
  }
];

const priorityWords = {
  critical: ["fire", "emergency", "danger", "life threatening", "injury", "fallen", "accident", "electrical shock"],
  high: ["huge", "major", "blocked", "flooded", "unsafe", "school", "hospital", "days", "week", "severe", "smells terrible"],
  medium: ["broken", "leak", "not working", "damaged", "overflow", "dirty"],
  low: ["minor", "small", "suggestion", "cosmetic"]
};

let selectedLocation = null;
let latestAnalysis = null;
let map;
let markers = [];

function getComplaints() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveComplaints(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function analyzeComplaint(text) {
  const input = text.toLowerCase().trim();
  if (!input) return null;

  let best = { category: "Other", score: 0, reason: "No strong category keyword was detected." };

  for (const rule of rules) {
    let score = 0;
    rule.words.forEach(word => {
      if (input.includes(word)) score += word.length > 5 ? 2 : 1;
    });
    if (score > best.score) {
      best = { category: rule.category, score, reason: rule.reason };
    }
  }

  let priority = "low";
  let priorityScore = 0;
  for (const [level, words] of Object.entries(priorityWords)) {
    let score = 0;
    words.forEach(word => { if (input.includes(word)) score += word.length > 6 ? 2 : 1; });
    if (score > priorityScore) {
      priority = level;
      priorityScore = score;
    }
  }

  if (input.length > 120 && priority === "low") priority = "medium";

  const confidence = Math.min(
    99,
    Math.max(72, 76 + best.score * 7 + Math.min(priorityScore * 3, 15))
  );

  return {
    category: best.category,
    priority: priority.toUpperCase(),
    department: departments[best.category],
    confidence,
    reason: best.reason
  };
}

function priorityClass(priority) {
  return priority.toLowerCase();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function renderStats() {
  const complaints = getComplaints();
  document.getElementById("liveCount").textContent = complaints.length;
  document.getElementById("totalStat").textContent = complaints.length;
  document.getElementById("criticalStat").textContent = complaints.filter(c => c.priority === "CRITICAL").length;
  document.getElementById("highStat").textContent = complaints.filter(c => c.priority === "HIGH").length;
  document.getElementById("resolvedStat").textContent = complaints.filter(c => c.status === "Resolved").length;
}

function renderTable() {
  const complaints = getComplaints();
  const tbody = document.getElementById("complaintsTable");

  if (!complaints.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No complaints yet. Analyze one above.</td></tr>';
    return;
  }

  tbody.innerHTML = complaints.slice().reverse().map(c => `
    <tr>
      <td>${escapeHtml(c.text.slice(0, 60))}${c.text.length > 60 ? "…" : ""}</td>
      <td>${escapeHtml(c.category)}</td>
      <td><span class="priority ${priorityClass(c.priority)}">${escapeHtml(c.priority)}</span></td>
      <td>${escapeHtml(c.department)}</td>
      <td>${escapeHtml(c.status)}</td>
    </tr>
  `).join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[ch]));
}

function markerIcon(priority) {
  const color = { CRITICAL: "#e5484d", HIGH: "#f59e0b", MEDIUM: "#315efb", LOW: "#20a05a" }[priority] || "#315efb";
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function refreshMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  getComplaints().forEach(c => {
    if (typeof c.lat !== "number" || typeof c.lng !== "number") return;
    const marker = L.marker([c.lat, c.lng], { icon: markerIcon(c.priority) }).addTo(map);
    marker.bindPopup(`
      <strong>${escapeHtml(c.category)}</strong><br>
      Priority: <b>${escapeHtml(c.priority)}</b><br>
      Department: ${escapeHtml(c.department)}<br>
      <small>${escapeHtml(c.text)}</small>
    `);
    markers.push(marker);
  });
}

function initMap() {
  map = L.map("map").setView([27.7172, 85.3240], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  refreshMap();
}

document.getElementById("analyzeBtn").addEventListener("click", () => {
  const text = document.getElementById("complaintText").value;
  const analysis = analyzeComplaint(text);

  if (!analysis) {
    showToast("Please enter a complaint first.");
    return;
  }

  latestAnalysis = { ...analysis, text };
  document.getElementById("categoryResult").textContent = analysis.category;
  document.getElementById("priorityResult").textContent = analysis.priority;
  document.getElementById("departmentResult").textContent = analysis.department;
  document.getElementById("confidenceResult").textContent = `${analysis.confidence}%`;
  document.getElementById("reasonResult").textContent =
    `${analysis.reason} Priority was estimated from urgency, safety, duration, and impact keywords.`;
  document.getElementById("result").classList.remove("hidden");
  showToast("Complaint analyzed successfully.");
});

document.getElementById("locationBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by this browser.");
    return;
  }

  document.getElementById("locationText").textContent = "Getting your location…";
  navigator.geolocation.getCurrentPosition(
    pos => {
      selectedLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      document.getElementById("locationText").textContent =
        `📍 Location selected: ${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`;
      map.setView([selectedLocation.lat, selectedLocation.lng], 16);
      showToast("Location captured.");
    },
    () => {
      document.getElementById("locationText").textContent =
        "Location permission was denied. A demo location will be used if you add the complaint.";
      showToast("Could not access GPS.");
    }
  );
});

document.getElementById("addComplaintBtn").addEventListener("click", () => {
  if (!latestAnalysis) return;

  const location = selectedLocation || { lat: 27.7172, lng: 85.3240 };
  const complaint = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...latestAnalysis,
    lat: location.lat,
    lng: location.lng,
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  const complaints = getComplaints();
  complaints.push(complaint);
  saveComplaints(complaints);

  renderStats();
  renderTable();
  refreshMap();
  map.setView([complaint.lat, complaint.lng], 15);
  showToast("Complaint added to the Smart Map.");

  document.getElementById("complaintText").value = "";
  document.getElementById("result").classList.add("hidden");
  latestAnalysis = null;
});

document.getElementById("clearBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderStats();
  renderTable();
  refreshMap();
  showToast("Local demo data cleared.");
});

initMap();
renderStats();
renderTable();
