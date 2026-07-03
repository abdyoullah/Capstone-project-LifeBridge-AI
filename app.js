// --- App State & Seeding Data ---
let map;
let markerLayers = {
    shelter: L.layerGroup(),
    hazard: L.layerGroup(),
    medical: L.layerGroup()
};

// Low Bandwidth Mode Flag
let lowBandwidthMode = false;

// Shared Chat & Map elements
let activeView = 'dashboard';
let activeChecklistTab = 'flood';
let voiceOutputEnabled = false;
let selectedShelterId = null;
let mapReportMarker = null;
let currentRouteLine = null;

// Multi-Disaster Scenario Database
const disasterData = {
    cyclone: {
        name: "Karachi Cyclone (Category 4)",
        coords: [24.8600, 67.0350],
        zoom: 12,
        statusTicker: "CYCLONE STATUS : 86°F | Heavy Rain, High Winds. Storm Surge expected near Seaview.",
        threatBadge: "URGENT | CYCLONE",
        metrics: {
            threat: "EXTREME",
            threatDesc: "Active storm surge & coastal wind damage",
            shelters: "3 Active",
            occupancy: "64% Avg Occupancy",
            hazards: "3 Blocked",
            hazardsDesc: "3 Total Hazards Tracked",
            resources: 24
        },
        chatGreeting: "Hello! I am your LifeBridge Pakistan Assistant. I have loaded real-time details for the Karachi Cyclone (Category 4) incident. Ask me about shelters, roadblocks, JPMC, or emergency contacts like Rescue 1122 and Edhi!",
        chatSuggestions: [
            "Where is the nearest shelter?",
            "Are any roads blocked?",
            "What is JPMC helpline?",
            "What are the emergency numbers?"
        ],
        shelters: [
            { id: 1, name: "Lyari Multipurpose Hall", coords: [24.8680, 66.9920], capacity: 150, maxCapacity: 200, status: "Normal Operations", supplies: { water: 85, food: 60, medicine: 40, blankets: 70 } },
            { id: 2, name: "DHA Creek Club Relief Camp", coords: [24.8220, 67.0480], capacity: 390, maxCapacity: 400, status: "Critical Capacity", supplies: { water: 20, food: 35, medicine: 15, blankets: 30 } },
            { id: 3, name: "Karachi Expo Centre (Super Shelter)", coords: [24.9000, 67.0680], capacity: 1200, maxCapacity: 2500, status: "Rapid Intake", supplies: { water: 100, food: 100, medicine: 100, blankets: 100 } },
            { id: 4, name: "Nazimabad Gymkhana Hall", coords: [24.9120, 67.0300], capacity: 45, maxCapacity: 100, status: "Normal Operations", supplies: { water: 90, food: 95, medicine: 80, blankets: 90 } }
        ],
        hospitals: [
            { id: 5, name: "Jinnah Postgraduate Medical Centre (JPMC)", coords: [24.8510, 67.0330], capacity: "Online - 12 critical beds open", phone: "+92-21-99201300" },
            { id: 6, name: "Civil Hospital Karachi (Dr. Ruth Pfau)", coords: [24.8600, 67.0100], capacity: "Online - 5 beds open", phone: "+92-21-99215740" },
            { id: 7, name: "Aga Khan University Hospital (AKUH)", coords: [24.8920, 67.0760], capacity: "Online - 18 beds open", phone: "+92-21-111-911-911" }
        ],
        hazards: [
            { id: 8, name: "Korangi Causeway Flooding", coords: [24.8150, 67.0380], type: "hazard", severity: "Critical", desc: "Malir River overflow has completely flooded the causeway. Impassable for all vehicles." },
            { id: 9, name: "Lyari Expressway Bridge Collapse", coords: [24.8800, 67.0350], type: "roadblock", severity: "Critical", desc: "Structural failure near Garden interchange. Closed until engineering assessment." },
            { id: 10, name: "Clifton Sunset Blvd Downed Power Lines", coords: [24.8350, 67.0280], type: "hazard", severity: "Warning", desc: "High-voltage transmission line snapped on road. KE crews dispatched." }
        ],
        nodes: {
            "N1": { name: "Saddar Transit Hub", coords: [24.8530, 67.0160] },
            "N2": { name: "DHA / Clifton Gateway", coords: [24.8220, 67.0480] },
            "N3": { name: "Gulshan / Civic Centre", coords: [24.9000, 67.0680] },
            "N4": { name: "Lyari Community Hub", coords: [24.8680, 66.9920] },
            "N5": { name: "Seaview Beach Gateway", coords: [24.7980, 67.0320] },
            "N6": { name: "Karsaz Rescue Command", coords: [24.8820, 67.0820] },
            "N7": { name: "Nazimabad Aid Post", coords: [24.9120, 67.0300] }
        },
        edges: [
            { from: "N1", to: "N3", name: "Shahrah-e-Faisal Expressway", hazardId: 9 },
            { from: "N1", to: "N5", name: "Clifton Road Link", hazardId: 10 },
            { from: "N1", to: "N2", name: "Korangi Road Link", hazardId: 8 },
            { from: "N2", to: "N5", name: "Beach Avenue Parkway", hazardId: null },
            { from: "N3", to: "N4", name: "Lyari Expressway Link", hazardId: null },
            { from: "N3", to: "N7", name: "University Road Link", hazardId: null },
            { from: "N4", to: "N6", name: "Karsaz Rashid Minhas Road Link", hazardId: null },
            { from: "N5", to: "N6", name: "Seaview Karsaz Safe Connector", hazardId: null }
        ]
    },
    earthquake: {
        name: "Kashmir Earthquake (M7.6)",
        coords: [34.3700, 73.4700],
        zoom: 13,
        statusTicker: "EARTHQUAKE STATUS : 52°F | Tremors Active, High Dust. Landslides blocking highways.",
        threatBadge: "URGENT | EARTHQUAKE",
        metrics: {
            threat: "CRITICAL",
            threatDesc: "Active aftershocks & severe landslide risks",
            shelters: "2 Active",
            occupancy: "72% Avg Occupancy",
            hazards: "2 Blocked",
            hazardsDesc: "2 Landslides Blockages Tracked",
            resources: 18
        },
        chatGreeting: "Hello! I am your LifeBridge emergency responder. I have loaded details for the Kashmir Earthquake (M7.6) response in Muzaffarabad. Ask me about Bagh or Balakot camps, field hospitals, or landslide blockages.",
        chatSuggestions: [
            "Are any roads blocked?",
            "Where is the nearest shelter?",
            "Show medical centers",
            "Kashmir emergency numbers"
        ],
        shelters: [
            { id: 1, name: "Muzaffarabad University Camp", coords: [34.3700, 73.4800], capacity: 620, maxCapacity: 800, status: "Normal Operations", supplies: { water: 70, food: 50, medicine: 80, blankets: 90 } },
            { id: 2, name: "Balakot Foothills Shelter", coords: [34.5400, 73.3600], capacity: 290, maxCapacity: 300, status: "Critical Capacity", supplies: { water: 15, food: 20, medicine: 10, blankets: 40 } },
            { id: 3, name: "Bagh Community Relief Base", coords: [33.9700, 73.7800], capacity: 80, maxCapacity: 200, status: "Normal Operations", supplies: { water: 95, food: 85, medicine: 70, blankets: 80 } }
        ],
        hospitals: [
            { id: 5, name: "Abbas Institute of Medical Sciences (AIMS)", coords: [34.3620, 73.4720], capacity: "Online - 8 trauma beds open", phone: "+92-5822-921003" },
            { id: 6, name: "Field Hospital Muzaffarabad", coords: [34.3550, 73.4550], capacity: "Online - 14 general beds open", phone: "+92-5822-1122" }
        ],
        hazards: [
            { id: 8, name: "Neelum Valley Landslide Blockage", coords: [34.4500, 73.5200], type: "hazard", severity: "Critical", desc: "Massive debris mudslide. Road blocked. Heavy machinery en route." },
            { id: 9, name: "Jhelum River Bridge Collapse", coords: [34.3680, 73.4650], type: "roadblock", severity: "Critical", desc: "Bridge structural failure. Completely closed to vehicular transit." }
        ],
        nodes: {
            "N1": { name: "Muzaffarabad Transit Hub", coords: [34.3600, 73.4600] },
            "N2": { name: "Balakot Relief Center", coords: [34.5400, 73.3600] },
            "N3": { name: "Bagh Medical Outpost", coords: [33.9700, 73.7800] },
            "N4": { name: "Garhi Habibullah Hub", coords: [34.4100, 73.3800] },
            "N5": { name: "Neelum Valley Camp", coords: [34.4500, 73.5200] }
        },
        edges: [
            { from: "N1", to: "N5", name: "Neelum Valley Highway", hazardId: 8 },
            { from: "N1", to: "N4", name: "Garhi Road River Bridge", hazardId: 9 },
            { from: "N4", to: "N2", name: "Balakot Valley Highway Link", hazardId: null },
            { from: "N1", to: "N3", name: "Bagh Mountain Link Road", hazardId: null }
        ]
    },
    floods: {
        name: "Sindh River Monsoon Floods",
        coords: [27.7000, 68.8500],
        zoom: 12,
        statusTicker: "FLOOD STATUS : 94°F | River Indus Rising rapidly. Barrage monitoring active.",
        threatBadge: "CRITICAL | FLOODS",
        metrics: {
            threat: "HIGH",
            threatDesc: "River breach risks & sub-district flooding",
            shelters: "3 Active",
            occupancy: "58% Avg Occupancy",
            hazards: "2 Blocked",
            hazardsDesc: "2 Submerged roads tracked",
            resources: 35
        },
        chatGreeting: "Hello! I am your LifeBridge assistant. I have loaded logs for the Sindh River Floods in Sukkur & Larkana. Ask me about Barrage safety, Larkana field clinics, or flooded highways.",
        chatSuggestions: [
            "Show active flood zones",
            "Where is the nearest shelter?",
            "Is Sukkur Barrage safe?",
            "Sindh helpline numbers"
        ],
        shelters: [
            { id: 1, name: "Sukkur Public School Relief Camp", coords: [27.7100, 68.8600], capacity: 420, maxCapacity: 600, status: "Normal Operations", supplies: { water: 50, food: 40, medicine: 30, blankets: 60 } },
            { id: 2, name: "Larkana Sports Complex Shelter", coords: [27.5600, 68.2100], capacity: 340, maxCapacity: 500, status: "Normal Operations", supplies: { water: 65, food: 55, medicine: 45, blankets: 50 } },
            { id: 3, name: "Khairpur Relief Center", coords: [27.5300, 68.7600], capacity: 90, maxCapacity: 300, status: "Normal Operations", supplies: { water: 80, food: 75, medicine: 60, blankets: 75 } }
        ],
        hospitals: [
            { id: 5, name: "Civil Hospital Sukkur", coords: [27.7020, 68.8450], capacity: "Online - 15 beds available", phone: "+92-71-9310123" },
            { id: 6, name: "Larkana Medical University Hospital", coords: [27.5550, 68.2050], capacity: "Online - 9 beds available", phone: "+92-74-9410789" }
        ],
        hazards: [
            { id: 8, name: "National Highway N-5 Sukkur Flood Zone", coords: [27.6500, 68.8800], type: "hazard", severity: "Critical", desc: "Highway submerged under 3.5ft water near bypass. Impassable." },
            { id: 9, name: "Larkana Bypass Flooded", coords: [27.5400, 68.2200], type: "roadblock", severity: "Critical", desc: "Sewerage overflow & river backwater. Road closed to standard vehicles." }
        ],
        nodes: {
            "N1": { name: "Sukkur Barrage Command", coords: [27.6900, 68.8300] },
            "N2": { name: "Khairpur Transit Station", coords: [27.5200, 68.7500] },
            "N3": { name: "Larkana Relief Base", coords: [27.5500, 68.2000] },
            "N4": { name: "Rohri Junction Hub", coords: [27.6800, 68.9000] },
            "N5": { name: "Pano Aqil Safe Base", coords: [27.8500, 69.1000] }
        },
        edges: [
            { from: "N1", to: "N2", name: "Sindh Indus Highway Link", hazardId: 8 },
            { from: "N3", to: "N1", name: "Larkana Sukkur Bypass Link", hazardId: 9 },
            { from: "N1", to: "N4", name: "Sukkur Rohri Bridge Link", hazardId: null },
            { from: "N4", to: "N5", name: "National Highway N-5 North Link", hazardId: null }
        ]
    }
};

