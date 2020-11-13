let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let ima;

inputElement.onchange = function() {
    imgElement.src = URL.createObjectURL(this.files[0]);
};

imgElement.onload = function() {
    ima = cv.imread(imgElement);
    cv.imshow("imageCanvas", ima);
};

document.querySelector('.custom-file-input').addEventListener('change',function(e){
    let fileName = document.getElementById("fileInput").files[0].name;
    let nextSibling = e.target.nextElementSibling;
    nextSibling.innerText = fileName;
})