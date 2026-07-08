// ==============================
// Get HTML Elements
// ==============================

const upload = document.getElementById("upload");
const uploadBtn = document.getElementById("uploadBtn");

const originalCanvas = document.getElementById("originalCanvas");
const filteredCanvas = document.getElementById("filteredCanvas");

const originalCtx = originalCanvas.getContext("2d");
const filteredCtx = filteredCanvas.getContext("2d");

const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const dimensions = document.getElementById("dimensions");

const slider = document.getElementById("compareSlider");
const divider = document.getElementById("divider");

const modeButtons = document.querySelectorAll(".mode-btn");

const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

// ==============================
// Variables
// ==============================

let image = new Image();
let currentMode = "normal";

// ==============================
// Open File Picker
// ==============================

uploadBtn.addEventListener("click", () => {
    upload.click();
});

// ==============================
// Upload Image
// ==============================

upload.addEventListener("change", function () {

    if (this.files.length === 0) return;

    loadImage(this.files[0]);

});

// ==============================
// Load Image
// ==============================

function loadImage(file){

    fileName.textContent = file.name;

    fileSize.textContent =
        (file.size / 1024).toFixed(2) + " KB";

    const reader = new FileReader();

    reader.onload = function(e){

        image.onload = function(){

            originalCanvas.width = image.width;
            originalCanvas.height = image.height;

            filteredCanvas.width = image.width;
            filteredCanvas.height = image.height;

            dimensions.textContent =
                image.width + " × " + image.height + " px";

            drawOriginal();

            applyFilter(currentMode);

        }

        image.src = e.target.result;

    }

    reader.readAsDataURL(file);

}

// ==============================
// Draw Original Image
// ==============================

function drawOriginal(){

    originalCtx.clearRect(
        0,
        0,
        originalCanvas.width,
        originalCanvas.height
    );

    originalCtx.drawImage(
        image,
        0,
        0,
        originalCanvas.width,
        originalCanvas.height
    );

}

// ==============================
// Mode Buttons
// ==============================

modeButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        modeButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

        currentMode = button.dataset.mode;

        applyFilter(currentMode);

    });

});
// ==============================
// Apply Filter
// ==============================

function applyFilter(mode) {

    if (!image.src) return;

    filteredCtx.clearRect(
        0,
        0,
        filteredCanvas.width,
        filteredCanvas.height
    );

    filteredCtx.drawImage(
        image,
        0,
        0,
        filteredCanvas.width,
        filteredCanvas.height
    );

    const imageData = filteredCtx.getImageData(
        0,
        0,
        filteredCanvas.width,
        filteredCanvas.height
    );

    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {

        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        switch (mode) {

            case "protanopia":

                data[i]     = 0.567 * r + 0.433 * g;
                data[i + 1] = 0.558 * r + 0.442 * g;
                data[i + 2] = 0.242 * g + 0.758 * b;

                break;

            case "deuteranopia":

                data[i]     = 0.625 * r + 0.375 * g;
                data[i + 1] = 0.700 * r + 0.300 * g;
                data[i + 2] = 0.300 * g + 0.700 * b;

                break;

            case "tritanopia":

                data[i]     = 0.950 * r + 0.050 * g;
                data[i + 1] = 0.433 * g + 0.567 * b;
                data[i + 2] = 0.475 * g + 0.525 * b;

                break;

            case "achromatopsia":

                let gray =
                    0.299 * r +
                    0.587 * g +
                    0.114 * b;

                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;

                break;

            case "normal":
            default:
                break;
        }

    }

    filteredCtx.putImageData(imageData, 0, 0);

}

// ==============================
// Compare Slider
// ==============================

slider.addEventListener("input", () => {

    const value = slider.value;

    filteredCanvas.style.clipPath =
        `inset(0 ${100 - value}% 0 0)`;

    divider.style.left = value + "%";

});

// ==============================
// Download Image
// ==============================

downloadBtn.addEventListener("click", () => {

    if (!image.src) return;

    const link = document.createElement("a");

    link.download = "filtered-image.png";

    link.href = filteredCanvas.toDataURL("image/png");

    link.click();

});

// ==============================
// Reset
// ==============================

resetBtn.addEventListener("click", () => {

    upload.value = "";

    fileName.textContent = "No Image Selected";
    fileSize.textContent = "-";
    dimensions.textContent = "-";

    originalCtx.clearRect(
        0,
        0,
        originalCanvas.width,
        originalCanvas.height
    );

    filteredCtx.clearRect(
        0,
        0,
        filteredCanvas.width,
        filteredCanvas.height
    );

    currentMode = "normal";

    modeButtons.forEach(btn => btn.classList.remove("active"));

    modeButtons[0].classList.add("active");

    slider.value = 50;

    divider.style.left = "50%";

    filteredCanvas.style.clipPath = "inset(0 50% 0 0)";

    image = new Image();

});