// Current active app data pointer
let appData = disasterData.cyclone;
let currentMode = "cyclone";

// --- Supply Matching Data ---
let supplyNeeds = [
    { id: 101, shelter: "Karachi Expo Centre", category: "blankets", item: "Space Blankets & Cots", qty: "300 Units", status: "Unmatched" },
    { id: 102, shelter: "Lyari Multipurpose Hall", category: "medicine", item: "First Aid & Medical Kits", qty: "50 Kits", status: "Unmatched" },
    { id: 103, shelter: "DHA Creek Club Relief Camp", category: "water", item: "Drinking Water Reserve", qty: "100 Cases", status: "Unmatched" }
];

let supplyOffers = [
    { id: 201, donor: "Imran Khan (KHI)", category: "blankets", item: "Space Blankets", qty: "150 Units", loc: "Gulshan, Karachi", notes: "Ready for self-pickup, thick thermal material.", status: "Available" },
    { id: 202, donor: "Zainab Welfare Trust", category: "medicine", item: "First Aid & Burn Kits", qty: "30 Kits", loc: "Saddar, Karachi", notes: "Can dispatch via ambulance service immediately.", status: "Available" },
    { id: 203, donor: "Ayesha Siddiqui", category: "water", item: "Mineral Water (Nestle)", qty: "200 Packs", loc: "Clifton, Karachi", notes: "Clean sealed mineral water bottles.", status: "Available" }
];

let supplyMatches = [];

// --- Safety Registry Database (Localstorage) ---
let safetyRecords = [];

// --- Volunteer Tasks Database ---
let volunteerTasks = [
    { id: 1, title: "Sort Ration Bags at Karachi Expo Centre", loc: "Karachi Expo Centre Hall 3", priority: "High", qty: 4, claimed: 1, desc: "Unload delivery trucks and pack MRE ration bags for families.", status: "In Progress" },
    { id: 2, title: "Deliver Medical Kits to Lyari Shelter", loc: "Lyari Multipurpose Hall", priority: "High", qty: 2, claimed: 0, desc: "Transport first aid boxes from JPMC dispatch to Lyari shelter post.", status: "Pending" },
    { id: 3, title: "Clear Debris on Sunset Boulevard Clifton", loc: "Sunset Blvd near DHA", priority: "Medium", qty: 6, claimed: 2, desc: "Clear fallen power poles and tree branches to let relief vehicles pass.", status: "In Progress" },
    { id: 4, title: "Set up cots at Nazimabad Gymkhana", loc: "Nazimabad Gymkhana Hall", priority: "Low", qty: 3, claimed: 3, desc: "Assemble space blankets and canvas cots for incoming evacuees.", status: "Completed" }
];

