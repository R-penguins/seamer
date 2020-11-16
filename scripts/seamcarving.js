function getEnergy() {
    let rows = gray.rows;
    let cols = gray.cols;
    let sobelx = new cv.Mat(rows, cols, cv.CV_16S);
    let sobely = new cv.Mat(rows, cols, cv.CV_16S);
    let xabs = new cv.Mat(rows, cols, cv.CV_16S);
    let yabs = new cv.Mat(rows, cols, cv.CV_16S);
    let energy = new cv.Mat(rows, cols, cv.CV_16S);
    cv.Sobel(gray, sobelx, cv.CV_16S, 1, 0, 3);
    cv.Sobel(gray, sobely, cv.CV_16S, 0, 1, 3);
    cv.convertScaleAbs(sobelx, xabs);
    cv.convertScaleAbs(sobely, yabs);
    cv.addWeighted(xabs, 0.5, yabs, 0.5, 0, energy);

    xabs.delete();
    yabs.delete();
    sobelx.delete();
    sobely.delete();

    return energy;
}

function seamCarve() {
    let rows = gray.rows;
    let cols = gray.cols;
    let image = ima.clone();
    let grayTemp = gray.clone();
    let seam = findSeam();
    for (let x = 0; x < image.rows; x++) {
        let col = seam[x];
        image.data[x * cols * 4 + col * 4    ] = 255; // R
        image.data[x * cols * 4 + col * 4 + 1] = 0;   // G
        image.data[x * cols * 4 + col * 4 + 2] = 0;   // B
        image.data[x * cols * 4 + col * 4 + 3] = 255; // A

        energy.data[x * cols + col] = 255;
    }
    if (seamOn.checked) {
        if (gradientOn.checked) {
            cv.imshow('imageCanvas', energy);
        }
        else {
            cv.imshow('imageCanvas', image);
        }
    }

    ima = new cv.Mat(rows, cols - 1, cv.CV_8UC4);
    gray = new cv.Mat(rows, cols - 1, cv.CV_8U);
    for (let x = 0; x < rows; x++) {
        let dcol = seam[x];
        for (let y = 0; y < cols; y++) {
            if (y !== dcol) {
                let col = y;
                if (y > dcol) {
                    col--;
                }
                ima.data[x * ima.cols * 4 + col * 4    ] = image.data[x * image.cols * 4 + y * 4    ];
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
        }
        else {
            cv.imshow('imageCanvas', ima);
        }
    }

    image.delete();
    grayTemp.delete();
}

function findSeam(){
    // DAG shortest path
    let rows = energy.rows;
    let cols = energy.cols;
    let cost = new Int16Array(rows * cols);
    let prev = new Int16Array(rows * cols);
    for (let i = 0; i < cols; i++) {
        cost[i] = energy.data[i];
    }
    for (let i = cols; i < rows * cols; i++) {
        cost[i] = 32767;
    }

    // Row by row update 3 pixels right below
    let cur_index = 0;
    for (let x = 0; x < rows - 1; x++) {
        for (let y = 0; y < cols; y++) {
            for (let next_y = Math.max(0, y - 1); next_y <= Math.min(cols - 1, y + 1); next_y++) {
                let next_index = (x + 1) * cols + next_y;
                let new_cost = cost[cur_index] + energy.data[next_index];
                if (new_cost < cost[next_index]) {
                    cost[next_index] = new_cost;
                    prev[next_index] = y;
                }
            }
            cur_index++;
        }
    }

    // Backtracing
    let final_cost = 32767;
    let final_col = -1;
    for (let y = 0; y < cols; y++) {
        if (cost[cur_index] < final_cost) {
            final_cost = cost[cur_index];
            final_col = y;
        }
        cur_index++;
    }
    let result = new Int16Array(rows);
    result[rows - 1] = final_col;
    for (let x = rows - 1; x > 0; x--) {
        result[x - 1] = prev[x * cols + result[x]];
    }

    return result;
}