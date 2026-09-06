/* ================================================= */
/* SARATHI WEBSITE JAVASCRIPT */
/* ================================================= */


/* ================================================= */
/* SAMPLE ISSUES */
/* ================================================= */

const defaultIssues = [

    {
        id: 1,
        title: "Broken Street Light",
        category: "Lighting",
        location: "Kathmandu",
        description: "A street light has not been working for several days.",
        status: "Open",
        votes: 12
    },

    {
        id: 2,
        title: "Garbage Collection Problem",
        category: "Waste",
        location: "Lalitpur",
        description: "Garbage has not been collected from this area regularly.",
        status: "In Progress",
        votes: 18
    },

    {
        id: 3,
        title: "Damaged Road Section",
        category: "Roads",
        location: "Bhaktapur",
        description: "A section of the road needs repair.",
        status: "Resolved",
        votes: 27
    },

    {
        id: 4,
        title: "Water Supply Issue",
        category: "Water",
        location: "Kirtipur",
        description: "Residents are experiencing an irregular water supply.",
        status: "Open",
        votes: 9
    },

    {
        id: 5,
        title: "Roadside Waste",
        category: "Waste",
        location: "Patan",
        description: "Waste has accumulated beside the road.",
        status: "In Progress",
        votes: 14
    }

];


/* ================================================= */
/* LOAD ISSUES */
/* ================================================= */

let issues =
    JSON.parse(
        localStorage.getItem("sarathiIssues")
    ) || defaultIssues;


/* ================================================= */
/* PAGE NAVIGATION */
/* ================================================= */

function showPage(pageName) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.add("hidden");

    });


    const selected =
        document.getElementById(pageName);

    if (selected) {

        selected.classList.remove("hidden");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    const nav =
        document.getElementById("mainNav");

    if (nav) {

        nav.classList.remove("open");

    }


    if (pageName === "home") {

        displayHomeIssues();

    }


    if (pageName === "issues") {

        displayIssues();

    }


    updateStats();

}


/* ================================================= */
/* MOBILE MENU */
/* ================================================= */

function toggleMenu() {

    const nav =
        document.getElementById("mainNav");

    nav.classList.toggle("open");

}


/* ================================================= */
/* SAVE ISSUES */
/* ================================================= */

function saveIssues() {

    localStorage.setItem(
        "sarathiIssues",
        JSON.stringify(issues)
    );

}


/* ================================================= */
/* ISSUE CARD */
/* ================================================= */

function createIssueCard(issue) {

    let statusClass = "status-open";


    if (issue.status === "In Progress") {

        statusClass = "status-progress";

    }


    if (issue.status === "Resolved") {

        statusClass = "status-resolved";

    }


    return `

        <article class="issue-card">

            <div class="issue-top">

                <span class="issue-category">
                    ${escapeHTML(issue.category)}
                </span>

                <span class="status ${statusClass}">
                    ${escapeHTML(issue.status)}
                </span>

            </div>


            <h3>
                ${escapeHTML(issue.title)}
            </h3>


            <p class="issue-description">
                ${escapeHTML(issue.description)}
            </p>


            <div class="issue-location">
                📍 ${escapeHTML(issue.location)}
            </div>


            <div class="issue-footer">

                <span>
                    ❤️ ${issue.votes} support
                </span>

                <button
                    class="vote-btn"
                    onclick="supportIssue(${issue.id})">

                    Support

                </button>

            </div>

        </article>

    `;

}


/* ================================================= */
/* HOME ISSUES */
/* ================================================= */

function displayHomeIssues() {

    const container =
        document.getElementById("homeIssues");

    if (!container) return;


    const recent =
        issues.slice(-3).reverse();


    container.innerHTML =
        recent.map(createIssueCard).join("");

}


/* ================================================= */
/* ALL ISSUES */
/* ================================================= */