// Checklists Inventory
const checklists = {
    flood: [
        "Emergency drinking water (3 gallons per person)",
        "Non-perishable food (3-day supply) and manual can opener",
        "Waterproof flashlight with extra batteries",
        "First aid kit containing essential medication",
        "Waterproof bags for personal documents and electronics",
        "Battery-powered or hand-crank weather radio",
        "Emergency space blankets and whistle"
    ],
    earthquake: [
        "Sturdy closed-toe shoes and thick work gloves",
        "First aid kit and prescription medications",
        "Flashlight and lightsticks next to bed",
        "Dust masks (N95) for air quality protection",
        "Wrench or pliers to turn off gas valves",
        "Canned food and bottled water (3-day supply)",
        "Warm blankets and extra clothing layers"
    ],
    cyclone: [
        "Heavy-duty plastic sheeting and duct tape for windows",
        "Flashlights, lanterns, and portable power banks",
        "Non-perishable ready-to-eat foods (5-day supply)",
        "Sufficient infant supplies or specialized senior care kits",
        "Utility multi-tool and fire extinguisher",
        "Rain gear, heavy boots, and emergency blankets",
        "Fully-charged UHF radio or local helpline booklet"
    ]
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Safety Registry from localStorage if exists
    if (localStorage.getItem("lifebridge_safety_records")) {
        safetyRecords = JSON.parse(localStorage.getItem("lifebridge_safety_records"));
    } else {
        // Seed safety records
        safetyRecords = [
            { name: "Muhammad Ali", loc: "Karachi Expo Centre Shelter", status: "Safe / Sheltered", contact: "0300-1234567", family: "Wife and 2 children", notes: "Relocated from Clifton low-lying area. Doing well." },
            { name: "Fatima Bhutto", loc: "DHA Block 5, Karachi", status: "Safe / At Home", contact: "0321-7654321", family: "Parents", notes: "Sheltering in place. High floor. Has electricity." },
            { name: "Kamran Akmal", loc: "Gulshan-e-Iqbal, Karachi", status: "Safe / At Home", contact: "0333-9876543", family: "Alone", notes: "Safe. Water entered street but house is dry." },
            { name: "Zainab Bibi", loc: "Lyari Shelter", status: "Safe / Sheltered", contact: "0345-1112223", family: "Daughter", notes: "Shifted by Rescue 1122. Needs regular diabetic medicines." }
        ];
        localStorage.setItem("lifebridge_safety_records", JSON.stringify(safetyRecords));
    }

    // 2. Initialize Shared Chatbot Element
    const sharedChatTemplate = document.getElementById("shared-chat-template");
    const chatNode = sharedChatTemplate.querySelector("#main-chat-element");

    // Initially insert chat element into the dashboard chat preview
    document.getElementById("dashboard-chat-container").appendChild(chatNode);

    // 3. Initialize Map & Subcomponents
    initMap();
    setDisasterMode("cyclone");

    // Renders for functional view layouts
    loadChecklist();
    renderSupplyHub();
    renderSafetyRegistry();
    renderVolunteerTasks();

    // Make sure Lucide icons are initialized
    lucide.createIcons();
});

// Initialize Leaflet Map
function initMap() {
    map = L.map("map", {
        zoomControl: true,
        minZoom: 4,
        maxZoom: 17
    }).setView(appData.coords, appData.zoom);

    // CartoDB Dark Matter map tiles for premium control room look
    const tiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Add custom offline control badge
    const OfflineControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function () {
            const div = L.DomUtil.create('div', 'leaflet-offline-badge');
            div.innerHTML = '<span style="display:inline-block; width:6px; height:6px; background:#ef4444; border-radius:50%; margin-right:6px; vertical-align:middle; box-shadow:0 0 6px #ef4444;"></span>OFFLINE MAP ACTIVE';
            div.style.background = 'rgba(11, 17, 30, 0.85)';
            div.style.border = '1px solid rgba(239, 68, 68, 0.4)';
            div.style.color = '#ff8a8a';
            div.style.padding = '4px 8px';
            div.style.borderRadius = '4px';
            div.style.fontSize = '0.65rem';
            div.style.fontWeight = '800';
            div.style.letterSpacing = '0.05em';
            div.style.fontFamily = 'var(--font-heading)';
            div.style.backdropFilter = 'blur(4px)';
            div.style.display = 'none'; // hidden by default
            div.id = 'map-offline-badge';
            return div;
        }
    });
    map.addControl(new OfflineControl());

    // Show badge on tile error or if browser navigator is offline
    tiles.on('tileerror', () => {
        showOfflineMapBadge();
    });

    if (!navigator.onLine) {
        showOfflineMapBadge();
    }

    markerLayers.shelter.addTo(map);
    markerLayers.hazard.addTo(map);
    markerLayers.medical.addTo(map);

    // Handle map clicks to log incidents
    map.on("click", (e) => {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);

        // Auto switch to Shelters & Roads view to report, or report via chatbot alert
        if (mapReportMarker) {
            mapReportMarker.setLatLng(e.latlng);
        } else {
            const redPin = L.divIcon({
                className: 'custom-leaflet-marker',
                html: '<div style="background-color: #ef4444; border: 2px solid white; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 10px #ef4444;"></div>',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });
            mapReportMarker = L.marker(e.latlng, { icon: redPin }).addTo(map);
        }

        // Inform user in chatbot
        addChatMessage("assistant", `Map location pinned: [${lat}, ${lng}]. You can type details here or trigger SOS to request aid at this coordinate.`);
    });
}

function showOfflineMapBadge() {
    const badge = document.getElementById('map-offline-badge');
    if (badge) {
        badge.style.display = 'block';
    }
}

// Set Disaster Scenario Mode (Karachi, Kashmir, Sindh)
function changeDisasterMode(mode) {
    setDisasterMode(mode);
}

function setDisasterMode(mode) {
    currentMode = mode;
    appData = disasterData[mode];

    // 1. Update Header Ticker & Badges
    document.getElementById("threat-badge").innerText = appData.threatBadge;
    document.getElementById("header-status-ticker").innerText = appData.statusTicker;

    if (mode === "cyclone") {
        document.getElementById("threat-badge").className = "status-badge urgent";
    } else if (mode === "earthquake") {
        document.getElementById("threat-badge").className = "status-badge critical";
    } else {
        document.getElementById("threat-badge").className = "status-badge warning";
    }

    // 2. Update Dashboard Metrics Cards
    document.getElementById("threat-value").innerText = appData.metrics.threat;
    document.getElementById("threat-desc").innerText = appData.metrics.threatDesc;
    document.getElementById("dashboard-shelters").innerText = appData.metrics.shelters;
    document.getElementById("dashboard-occupancy").innerText = appData.metrics.occupancy;
    document.getElementById("dashboard-hazards").innerText = appData.metrics.hazards;
    document.getElementById("dashboard-hazards-desc").innerText = appData.metrics.hazardsDesc;
    document.getElementById("dashboard-resources").innerText = appData.metrics.resources;

    // 3. Clear existing route line if present
    if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
        currentRouteLine = null;
    }
    if (mapReportMarker) {
        map.removeLayer(mapReportMarker);
        mapReportMarker = null;
    }

    // 4. Update Map Center & Re-render active markers
    map.setView(appData.coords, appData.zoom);
    renderMapMarkers();

    // 5. Update Routing Dropdown Options
    initRoutingDropdowns();

    // 6. Reset AI Assistant Context & Greeting
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = "";
    addChatMessage("assistant", appData.chatGreeting);
    renderChatSuggestions();

    // 7. Update Shelter & Roads Checklist active tab based on mode
    switchChecklist(mode === "floods" ? "flood" : mode);
    renderSheltersList();

    // Update dynamic content in Supply Hub if mode changed
    seedSupplyHubForMode(mode);
}

