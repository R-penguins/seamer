let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let seamOn = document.getElementById('seamSwitch');
let gradientOn = document.getElementById('gradientSwitch');
let slider = document.getElementById('ratioSlider');
let percentageOutput = document.getElementById('percentage');
let ima;
let ori_ima;
let gray;
let ori_gray;
let energy;
let openCvReady = false;
let sliderVal = 100;
let ori_rows;
let ori_cols;

function onOpenCvReady() {
    cv['onRuntimeInitialized']=()=>{
        openCvReady = true;
        document.getElementById('mainUI').hidden = false;
        document.getElementById('spinner').hidden = true;
        ima = cv.imread(imgElement);
        cv.imshow("imageCanvas", ima);
        ori_ima = ima.clone();
        ori_rows = ima.rows;
        ori_cols = ima.cols;
        gray = new cv.Mat(ima.rows, ima.cols, cv.CV_8U);
        cv.cvtColor(ima, gray, cv.COLOR_RGBA2GRAY);
        ori_gray = gray.clone();
        energy = getEnergy();
    };
}

inputElement.onchange = function() {
    imgElement.src = URL.createObjectURL(this.files[0]);
};

imgElement.onload = function() {
    ima = cv.imread(imgElement);
    cv.imshow("imageCanvas", ima);
    ori_ima = ima.clone();
    gray = new cv.Mat(ima.rows, ima.cols, cv.CV_8U);
    cv.cvtColor(ima, gray, cv.COLOR_RGBA2GRAY);
    ori_gray = gray.clone();
    ori_rows = ima.rows;
    ori_cols = ima.cols;
    energy = getEnergy();
}

function reset() {
    ima = ori_ima.clone();
    cv.imshow("imageCanvas", ima);
    slider.value = 100;
    gray = ori_gray.clone();
    energy = getEnergy();
    sliderVal = 100;
    percentageOutput.innerHTML = '100%';
}

/**
 * Carve out specified number of seams.
 * @param {number} num Number of seams to cut out.
 */
function carve (num) {
    if (num > 0) {
        for (let i = 0; i < num; i++) {
            window.setTimeout(seamCarve);
        }
    }
    else {
        for (let i = 0; i < -num; i++) {
            window.setTimeout(seamCarveEnlarge);
        }
    }
}

slider.oninput = function() {
    slider.disabled = true;
    percentageOutput.innerHTML = this.value + '%';
    if (this.value > sliderVal && sliderVal < 100) {
        ima = ori_ima.clone();
        gray = ori_gray.clone();
        energy = getEnergy();
        sliderVal = 100;
    }
    window.setTimeout(carve((sliderVal - this.value) * ori_cols / 100));
    sliderVal = this.value;
    slider.disabled = false;
};