function displayIssues(list = issues) {

    const container =
        document.getElementById("allIssues");

    if (!container) return;


    if (list.length === 0) {

        container.innerHTML = `

            <div class="info-card">

                <h3>
                    No issues found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        list.map(createIssueCard).join("");

}


/* ================================================= */
/* FILTER ISSUES */
/* ================================================= */

function filterIssues() {

    const search =
        document
            .getElementById("searchInput")
            ?.value
            .toLowerCase() || "";


    const status =
        document
            .getElementById("statusFilter")
            ?.value || "all";


    const category =
        document
            .getElementById("categoryFilter")
            ?.value || "all";


    const filtered =
        issues.filter(issue => {

            const matchesSearch =

                issue.title
                    .toLowerCase()
                    .includes(search)

                ||

                issue.description
                    .toLowerCase()
                    .includes(search)

                ||

                issue.location
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =

                status === "all"

                ||

                issue.status === status;


            const matchesCategory =

                category === "all"

                ||

                issue.category === category;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );

        });


    displayIssues(filtered);

}


/* ================================================= */
/* SUPPORT ISSUE */
/* ================================================= */

function supportIssue(id) {

    const issue =
        issues.find(item => item.id === id);


    if (!issue) return;


    issue.votes++;

    saveIssues();

    displayHomeIssues();

    displayIssues();

    updateStats();


    showToast(
        "Thank you for supporting this issue."
    );

}


/* ================================================= */
/* SUBMIT COMPLAINT */
/* ================================================= */

function submitComplaint(event) {

    event.preventDefault();


    const title =
        document
            .getElementById("complaintTitle")
            .value.trim();


    const category =
        document
            .getElementById("complaintCategory")
            .value;


    const location =
        document
            .getElementById("complaintLocation")
            .value.trim();


    const description =
        document
            .getElementById("complaintDescription")
            .value.trim();


    if (
        !title ||
        !category ||
        !location ||
        !description
    ) {

        showToast(
            "Please complete all required fields."
        );

        return;

    }


    const newIssue = {

        id: Date.now(),

        title: title,

        category: category,

        location: location,

        description: description,

        status: "Open",

        votes: 0

    };


    issues.push(newIssue);

    saveIssues();


    document
        .getElementById("reportForm")
        .reset();


    document
        .getElementById("photoPreview")
        .innerHTML = "";


    updateStats();

    displayHomeIssues();


    showToast(
        "Your complaint has been submitted."
    );


    setTimeout(() => {

        showPage("issues");

    }, 900);

}


/* ================================================= */
/* PHOTO PREVIEW */
/* ================================================= */

function previewComplaintPhoto(event) {

    const file =
        event.target.files[0];


    const preview =
        document.getElementById("photoPreview");


    if (!file) {

        preview.innerHTML = "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function(e) {

        preview.innerHTML = `

            <img
                src="${e.target.result}"
                alt="Complaint photo preview"
            >

        `;

    };


    reader.readAsDataURL(file);

}


/* ================================================= */
/* GPS */
/* ================================================= */

function getLocation(type) {

    const status =
        document.getElementById("locationStatus");


    if (!navigator.geolocation) {

        showToast(
            "GPS is not supported by this browser."
        );

        return;

    }


    if (status) {

        status.textContent =
            "Requesting your location...";

    }


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            if (type === "complaint") {

                const locationInput =
                    document.getElementById(
                        "complaintLocation"
                    );


                locationInput.value =
                    `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

            }


            if (type === "map") {

                if (status) {

                    status.innerHTML =

                        `📍 Location found:
                        ${latitude.toFixed(5)},
                        ${longitude.toFixed(5)}`;

                }


                showMapLocation(
                    latitude,
                    longitude
                );

            }


            showToast(
                "Location detected successfully."
            );

        },


        function(error) {

            if (status) {

                status.textContent =
                    "Unable to access your location.";

            }


            showToast(
                "Location permission was not granted."
            );

        },

        {
            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}


/* ================================================= */
/* MAP LOCATION */
/* ================================================= */

function showMapLocation(latitude, longitude) {

    const map =
        document.getElementById("mapBox");


    map.innerHTML = `

        <div class="map-placeholder">

            <div class="map-icon">
                📍
            </div>

            <h2>
                Your Location
            </h2>

            <p>
                Latitude:
                ${latitude.toFixed(6)}
                <br>
                Longitude:
                ${longitude.toFixed(6)}
            </p>

            <br>

            <a
                href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}"
                target="_blank"
                class="primary-btn">

                Open in Google Maps

            </a>

        </div>

    `;

}


/* ================================================= */
/* STATISTICS */
/* ================================================= */

