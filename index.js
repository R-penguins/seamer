const imgElement = document.getElementById('imageSrc');
const seamOn = document.getElementById('seamSwitch');
const gradientOn = document.getElementById('gradientSwitch');
const slider = document.getElementById('ratioSlider');
const percentageOutput = document.getElementById('percentage');
let ima;
let oriIma;
let gray;
let oriGray;
let energy;
let sliderVal = 100;
let oriCols;

function getEnergy() {
  const rows = gray.rows;
  const cols = gray.cols;
  const sobelx = new cv.Mat(rows, cols, cv.CV_16S);
  const sobely = new cv.Mat(rows, cols, cv.CV_16S);
  const xabs = new cv.Mat(rows, cols, cv.CV_16S);
  const yabs = new cv.Mat(rows, cols, cv.CV_16S);
  const newEnergy = new cv.Mat(rows, cols, cv.CV_16S);
  cv.Sobel(gray, sobelx, cv.CV_16S, 1, 0, 3);
  cv.Sobel(gray, sobely, cv.CV_16S, 0, 1, 3);
  cv.convertScaleAbs(sobelx, xabs);
  cv.convertScaleAbs(sobely, yabs);
  cv.addWeighted(xabs, 0.5, yabs, 0.5, 0, newEnergy);

  xabs.delete();
  yabs.delete();
  sobelx.delete();
  sobely.delete();

  return newEnergy;
}

function findSeam() {
  // DAG shortest path
  const rows = energy.rows;
  const cols = energy.cols;
  const cost = new Int16Array(rows * cols);
  const prev = new Int16Array(rows * cols);
  for (let i = 0; i < cols; i += 1) {
    cost[i] = energy.data[i];
  }
  for (let i = cols; i < rows * cols; i += 1) {
    cost[i] = 32767;
  }

  // Row by row update 3 pixels right below
  let curIndex = 0;
  for (let x = 0; x < rows - 1; x += 1) {
    for (let y = 0; y < cols; y += 1) {
      for (let nextY = Math.max(0, y - 1); nextY <= Math.min(cols - 1, y + 1); nextY += 1) {
        const nextIndex = (x + 1) * cols + nextY;
        const nextCost = cost[curIndex] + energy.data[nextIndex];
        if (nextCost < cost[nextIndex]) {
          cost[nextIndex] = nextCost;
          prev[nextIndex] = y;
        }
      }
      curIndex += 1;
    }
  }

  // Backtracing
  let finalCost = 32767;
  let finalCol = -1;
  for (let y = 0; y < cols; y += 1) {
    if (cost[curIndex] < finalCost) {
      finalCost = cost[curIndex];
      finalCol = y;
    }
    curIndex += 1;
  }
  const result = new Int16Array(rows);
  result[rows - 1] = finalCol;
  for (let x = rows - 1; x > 0; x -= 1) {
    result[x - 1] = prev[x * cols + result[x]];
  }

  return result;
}

function seamCarve() {
  const rows = gray.rows;
  const cols = gray.cols;
  const image = ima.clone();
  const grayTemp = gray.clone();
  const seam = findSeam();
  for (let x = 0; x < image.rows; x += 1) {
    const col = seam[x];
    image.data[x * cols * 4 + col * 4] = 255; // R
    image.data[x * cols * 4 + col * 4 + 1] = 0; // G
    image.data[x * cols * 4 + col * 4 + 2] = 0; // B
    image.data[x * cols * 4 + col * 4 + 3] = 255; // A

    energy.data[x * cols + col] = 255;
  }
  if (seamOn.checked) {
    if (gradientOn.checked) {
      cv.imshow('imageCanvas', energy);
    } else {
      cv.imshow('imageCanvas', image);
    }
  }

  ima = new cv.Mat(rows, cols - 1, cv.CV_8UC4);
  gray = new cv.Mat(rows, cols - 1, cv.CV_8U);
  for (let x = 0; x < rows; x += 1) {
    const dcol = seam[x];
    for (let y = 0; y < cols; y += 1) {
      if (y !== dcol) {
        const col = (y > dcol) ? y - 1 : y;
        ima.data[x * ima.cols * 4 + col * 4] = image.data[x * image.cols * 4 + y * 4];
        ima.data[x * ima.cols * 4 + col * 4 + 1] = image.data[x * image.cols * 4 + y * 4 + 1];
        ima.data[x * ima.cols * 4 + col * 4 + 2] = image.data[x * image.cols * 4 + y * 4 + 2];
        ima.data[x * ima.cols * 4 + col * 4 + 3] = image.data[x * image.cols * 4 + y * 4 + 3];

        gray.data[x * gray.cols + col] = grayTemp.data[x * grayTemp.cols + y];
      }
    }
  }
  energy = getEnergy();
  if (!seamOn.checked) {
    if (gradientOn.checked) {
      cv.imshow('imageCanvas', energy);
    } else {
      cv.imshow('imageCanvas', ima);
    }
  }

  image.delete();
  grayTemp.delete();
}