// Renders dynamic map markers
function renderMapMarkers() {
    markerLayers.shelter.clearLayers();
    markerLayers.hazard.clearLayers();
    markerLayers.medical.clearLayers();

    // Low bandwidth: don't load rich markers if enabled (or just load simple indicators)
    const isLowBandwidth = lowBandwidthMode;

    // 1. Render Shelters
    appData.shelters.forEach(shelter => {
        const htmlIcon = `<div class="custom-leaflet-marker marker-shelter"><i data-lucide="home" style="width: 14px; height: 14px; margin-top: 1px;"></i></div>`;
        const icon = L.divIcon({
            className: '',
            html: isLowBandwidth ? '<div style="background:#10b981; width:8px; height:8px; border-radius:50%;"></div>' : htmlIcon,
            iconSize: isLowBandwidth ? [8, 8] : [26, 26],
            iconAnchor: isLowBandwidth ? [4, 4] : [13, 13]
        });

        const percent = Math.round((shelter.capacity / shelter.maxCapacity) * 100);
        const popupContent = `
      <div class="popup-details">
        <h3>${shelter.name}</h3>
        <p><strong>Occupancy:</strong> ${shelter.capacity} / ${shelter.maxCapacity} (${percent}%)</p>
        <p><strong>Status:</strong> ${shelter.status}</p>
        <div style="margin: 0.5rem 0;">
          💧 Water: ${shelter.supplies.water}% | 🍞 Food: ${shelter.supplies.food}%<br/>
          🩹 Meds: ${shelter.supplies.medicine}% | 🧣 Blankets: ${shelter.supplies.blankets}%
        </div>
        <button onclick="openResourceModal(${shelter.id})" style="width:100%; border:none; padding:4px 8px; border-radius:4px; background:var(--color-info); color:white; font-size:0.7rem; font-weight:600; cursor:pointer; margin-top:6px;">
          Manage Resources
        </button>
      </div>
    `;

        const marker = L.marker(shelter.coords, { icon: icon }).bindPopup(popupContent);
        markerLayers.shelter.addLayer(marker);
    });

    // 2. Render Medical
    appData.hospitals.forEach(hosp => {
        const htmlIcon = `<div class="custom-leaflet-marker marker-medical"><i data-lucide="shield-alert" style="width: 14px; height: 14px; margin-top: 1px;"></i></div>`;
        const icon = L.divIcon({
            className: '',
            html: isLowBandwidth ? '<div style="background:#3b82f6; width:8px; height:8px; border-radius:50%;"></div>' : htmlIcon,
            iconSize: isLowBandwidth ? [8, 8] : [26, 26],
            iconAnchor: isLowBandwidth ? [4, 4] : [13, 13]
        });

        const popupContent = `
      <div class="popup-details">
        <h3>${hosp.name}</h3>
        <p><strong>Capacity:</strong> ${hosp.capacity}</p>
        <p><strong>Tel:</strong> ${hosp.phone}</p>
      </div>
    `;

        const marker = L.marker(hosp.coords, { icon: icon }).bindPopup(popupContent);
        markerLayers.medical.addLayer(marker);
    });

    // 3. Render Hazards
    appData.hazards.forEach(hazard => {
        const isRoadBlock = hazard.type === "roadblock";
        const cssClass = isRoadBlock ? "marker-roadblock" : "marker-hazard";
        const iconName = isRoadBlock ? "ban" : "alert-triangle";

        const htmlIcon = `<div class="custom-leaflet-marker ${cssClass}"><i data-lucide="${iconName}" style="width: 14px; height: 14px; margin-top: 1px;"></i></div>`;
        const icon = L.divIcon({
            className: '',
            html: isLowBandwidth ? '<div style="background:#ef4444; width:8px; height:8px; border-radius:50%;"></div>' : htmlIcon,
            iconSize: isLowBandwidth ? [8, 8] : [26, 26],
            iconAnchor: isLowBandwidth ? [4, 4] : [13, 13]
        });

        const popupContent = `
      <div class="popup-details">
        <h3>${hazard.name}</h3>
        <p><strong>Severity:</strong> <span style="color:var(--color-primary); font-weight:700;">${hazard.severity}</span></p>
        <p>${hazard.desc}</p>
      </div>
    `;

        const marker = L.marker(hazard.coords, { icon: icon }).bindPopup(popupContent);
        markerLayers.hazard.addLayer(marker);
    });

    // Parse Icons
    lucide.createIcons();
}

// Repositions routing dropdowns based on nodes in active mode
function initRoutingDropdowns() {
    const startSelect = document.getElementById("route-start");
    const endSelect = document.getElementById("route-end");

    if (!startSelect || !endSelect) return;

    startSelect.innerHTML = '<option value="" disabled selected>Select Starting Point...</option>';
    endSelect.innerHTML = '<option value="" disabled selected>Select Safe Destination...</option>';

    Object.keys(appData.nodes).forEach(key => {
        const node = appData.nodes[key];
        startSelect.innerHTML += `<option value="${key}">${node.name}</option>`;

        // Add destinations (shelters match shelters in current dataset)
        if (["N2", "N3", "N4", "N7"].includes(key)) {
            endSelect.innerHTML += `<option value="${key}">${node.name} (Shelter/Hub)</option>`;
        }
    });
}

// Switches views in SPA (Dashboard, Map, Chat, Shelters, Supply Match, Safety, Volunteers)
function switchView(viewName) {
    activeView = viewName;

    // Toggle active class on sidebar navigation buttons
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    const activeBtn = document.getElementById(`btn-${viewName}`);
    if (activeBtn) activeBtn.classList.add("active");

    // Toggle active class on view panels
    document.querySelectorAll(".view-panel").forEach(panel => {
        panel.classList.remove("active");
    });
    const activePanel = document.getElementById(`view-${viewName}`);
    if (activePanel) activePanel.classList.add("active");

    // Reposition Map & Chatbot DOM Elements
    const mapElement = document.getElementById("map");
    const chatNode = document.getElementById("main-chat-element");

    if (viewName === "dashboard") {
        // Move map to dashboard map container
        document.getElementById("dashboard-map-container").appendChild(mapElement);
        // Move chat to dashboard chat container
        document.getElementById("dashboard-chat-container").appendChild(chatNode);

        setTimeout(() => { map.invalidateSize(); }, 150);
    }
    else if (viewName === "map-view") {
        // Move map to full-screen map container
        document.getElementById("full-map-container").appendChild(mapElement);

        setTimeout(() => { map.invalidateSize(); }, 150);
    }
    else if (viewName === "agent-view") {
        // Move chat to full-screen chat container
        document.getElementById("full-chat-container").appendChild(chatNode);
    }

    // Rerender icons and dropdowns
    lucide.createIcons();
}

// Low Bandwidth Mode Toggle
function toggleBandwidth(checked) {
    lowBandwidthMode = checked;
    renderMapMarkers();

    if (checked) {
        voiceOutputEnabled = false;
        document.getElementById("voice-toggle-btn").classList.remove("active");
        addChatMessage("assistant", "Low bandwidth active: Speech synthesis disabled and simplified map icons loaded to conserve data.");
    }
}