function updateStats() {

    const total =
        issues.length;


    const resolved =
        issues.filter(
            issue => issue.status === "Resolved"
        ).length;


    const progress =
        issues.filter(
            issue => issue.status === "In Progress"
        ).length;


    const support =
        issues.reduce(
            (sum, issue) =>
                sum + issue.votes,
            0
        );


    const totalElement =
        document.getElementById(
            "totalReports"
        );


    const resolvedElement =
        document.getElementById(
            "resolvedReports"
        );


    const progressElement =
        document.getElementById(
            "progressReports"
        );


    const supportElement =
        document.getElementById(
            "supportCount"
        );


    if (totalElement)
        totalElement.textContent = total;


    if (resolvedElement)
        resolvedElement.textContent = resolved;


    if (progressElement)
        progressElement.textContent = progress;


    if (supportElement)
        supportElement.textContent = support;

}


/* ================================================= */
/* EMERGENCY */
/* ================================================= */

function toggleEmergency() {

    const panel =
        document.getElementById(
            "emergencyPanel"
        );


    panel.classList.toggle("hidden");

}


/* ================================================= */
/* AI */
/* ================================================= */

function toggleAI() {

    const panel =
        document.getElementById(
            "aiPanel"
        );


    panel.classList.toggle("hidden");

}


function addAIMessage(message, type) {

    const messages =
        document.getElementById(
            "aiMessages"
        );


    const div =
        document.createElement("div");


    div.className =
        `ai-message ${type}`;


    div.innerHTML =
        message;


    messages.appendChild(div);


    messages.scrollTop =
        messages.scrollHeight;

}


function sendAIMessage() {

    const input =
        document.getElementById(
            "aiInput"
        );


    const message =
        input.value.trim();


    if (!message) return;


    addAIMessage(
        escapeHTML(message),
        "user"
    );


    input.value = "";


    setTimeout(() => {

        const answer =
            getAIResponse(message);


        addAIMessage(
            answer,
            "bot"
        );

    }, 400);

}


function askAI(question) {

    addAIMessage(
        question,
        "user"
    );


    setTimeout(() => {

        addAIMessage(
            getAIResponse(question),
            "bot"
        );

    }, 400);

}


function getAIResponse(message) {

    const text =
        message.toLowerCase();


    if (
        text.includes("report") ||
        text.includes("complaint")
    ) {

        return `
            To report a problem, open
            <b>Report</b> and describe what happened,
            where it happened, and select a category.
            📍 You can also use GPS.
        `;

    }


    if (
        text.includes("garbage") ||
        text.includes("waste")
    ) {

        return `
            Garbage and waste problems normally belong
            to the <b>Waste</b> category. 🗑️
        `;

    }


    if (
        text.includes("road") ||
        text.includes("pothole")
    ) {

        return `
            Road damage or potholes normally belong
            to the <b>Roads</b> category. 🛣️
        `;

    }


    if (
        text.includes("light") ||
        text.includes("streetlight")
    ) {

        return `
            A broken street light normally belongs
            to the <b>Lighting</b> category. 💡
        `;

    }


    if (
        text.includes("water")
    ) {

        return `
            Local water-supply problems normally belong
            to the <b>Water</b> category. 💧
        `;

    }


    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("namaste")
    ) {

        return `
            Namaste! 👋
            I'm Sarathi AI.
            Ask me about reporting civic problems.
        `;

    }


    return `
        I can help with:
        <br><br>
        • Reporting a complaint
        <br>
        • Choosing a category
        <br>
        • Using GPS
        <br>
        • Understanding Sarathi
    `;

}


/* ================================================= */
/* LOGIN */
/* ================================================= */

function showLogin() {

    document
        .getElementById("loginModal")
        .classList.remove("hidden");

}


function closeLogin() {

    document
        .getElementById("loginModal")
        .classList.add("hidden");

}


function loginUser() {

    const name =
        document
            .getElementById("loginName")
            .value.trim();


    const email =
        document
            .getElementById("loginEmail")
            .value.trim();


    const message =
        document.getElementById(
            "loginMessage"
        );


    if (!name || !email) {

        message.textContent =
            "Please enter your name and email.";

        return;

    }


    localStorage.setItem(
        "sarathiUser",
        JSON.stringify({
            name: name,
            email: email
        })
    );


    message.textContent =
        `Welcome, ${name}!`;


    showToast(
        "Account profile saved on this device."
    );


    setTimeout(
        closeLogin,
        1000
    );

}


/* ================================================= */
/* TOAST */
/* ================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* ================================================= */
/* SECURITY */
/* ================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


/* ================================================= */
/* START WEBSITE */
/* ================================================= */

displayHomeIssues();

updateStats();

showPage("home");