let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let seamOn = document.getElementById('seamSwitch');
let gradientOn = document.getElementById('gradientSwitch');
let ima;
let ori_ima;
let gray;
let ori_gray;
let energy;
let openCvReady = false;
let sliderVal = 100;
let slider = new Slider('#ratioSlider', {
	formatter: function(value) {
		return value + '%';
	}
});

function onOpenCvReady() {
    cv['onRuntimeInitialized']=()=>{
        openCvReady = true;
        document.getElementById('input').hidden = false;
        document.getElementById('ratioSlider').hidden = false;
        document.getElementById('seamCheckbox').hidden = false;
        document.getElementById('gradientCheckbox').hidden = false;
        document.getElementById('spinner').hidden = true;
        ima = cv.imread(imgElement);
        cv.imshow("imageCanvas", ima);
        ori_ima = ima.clone();
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
    energy = getEnergy();
}

function reset() {
    ima = ori_ima.clone();
    cv.imshow("imageCanvas", ima);
    slider.refresh();
    gray = ori_gray.clone();
    energy = getEnergy();
    sliderVal = 100;
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

slider.on('slideStop', function(curValue) {
    slider.disable();
    if (curValue > sliderVal && sliderVal < 100) {
        ima = ori_ima.clone();
        gray = ori_gray.clone();
        energy = getEnergy();
        sliderVal = 100;
    }
    carve((sliderVal - curValue) * ima.cols / 100);
    sliderVal = curValue;
    slider.enable();
});

// Write file name in file selector
document.querySelector('.custom-file-input').addEventListener('change',function(e){
    let fileName = document.getElementById("fileInput").files[0].name;
    let nextSibling = e.target.nextElementSibling;
    nextSibling.innerText = fileName;
})