// Calculate Safe Path avoiding active roadblocks
function calculateSafePath() {
    const startKey = document.getElementById("route-start").value;
    const endKey = document.getElementById("route-end").value;

    if (!startKey || !endKey) {
        document.getElementById("route-status").innerText = "Error: Please select both a starting node and safe destination.";
        return;
    }

    if (startKey === endKey) {
        document.getElementById("route-status").innerText = "You are already at your destination shelter.";
        return;
    }

    if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
        currentRouteLine = null;
    }

    // Build graph excluding blocked routes
    const graph = {};
    Object.keys(appData.nodes).forEach(key => graph[key] = []);

    appData.edges.forEach(edge => {
        const isBlocked = appData.hazards.some(h => h.id === edge.hazardId);
        if (!isBlocked) {
            graph[edge.from].push({ to: edge.to, name: edge.name });
            graph[edge.to].push({ to: edge.from, name: edge.name }); // Bidirectional
        }
    });

    // Run BFS
    const queue = [[startKey]];
    const visited = new Set([startKey]);
    let path = null;

    while (queue.length > 0) {
        const currentPath = queue.shift();
        const lastNode = currentPath[currentPath.length - 1];

        if (lastNode === endKey) {
            path = currentPath;
            break;
        }

        const neighbors = graph[lastNode] || [];
        for (const edgeInfo of neighbors) {
            if (!visited.has(edgeInfo.to)) {
                visited.add(edgeInfo.to);
                const newPath = [...currentPath, edgeInfo.to];
                queue.push(newPath);
            }
        }
    }

    if (path) {
        const coordinates = path.map(nodeKey => appData.nodes[nodeKey].coords);

        // Draw route on map (Karachi green glow #10b981)
        currentRouteLine = L.polyline(coordinates, {
            color: '#10b981',
            weight: 6,
            opacity: 0.8,
            dashArray: '10, 10',
            lineJoin: 'round'
        }).addTo(map);

        map.fitBounds(currentRouteLine.getBounds(), { padding: [50, 50] });

        const streetsUsed = [];
        for (let i = 0; i < path.length - 1; i++) {
            const u = path[i];
            const v = path[i + 1];
            const edge = appData.edges.find(e => (e.from === u && e.to === v) || (e.from === v && e.to === u));
            if (edge) streetsUsed.push(edge.name);
        }

        document.getElementById("route-status").innerHTML = `
      <span style="color:var(--color-success); font-weight:700;">🟢 Safe Path Plotted!</span><br/>
      <strong>Route:</strong> ${streetsUsed.join(" ➔ ")}<br/>
      <em>Bypassed all active landslides, mudslides, and flood waters.</em>
    `;

        addChatMessage("assistant", `Safe path generated from ${appData.nodes[startKey].name} to ${appData.nodes[endKey].name}. Roadblocks bypassed.`);

        // Automatically switch to Live Disaster Map view so user can visualize the path
        switchView('map-view');
    } else {
        document.getElementById("route-status").innerHTML = `
      <span style="color:var(--color-primary); font-weight:700;">🔴 Route Completely Blocked!</span><br/>
      No secure connection exists due to hazards blocking all link streets. Evacuate via foot or register rescue beacon.
    `;
        addChatMessage("assistant", "WARNING: No safe land path found between those sectors due to landslides or floods. Avoid travel. Prepare to shelter in place.");
        playAlertSFX();
    }
}

// SOS Trigger Beacon
function triggerSOS(sosType) {
    playAlertSFX();
    addChatMessage("user", `🚨 URGENT SOS TRANSMITTED: Requesting critical help for [${sosType}].`);

    setTimeout(() => {
        addChatMessage("assistant", `🚨 SOS SYNCHRONIZED: Beacon sent to NDMA and Rescue 1122 command dispatchers. GPS tracking active.`);
        speakOutput(`SOS signal received. Response teams are being directed.`);

        // Alert Ticker override
        document.getElementById("header-status-ticker").innerHTML = `<span style="color:#ef4444; font-weight:700;">SOS ALERT ACTIVE: Dispatching Rescue teams to coordinates. Clear channels.</span>`;
    }, 600);
}

// Play Warn Audio
function playAlertSFX() {
    const alertSfx = document.getElementById("sfx-alert");
    if (alertSfx) {
        alertSfx.volume = 0.4;
        alertSfx.play().catch(e => console.log("Audio skipped due to autoplay block."));
    }
}

// --- Dynamic Shelters List Render ---
function renderSheltersList() {
    const container = document.getElementById("shelter-cards-list-container");
    if (!container) return;
    container.innerHTML = "";

    appData.shelters.forEach(s => {
        const percent = Math.round((s.capacity / s.maxCapacity) * 100);

        const card = document.createElement("div");
        card.className = "shelter-card";
        card.innerHTML = `
      <div class="shelter-card-header">
        <h4>${s.name}</h4>
        <span class="status-tag ${percent < 90 ? 'available' : 'danger'}">${s.status}</span>
      </div>
      <div class="shelter-card-body">
        <div style="margin-bottom: 0.5rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom: 3px;">
            <span>Occupancy Level</span>
            <span>${s.capacity} / ${s.maxCapacity} (${percent}%)</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${percent > 90 ? 'critical' : ''}" style="width: ${percent}%;"></div>
          </div>
        </div>
        <div class="shelter-card-supplies">
          <div class="supply-bar-item">💧 Water: <strong>${s.supplies.water}%</strong></div>
          <div class="supply-bar-item">🍞 Food: <strong>${s.supplies.food}%</strong></div>
          <div class="supply-bar-item">🩹 Meds: <strong>${s.supplies.medicine}%</strong></div>
          <div class="supply-bar-item">🧣 Cots: <strong>${s.supplies.blankets}%</strong></div>
        </div>
        <button class="btn-manage-res" onclick="openResourceModal(${s.id})">Adjust Shelter Reserves</button>
      </div>
    `;
        container.appendChild(card);
    });
}

// --- Resource Modal ---
function openResourceModal(shelterId) {
    selectedShelterId = shelterId;
    const shelter = appData.shelters.find(s => s.id === shelterId);
    if (!shelter) return;

    document.getElementById("modal-shelter-name").innerText = `${shelter.name} - Supply Hub`;
    document.getElementById("modal-shelter-info").innerText = `Adjust shelter stockpiles dynamically for local relief distribution:`;

    const container = document.getElementById("modal-supplies-list");
    container.innerHTML = "";

    const resources = [
        { key: "water", label: "Drinking Water Reserve (%)", val: shelter.supplies.water },
        { key: "food", label: "MRE Food Supplies (%)", val: shelter.supplies.food },
        { key: "medicine", label: "First Aid & Medical Kits (%)", val: shelter.supplies.medicine },
        { key: "blankets", label: "Space Blankets & Cots (%)", val: shelter.supplies.blankets }
    ];

    resources.forEach(res => {
        container.innerHTML += `
      <div class="allocation-row">
        <label>${res.label}</label>
        <span id="lbl-modal-${res.key}">${res.val}%</span>
        <div class="allocation-qty-control">
          <button class="btn-qty" onclick="adjustModalSupply('${res.key}', -10)">-</button>
          <button class="btn-qty" onclick="adjustModalSupply('${res.key}', 10)">+</button>
        </div>
      </div>
    `;
    });

    document.getElementById("resource-modal").style.display = "flex";
}

function adjustModalSupply(key, delta) {
    const shelter = appData.shelters.find(s => s.id === selectedShelterId);
    if (!shelter) return;

    let currentVal = shelter.supplies[key];
    currentVal = Math.min(100, Math.max(0, currentVal + delta));
    shelter.supplies[key] = currentVal;

    document.getElementById(`lbl-modal-${key}`).innerText = `${currentVal}%`;
}

