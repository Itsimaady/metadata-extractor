const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");

const previewContainer = document.getElementById("previewContainer");
const generalInfo = document.getElementById("generalInfo");
const fileDetails = document.getElementById("fileDetails");
const exifInfo = document.getElementById("exifInfo");
const privacyInfo = document.getElementById("privacyInfo");

/* FILE SELECT */

fileInput.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (file) {
        processFile(file);
    }

});

/* DRAG DROP */

uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "#06b6d4";
});

uploadBox.addEventListener("dragleave", () => {
    uploadBox.style.borderColor = "";
});

uploadBox.addEventListener("drop", (e) => {

    e.preventDefault();

    uploadBox.style.borderColor = "";

    const file = e.dataTransfer.files[0];

    if (file) {
        processFile(file);
    }

});

/* MAIN */

function processFile(file) {

    resetUI();

    showLoading();

    displayGeneralInfo(file);

    if (file.type.startsWith("image/")) {

        processImage(file);

    } else if (file.type === "application/pdf") {

        processPDF(file);

    } else {

        previewContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <h3>Unsupported File</h3>
                <p>Upload JPG, PNG or PDF</p>
            </div>
        `;
    }
}

/* LOADER */

function showLoading() {

    previewContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">⏳</div>
            <h3>Analyzing File...</h3>
        </div>
    `;
}

/* GENERAL INFO */

function displayGeneralInfo(file) {

    const size =
        (file.size / (1024 * 1024)).toFixed(2);

    generalInfo.innerHTML = `

        <div class="info-row">
            <span class="info-label">Name</span>
            <span class="info-value">${file.name}</span>
        </div>

        <div class="info-row">
            <span class="info-label">Size</span>
            <span class="info-value">${size} MB</span>
        </div>

        <div class="info-row">
            <span class="info-label">Type</span>
            <span class="info-value">${file.type}</span>
        </div>

        <div class="info-row">
            <span class="info-label">Modified</span>
            <span class="info-value">
                ${new Date(file.lastModified).toLocaleString()}
            </span>
        </div>

    `;
}

/* IMAGE */

function processImage(file) {

    const reader = new FileReader();

    reader.onload = function (e) {

        const img = new Image();

        img.src = e.target.result;

        img.onload = function () {

            previewContainer.innerHTML = `
                <img src="${img.src}" alt="Preview">
            `;

            fileDetails.innerHTML = `

                <div class="info-row">
                    <span class="info-label">Width</span>
                    <span class="info-value">${img.width}px</span>
                </div>

                <div class="info-row">
                    <span class="info-label">Height</span>
                    <span class="info-value">${img.height}px</span>
                </div>

                <div class="info-row">
                    <span class="info-label">Resolution</span>
                    <span class="info-value">
                        ${img.width} × ${img.height}
                    </span>
                </div>

            `;

            extractExif(img);

        };

    };

    reader.readAsDataURL(file);
}

/* EXIF */

function extractExif(img) {

    if (typeof EXIF === "undefined") {

        exifInfo.innerHTML = `
            <div class="info-row">
                <span class="info-label">EXIF</span>
                <span class="info-value">
                    EXIF Library Not Loaded
                </span>
            </div>
        `;

        return;
    }

    EXIF.getData(img, function () {

        const make =
            EXIF.getTag(this, "Make") || "N/A";

        const model =
            EXIF.getTag(this, "Model") || "N/A";

        const date =
            EXIF.getTag(this, "DateTimeOriginal") || "N/A";

        const gpsLat =
            EXIF.getTag(this, "GPSLatitude");

        const gpsLon =
            EXIF.getTag(this, "GPSLongitude");

        exifInfo.innerHTML = `

            <div class="info-row">
                <span class="info-label">Camera Make</span>
                <span class="info-value">${make}</span>
            </div>

            <div class="info-row">
                <span class="info-label">Camera Model</span>
                <span class="info-value">${model}</span>
            </div>

            <div class="info-row">
                <span class="info-label">Date Taken</span>
                <span class="info-value">${date}</span>
            </div>

            <div class="info-row">
                <span class="info-label">GPS</span>
                <span class="info-value">
                    ${gpsLat ? "Available" : "Not Available"}
                </span>
            </div>

        `;

        privacyScanner(model, date, gpsLat, gpsLon);

    });
}

/* PDF */

function processPDF(file) {

    previewContainer.innerHTML = `

        <div class="pdf-preview">

            <h2>📄</h2>

            <h3>${file.name}</h3>

            <p>
                PDF uploaded successfully
            </p>

        </div>

    `;

    fileDetails.innerHTML = `

        <div class="info-row">
            <span class="info-label">Format</span>
            <span class="info-value">PDF Document</span>
        </div>

    `;

    exifInfo.innerHTML = `

        <div class="info-row">
            <span class="info-label">Metadata</span>
            <span class="info-value">
                Not Available For PDF
            </span>
        </div>

    `;

    privacyInfo.innerHTML = `

        <div class="risk-item safe">
            ✓ No image metadata detected
        </div>

    `;
}

/* PRIVACY */

function privacyScanner(
    model,
    date,
    gpsLat,
    gpsLon
) {

    let score = 100;

    let html = "";

    if (model !== "N/A") {

        score -= 15;

        html += `
            <div class="risk-item warning">
                ⚠ Camera model exposed
            </div>
        `;
    }

    if (date !== "N/A") {

        score -= 20;

        html += `
            <div class="risk-item warning">
                ⚠ Capture date available
            </div>
        `;
    }

    if (gpsLat && gpsLon) {

        score -= 40;

        html += `
            <div class="risk-item danger">
                🚨 GPS Location Detected
            </div>
        `;
    }

    if (html === "") {

        html = `
            <div class="risk-item safe">
                ✓ No Privacy Risks Found
            </div>
        `;
    }

    privacyInfo.innerHTML = `

        ${html}

        <div class="score-box">

            <p>
                Privacy Score: ${score}/100
            </p>

            <div class="score-bar">

                <div
                    class="score-fill"
                    style="width:${score}%"
                ></div>

            </div>

        </div>

    `;
}

/* RESET */

function resetUI() {

    generalInfo.innerHTML = "";
    fileDetails.innerHTML = "";
    exifInfo.innerHTML = "";
    privacyInfo.innerHTML = "";
}