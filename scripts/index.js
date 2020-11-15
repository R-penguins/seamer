let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let ima;
let gray;
let openCvReady = false;

function onOpenCvReady() {
    openCvReady = true;
    document.getElementById('input').hidden = false;
    document.getElementById('carver').hidden = false;
}

window.onload = function () {
    if (openCvReady) {
        ima = cv.imread(imgElement);
        cv.imshow("imageCanvas", ima);
        gray = new cv.Mat(ima.rows, ima.cols, cv.CV_8U);
        cv.cvtColor(ima, gray, cv.COLOR_RGBA2GRAY);
    }
}

inputElement.onchange = function() {
    imgElement.src = URL.createObjectURL(this.files[0]);
};

imgElement.onload = function() {
    if (openCvReady) {
        ima = cv.imread(imgElement);
        cv.imshow("imageCanvas", ima);
        ima = cv.imread(imgElement);
        cv.imshow("imageCanvas", ima);
        gray = new cv.Mat(ima.rows, ima.cols, cv.CV_8U);
        cv.cvtColor(ima, gray, cv.COLOR_RGBA2GRAY);
    }
}

// Write file name in file selector
document.querySelector('.custom-file-input').addEventListener('change',function(e){
    let fileName = document.getElementById("fileInput").files[0].name;
    let nextSibling = e.target.nextElementSibling;
    nextSibling.innerText = fileName;
})