function saveShelterSupplies() {
    closeModal();
    renderMapMarkers();
    renderSheltersList();

    // Recalculate average shelter supply level
    let sum = 0;
    appData.shelters.forEach(s => {
        sum += (s.supplies.water + s.supplies.food + s.supplies.medicine + s.supplies.blankets) / 4;
    });
    const avg = Math.round(sum / appData.shelters.length);
    document.getElementById("dashboard-occupancy").innerText = `${avg}% Avg Shelter Supplies`;

    const shelter = appData.shelters.find(s => s.id === selectedShelterId);
    addChatMessage("assistant", `Reserves updated at ${shelter.name}. Offline synchronization completed.`);
}

function closeModal() {
    document.getElementById("resource-modal").style.display = "none";
}

// --- Checklists (Preparedness) ---
function switchChecklist(tab) {
    activeChecklistTab = tab;
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    const activeBtn = document.getElementById(`tab-${tab}`);
    if (activeBtn) activeBtn.classList.add("active");

    loadChecklist();
}

function loadChecklist() {
    const container = document.getElementById("checklist-container");
    if (!container) return;
    container.innerHTML = "";

    const savedStates = JSON.parse(localStorage.getItem(`lifebridge_chk_${activeChecklistTab}`)) || {};
    const items = checklists[activeChecklistTab] || [];

    items.forEach((item, index) => {
        const isChecked = savedStates[index] || false;
        const itemDiv = document.createElement("div");
        itemDiv.className = `checklist-item ${isChecked ? 'checked' : ''}`;
        itemDiv.innerHTML = `
      <input type="checkbox" id="chk-${index}" ${isChecked ? 'checked' : ''} onchange="toggleChecklistItem(${index}, this)">
      <label for="chk-${index}">${item}</label>
    `;
        container.appendChild(itemDiv);
    });
}

function toggleChecklistItem(index, checkbox) {
    const itemDiv = checkbox.parentElement;
    if (checkbox.checked) {
        itemDiv.classList.add("checked");
    } else {
        itemDiv.classList.remove("checked");
    }

    const savedStates = JSON.parse(localStorage.getItem(`lifebridge_chk_${activeChecklistTab}`)) || {};
    savedStates[index] = checkbox.checked;
    localStorage.setItem(`lifebridge_chk_${activeChecklistTab}`, JSON.stringify(savedStates));
}

// --- Supply Matching Hub Functionality ---
function seedSupplyHubForMode(mode) {
    // Re-seed shelter needs depending on mode
    supplyNeeds = [];
    appData.shelters.forEach((s, idx) => {
        if (s.supplies.water < 60) {
            supplyNeeds.push({ id: 100 + idx, shelter: s.name, category: "water", item: "Drinking Water Reserve", qty: `${100 - s.supplies.water}% needed`, status: "Unmatched" });
        }
        if (s.supplies.blankets < 60) {
            supplyNeeds.push({ id: 200 + idx, shelter: s.name, category: "blankets", item: "Space Blankets & Cots", qty: `${100 - s.supplies.blankets}% needed`, status: "Unmatched" });
        }
        if (s.supplies.medicine < 60) {
            supplyNeeds.push({ id: 300 + idx, shelter: s.name, category: "medicine", item: "Medical Kits", qty: `${100 - s.supplies.medicine}% needed`, status: "Unmatched" });
        }
    });

    if (supplyNeeds.length === 0) {
        // Default fallback seeds
        supplyNeeds = [
            { id: 101, shelter: appData.shelters[0].name, category: "blankets", item: "Thermal Space Blankets", qty: "200 units", status: "Unmatched" },
            { id: 102, shelter: appData.shelters[1].name, category: "medicine", item: "Trauma Aid First Aid Kits", qty: "40 sets", status: "Unmatched" }
        ];
    }

    renderSupplyHub();
}

