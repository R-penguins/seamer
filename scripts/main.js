let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');

inputElement.onchange = function() {
    imgElement.src = URL.createObjectURL(event.target.files[0]);
};

imgElement.onload = function() {
    let image = cv.imread(imgElement);
    let gray = new cv.Mat(image.rows, image.cols, cv.CV_16S);
    let sobelx = gray.clone();
    let sobely = gray.clone();
    let xabs = gray.clone()
    let yabs = gray.clone()
    let energy = gray.clone();
    cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
    cv.Sobel(gray, sobelx, cv.CV_16S, 1, 0, 5);
    cv.Sobel(gray, sobely, cv.CV_16S, 0, 1, 5);
    cv.convertScaleAbs(sobelx, xabs);
    cv.convertScaleAbs(sobely, yabs);
    cv.addWeighted(xabs, 0.5, yabs, 0.5, 0, energy);
    cv.imshow('imageCanvas', energy);

    image.delete();
    gray.delete();
    sobelx.delete();
    sobely.delete();
};

document.querySelector('.custom-file-input').addEventListener('change',function(e){
    let fileName = document.getElementById("fileInput").files[0].name;
    let nextSibling = e.target.nextElementSibling;
    nextSibling.innerText = fileName;
})