function seamCarveEnlarge() {
  const rows = gray.rows;
  const cols = gray.cols;
  const image = ima.clone();
  const grayTemp = gray.clone();
  const seam = findSeam();

  ima = new cv.Mat(rows, cols + 1, cv.CV_8UC4);
  gray = new cv.Mat(rows, cols + 1, cv.CV_8U);
  for (let x = 0; x < rows; x += 1) {
    const dcol = seam[x];
    for (let y = 0; y < ima.cols; y += 1) {
      const col = (y >= dcol + 1) ? y - 1 : y;
      ima.data[x * ima.cols * 4 + y * 4] = image.data[x * image.cols * 4 + col * 4];
      ima.data[x * ima.cols * 4 + y * 4 + 1] = image.data[x * image.cols * 4 + col * 4 + 1];
      ima.data[x * ima.cols * 4 + y * 4 + 2] = image.data[x * image.cols * 4 + col * 4 + 2];
      ima.data[x * ima.cols * 4 + y * 4 + 3] = image.data[x * image.cols * 4 + col * 4 + 3];

      gray.data[x * gray.cols + y] = grayTemp.data[x * grayTemp.cols + col];
    }
  }
  energy = getEnergy();
  if (!seamOn.checked) {
    if (gradientOn.checked) {
      cv.imshow('imageCanvas', energy);
    } else {
      cv.imshow('imageCanvas', ima);
    }
  }
  if (seamOn.checked) {
    const energyTemp = energy.clone();
    for (let x = 0; x < image.rows; x += 1) {
      const col = seam[x];
      image.data[x * cols * 4 + col * 4] = 255; // R
      image.data[x * cols * 4 + col * 4 + 1] = 0; // G
      image.data[x * cols * 4 + col * 4 + 2] = 0; // B
      image.data[x * cols * 4 + col * 4 + 3] = 255; // A

      energyTemp.data[x * energyTemp.cols + col] = 255;
    }
    if (gradientOn.checked) {
      cv.imshow('imageCanvas', energyTemp);
    } else {
      cv.imshow('imageCanvas', image);
    }
    energyTemp.delete();
  }

  image.delete();
  grayTemp.delete();
}

function onOpenCvReady() {
  cv['onRuntimeInitialized'] = () => {
    document.getElementById('mainUI').hidden = false;
    document.getElementById('spinner').hidden = true;
    ima = cv.imread(imgElement);
    cv.imshow('imageCanvas', ima);
    oriIma = ima.clone();
    oriCols = ima.cols;
    gray = new cv.Mat(ima.rows, ima.cols, cv.CV_8U);
    cv.cvtColor(ima, gray, cv.COLOR_RGBA2GRAY);
    oriGray = gray.clone();
    energy = getEnergy();
  };
}

document.getElementById('fileInput').onchange = function setImage() {
  imgElement.src = URL.createObjectURL(this.files[0]);
};

imgElement.onload = function loadImage() {
  ima = cv.imread(imgElement);
  cv.imshow('imageCanvas', ima);
  oriIma = ima.clone();
  gray = new cv.Mat(ima.rows, ima.cols, cv.CV_8U);
  cv.cvtColor(ima, gray, cv.COLOR_RGBA2GRAY);
  oriGray = gray.clone();
  oriCols = ima.cols;
  energy = getEnergy();
};

function reset() {
  ima = oriIma.clone();
  cv.imshow('imageCanvas', ima);
  slider.value = 100;
  gray = oriGray.clone();
  energy = getEnergy();
  sliderVal = 100;
  percentageOutput.innerHTML = '100%';
}

/**
 * Carve out specified number of seams.
 * @param {Number} num Number of seams to cut out.
 */
function carve(num) {
  if (num > 0) {
    for (let i = 0; i < num; i += 1) {
      window.setTimeout(seamCarve);
    }
  } else {
    for (let i = 0; i < -num; i += 1) {
      window.setTimeout(seamCarveEnlarge);
    }
  }
}

slider.oninput = function sliderChange() {
  slider.disabled = true;
  percentageOutput.innerHTML = `${this.value}%`;
  if (this.value > sliderVal && sliderVal < 100) {
    ima = oriIma.clone();
    gray = oriGray.clone();
    energy = getEnergy();
    sliderVal = 100;
  }
  carve(((sliderVal - this.value) * oriCols) / 100);
  sliderVal = this.value;
  slider.disabled = false;
};