function renderSupplyHub() {
    const needsContainer = document.getElementById("shelter-needs-list");
    const offersContainer = document.getElementById("donation-offers-list");
    const matchesContainer = document.getElementById("matches-history-list");

    if (!needsContainer || !offersContainer || !matchesContainer) return;

    // Render Needs
    needsContainer.innerHTML = "";
    const activeNeeds = supplyNeeds.filter(n => n.status === "Unmatched");
    if (activeNeeds.length === 0) {
        needsContainer.innerHTML = `<div class="no-records">All shelter supply needs matched!</div>`;
    } else {
        activeNeeds.forEach(need => {
            // Find potential matches in offers
            const hasPotentialMatch = supplyOffers.some(o => o.category === need.category && o.status === "Available");

            const itemEl = document.createElement("div");
            itemEl.className = "supply-item-card need";
            itemEl.innerHTML = `
        <div style="flex-grow:1;">
          <div class="name">${need.shelter}</div>
          <div class="details">Needs: <strong>${need.qty} ${need.item}</strong></div>
        </div>
        ${hasPotentialMatch ?
                    `<button class="btn-match-action" onclick="autoMatchNeed(${need.id})">Match & Deliver</button>` :
                    `<span class="badge-pending">No Offers Yet</span>`}
      `;
            needsContainer.appendChild(itemEl);
        });
    }

    // Render Offers
    offersContainer.innerHTML = "";
    const activeOffers = supplyOffers.filter(o => o.status === "Available");
    if (activeOffers.length === 0) {
        offersContainer.innerHTML = `<div class="no-records">No donation offers registered. Use form to post.</div>`;
    } else {
        activeOffers.forEach(offer => {
            const itemEl = document.createElement("div");
            itemEl.className = "supply-item-card offer";
            itemEl.innerHTML = `
        <div style="flex-grow:1;">
          <div class="name">${offer.donor}</div>
          <div class="details">Available: <strong>${offer.qty} ${offer.item}</strong></div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">Location: ${offer.loc}</div>
        </div>
        <span class="badge-status-ok">Available</span>
      `;
            offersContainer.appendChild(itemEl);
        });
    }

    // Render Matches
    matchesContainer.innerHTML = "";
    if (supplyMatches.length === 0) {
        matchesContainer.innerHTML = `<div class="no-records">No resource matches synced yet. Match items above.</div>`;
    } else {
        supplyMatches.forEach(m => {
            const logEl = document.createElement("div");
            logEl.className = "match-log-card";
            logEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            🟢 <strong>${m.donor}</strong> matched with <strong>${m.shelter}</strong>
            <div style="font-size:0.7rem; color:var(--text-secondary); margin-top: 2px;">
              Item: ${m.qty} ${m.item} | Status: Delivery En Route
            </div>
          </div>
          <span style="font-size:0.65rem; background:rgba(16,185,129,0.15); color:#6ee7b7; border:1px solid rgba(16,185,129,0.3); padding:2px 6px; border-radius:4px; font-weight:700;">SYNCED</span>
        </div>
      `;
            matchesContainer.appendChild(logEl);
        });
    }

    // Update Matched Offers count on dashboard
    document.getElementById("dashboard-resources").innerText = disasterData[currentMode].metrics.resources + supplyMatches.length;
}

function autoMatchNeed(needId) {
    const need = supplyNeeds.find(n => n.id === needId);
    if (!need) return;

    // Find compatible offer
    const offer = supplyOffers.find(o => o.category === need.category && o.status === "Available");
    if (!offer) return;

    // Update statuses
    need.status = "Matched";
    offer.status = "Matched";

    // Create Match entry
    const newMatch = {
        id: Date.now(),
        shelter: need.shelter,
        donor: offer.donor,
        category: need.category,
        item: need.item,
        qty: offer.qty
    };

    supplyMatches.push(newMatch);

    // Re-render
    renderSupplyHub();
    addChatMessage("assistant", `MATCH DETECTED: Synergized ${offer.donor}'s donation of ${offer.item} with ${need.shelter}'s relief request. Logged in central registry.`);
}

function submitSupplyEntry() {
    const type = document.getElementById("supply-entry-type").value;
    const name = document.getElementById("supply-entry-name").value.trim();
    const category = document.getElementById("supply-entry-category").value;
    const itemSelect = document.getElementById("supply-entry-category");
    const itemName = itemSelect.options[itemSelect.selectedIndex].text;
    const qty = document.getElementById("supply-entry-qty").value.trim();
    const loc = document.getElementById("supply-entry-loc").value.trim();
    const notes = document.getElementById("supply-entry-notes").value.trim();

    if (!name || !qty || !loc) {
        alert("Please fill out name, quantity, and location details.");
        return;
    }

    const newId = Date.now();

    if (type === "offer") {
        supplyOffers.push({
            id: newId,
            donor: name,
            category: category,
            item: itemName,
            qty: qty,
            loc: loc,
            notes: notes,
            status: "Available"
        });
        addChatMessage("assistant", `Registered donation offer of ${qty} ${itemName} from ${name}.`);
    } else {
        supplyNeeds.push({
            id: newId,
            shelter: name,
            category: category,
            item: itemName,
            qty: qty,
            status: "Unmatched"
        });
        addChatMessage("assistant", `Registered shelter request for ${qty} ${itemName} from ${name}.`);
    }

    // Clear inputs
    document.getElementById("supply-entry-name").value = "";
    document.getElementById("supply-entry-qty").value = "";
    document.getElementById("supply-entry-loc").value = "";
    document.getElementById("supply-entry-notes").value = "";

    renderSupplyHub();
}

// --- Safety Registry Functionality ---
function renderSafetyRegistry() {
    const container = document.getElementById("safety-registry-list");
    if (!container) return;
    container.innerHTML = "";

    if (safetyRecords.length === 0) {
        container.innerHTML = `<div class="no-records">No safety reports recorded. Submit status on the right.</div>`;
        return;
    }

    safetyRecords.forEach(rec => {
        const card = document.createElement("div");
        card.className = "safety-registry-card";
        card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
        <span class="name">${rec.name}</span>
        <span class="status-tag status-safe">${rec.status}</span>
      </div>
      <div class="meta-row">📍 Location: <strong>${rec.loc}</strong></div>
      <div class="meta-row">📞 Emergency Contact: <strong>${rec.contact}</strong></div>
      ${rec.family ? `<div class="meta-row">👥 Family Sheltered: ${rec.family}</div>` : ""}
      ${rec.notes ? `<div class="notes-quote">"${rec.notes}"</div>` : ""}
    `;
        container.appendChild(card);
    });
}

function submitSafetyRegister() {
    const name = document.getElementById("safety-name").value.trim();
    const loc = document.getElementById("safety-location").value.trim();
    const status = document.getElementById("safety-status").value;
    const contact = document.getElementById("safety-contact").value.trim();
    const family = document.getElementById("safety-family").value.trim();
    const notes = document.getElementById("safety-notes").value.trim();

    if (!name || !loc || !contact) {
        alert("Please fill out name, current location, and emergency contact details.");
        return;
    }

    const newRec = { name, loc, status, contact, family, notes };
    safetyRecords.unshift(newRec); // Add to top
    localStorage.setItem("lifebridge_safety_records", JSON.stringify(safetyRecords));

    // Reset inputs
    document.getElementById("safety-name").value = "";
    document.getElementById("safety-location").value = "";
    document.getElementById("safety-contact").value = "";
    document.getElementById("safety-family").value = "";
    document.getElementById("safety-notes").value = "";

    renderSafetyRegistry();
    addChatMessage("assistant", `Safety report added for ${name}. Family and relatives can now search and locate status.`);
}

function filterSafetyRegistry() {
    const query = document.getElementById("safety-search-input").value.toLowerCase().trim();
    const cards = document.querySelectorAll(".safety-registry-card");

    cards.forEach(card => {
        const nameText = card.querySelector(".name").innerText.toLowerCase();
        if (nameText.includes(query)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// --- Volunteer Tasks Functionality ---
function renderVolunteerTasks() {
    const container = document.getElementById("volunteer-tasks-container");
    if (!container) return;
    container.innerHTML = "";

    volunteerTasks.forEach(task => {
        let buttonHtml = "";
        if (task.status === "Pending") {
            buttonHtml = `<button class="btn-claim-task" onclick="claimTask(${task.id})">Claim Task</button>`;
        } else if (task.status === "In Progress") {
            buttonHtml = `<button class="btn-complete-task" onclick="completeTask(${task.id})">Complete Task</button>`;
        } else {
            buttonHtml = `<span style="font-size:0.7rem; background:rgba(16,185,129,0.1); color:#34d399; padding:2px 6px; border-radius:4px; border:1px solid rgba(16,185,129,0.2);">COMPLETED</span>`;
        }

        const card = document.createElement("div");
        card.className = `task-card ${task.status.toLowerCase().replace(" ", "-")}`;
        card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 0.25rem;">
        <h4 style="color:var(--text-primary); font-size:0.85rem; font-weight:600;">${task.title}</h4>
        <span class="badge-priority priority-${task.priority.toLowerCase()}">${task.priority} Urgency</span>
      </div>
      <div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom: 0.25rem;">📍 Location: ${task.loc}</div>
      <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom: 0.5rem;">${task.desc}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.03); padding-top:6px;">
        <span style="font-size:0.7rem; color:var(--text-secondary);">Sync: ${task.claimed} / ${task.qty} Volunteers Claimed</span>
        ${buttonHtml}
      </div>
    `;
        container.appendChild(card);
    });
}

function claimTask(taskId) {
    const task = volunteerTasks.find(t => t.id === taskId);
    if (!task) return;

    task.claimed = Math.min(task.qty, task.claimed + 1);
    if (task.claimed === task.qty) {
        task.status = "In Progress";
    }

    renderVolunteerTasks();
    addChatMessage("assistant", `You claimed the duty: "${task.title}". Logged in volunteer dispatcher hub.`);
}

function completeTask(taskId) {
    const task = volunteerTasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = "Completed";
    renderVolunteerTasks();
    addChatMessage("assistant", `Task completed: "${task.title}". Synced in NDMA coordination ledger. Thank you!`);
}

function submitVolunteerTask() {
    const title = document.getElementById("task-title").value.trim();
    const loc = document.getElementById("task-location").value.trim();
    const priority = document.getElementById("task-priority").value;
    const qty = parseInt(document.getElementById("task-qty").value) || 3;
    const desc = document.getElementById("task-desc").value.trim();

    if (!title || !loc || !desc) {
        alert("Please fill out task title, location, and description.");
        return;
    }

    const newTask = {
        id: Date.now(),
        title,
        loc,
        priority,
        qty,
        claimed: 0,
        desc,
        status: "Pending"
    };

    volunteerTasks.unshift(newTask);

    // Clear inputs
    document.getElementById("task-title").value = "";
    document.getElementById("task-location").value = "";
    document.getElementById("task-desc").value = "";

    renderVolunteerTasks();
    addChatMessage("assistant", `Duty dispatch registered: "${title}" seeking ${qty} volunteers.`);
}

// --- AI Chatbot Assistant Core ---
function handleChatKeyPress(e) {
    if (e.key === "Enter") {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const inputEl = document.getElementById("chat-input");
    const msgText = inputEl.value.trim();

    if (!msgText) return;

    addChatMessage("user", msgText);
    inputEl.value = "";

    // Show typing loader
    const chatMessages = document.getElementById("chat-messages");
    const loaderDiv = document.createElement("div");
    loaderDiv.className = "chat-bubble assistant loading";
    loaderDiv.id = "chat-typing-loader";
    loaderDiv.innerHTML = '<div class="dot-pulse"></div><div class="dot-pulse"></div><div class="dot-pulse"></div>';
    chatMessages.appendChild(loaderDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Process response
    setTimeout(() => {
        const loader = document.getElementById("chat-typing-loader");
        if (loader) loader.remove();

        const response = generateAIResponse(msgText);
        addChatMessage("assistant", response);
        speakOutput(response);
    }, 1000);
}

function sendSuggestion(text) {
    document.getElementById("chat-input").value = text;
    sendChatMessage();
}

function addChatMessage(sender, text) {
    const chatMessages = document.getElementById("chat-messages");
    if (!chatMessages) return;

    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerText = text;
    chatMessages.appendChild(bubble);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderChatSuggestions() {
    const container = document.getElementById("chat-suggestions-container");
    if (!container) return;
    container.innerHTML = "";

    appData.chatSuggestions.forEach(sug => {
        const chip = document.createElement("span");
        chip.className = "suggestion-chip";
        chip.innerText = sug;
        chip.onclick = () => sendSuggestion(sug);
        container.appendChild(chip);
    });
}

// Local natural language matching and responses
function generateAIResponse(input) {
    const text = input.toLowerCase();

    // Emergency Numbers
    if (text.includes("number") || text.includes("phone") || text.includes("contact") || text.includes("call") || text.includes("helpline") || text.includes("rescue")) {
        if (currentMode === "cyclone") {
            return `📞 Karachi Cyclone Emergency Contacts:
      • Rescue 1122: Emergency dispatch
      • Edhi Ambulance: 115
      • Chhipa Ambulance: 1020
      • NDMA helpline: 1177
      • PDMA Sindh: 021-99332007
      • K-Electric: 118`;
        } else if (currentMode === "earthquake") {
            return `📞 Kashmir Earthquake Emergency Contacts:
      • Rescue 1122 (AJK Command)
      • AIMS Muzaffarabad: +92-5822-921003
      • NDMA Call Center: 1177
      • Edhi Kashmir Post: 115`;
        } else {
            return `📞 Sindh Floods Emergency Contacts:
      • Rescue 1122 (Sindh Floods Rescue)
      • Sukkur Barrage Office: +92-71-9310123
      • NDMA Helpline: 1177
      • PDMA Sindh Control Room: 021-99332007`;
        }
    }

    // SOS
    if (text.includes("sos") || text.includes("emergency") || text.includes("danger") || text.includes("help me")) {
        return "🚨 EMERGENCY BEACON READY: If you are facing life-threatening danger, hit the large red 'TRIGGER SOS' button on the sidebar to alert emergency coordinators immediately.";
    }

    // Shelter
    if (text.includes("shelter") || text.includes("refuge") || text.includes("stay")) {
        let response = `🏡 Available Relief Shelters (${appData.name}):\n\n`;
        appData.shelters.forEach(s => {
            const percent = Math.round((s.capacity / s.maxCapacity) * 100);
            response += `• ${s.name} - Occupancy: ${s.capacity}/${s.maxCapacity} (${percent}%). Status: ${s.status}.\n`;
        });
        response += "\nTo calculate a safe hazard-bypassing path to any of these shelter hubs, head to the 'Shelters & Roads' tab.";
        return response;
    }

    // Roads/Hazards
    if (text.includes("road") || text.includes("blocked") || text.includes("flood") || text.includes("hazard") || text.includes("bridge") || text.includes("landslide") || text.includes("causeway")) {
        let response = `🚧 Active Roads & Infrastructure Blockages (${appData.name}):\n\n`;
        appData.hazards.forEach(h => {
            response += `🛑 ${h.name} (${h.severity} Severity) - ${h.desc}\n`;
        });
        response += "\nAvoid travel to these sectors. Our Safe Route Finder automatically routes around them.";
        return response;
    }

    // Medical
    if (text.includes("medical") || text.includes("hospital") || text.includes("doctor") || text.includes("injury")) {
        let response = `🏥 Operating Field Clinics & Emergency Hospitals:\n\n`;
        appData.hospitals.forEach(h => {
            response += `• ${h.name} - Status: ${h.capacity}. Hotline: ${h.phone}\n`;
        });
        response += "\nSeek local medical shelters or call Rescue 1122 for immediate ambulance evacuation.";
        return response;
    }

    // Barrage check
    if (text.includes("barrage") || text.includes("river") || text.includes("flow")) {
        if (currentMode === "floods") {
            return "🌊 Indus River Report: Sukkur Barrage is currently at Medium Flood level, monitoring water volumes from upper Punjab. Discharge is being coordinated to avoid rural flooding. Keep clear of banks.";
        }
    }

    // Supplies
    if (text.includes("supplies") || text.includes("pack") || text.includes("kit") || text.includes("food") || text.includes("water") || text.includes("blanket")) {
        return "📦 Relief Stocks details: Water, cots, space blankets, and medical kits are registered at shelters. To matching donations or file shelter supply needs, head to the 'Supply Matching Hub' view.";
    }

    // Greeting
    if (text.includes("hello") || text.includes("hi ") || text.includes("hey")) {
        return `Hello! I am your LifeBridge assistant. You can ask: 'Where is the nearest shelter?', 'Are there any blocked roads?', 'Show medical centers', or 'What are the emergency numbers?'`;
    }

    return "I have scanned the local offline database. Try asking: 'Where is the nearest shelter?', 'Are any roads blocked?', 'Show medical centers', or 'What are the emergency numbers?'.";
}

// Text to speech
function toggleVoiceOutput() {
    if (lowBandwidthMode) {
        alert("Voice synthesis is disabled in Low Bandwidth mode.");
        return;
    }
    voiceOutputEnabled = !voiceOutputEnabled;
    const btn = document.getElementById("voice-toggle-btn");
    if (voiceOutputEnabled) {
        btn.classList.add("active");
        addChatMessage("assistant", "Speech synthesis active.");
        speakOutput("Voice output activated.");
    } else {
        btn.classList.remove("active");
        addChatMessage("assistant", "Speech synthesis disabled.");
    }
}

function speakOutput(text) {
    if (!voiceOutputEnabled || lowBandwidthMode) return;
    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
        .replace(/[🛑🏡🚨🚧🏥✨🟢🔴•➔]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = speechSynthesis.getVoices();
    const enVoice = voices.find(voice => voice.lang.includes("en-"));
    if (enVoice) utterance.voice = enVoice;

    window.speechSynthesis.speak(utterance);
}

// Speech recognition
function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        addChatMessage("assistant", "Speech recognition is not supported in this browser. Please type.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const micBtn = document.getElementById("mic-btn");
    micBtn.style.color = "var(--color-primary)";
    micBtn.classList.add("active");
    addChatMessage("assistant", "Listening... Speak now.");

    recognition.start();

    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        document.getElementById("chat-input").value = speechResult;
        sendChatMessage();
    };

    recognition.onspeechend = () => {
        recognition.stop();
        micBtn.style.color = "var(--text-secondary)";
        micBtn.classList.remove("active");
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        micBtn.style.color = "var(--text-secondary)";
        micBtn.classList.remove("active");
        addChatMessage("assistant", "Could not transcribe audio. Please type.");
    };
}
