function seamCarve() {
    let image = ima.clone();
    let gray = new cv.Mat(image.rows, image.cols, cv.CV_16S);
    let sobelx = new cv.Mat(image.rows, image.cols, cv.CV_16S);
    let sobely = new cv.Mat(image.rows, image.cols, cv.CV_16S);
    let xabs = new cv.Mat(image.rows, image.cols, cv.CV_16S);
    let yabs = new cv.Mat(image.rows, image.cols, cv.CV_16S);
    let energy = new cv.Mat(image.rows, image.cols, cv.CV_16S);
    cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
    cv.Sobel(gray, sobelx, cv.CV_16S, 1, 0, 3);
    cv.Sobel(gray, sobely, cv.CV_16S, 0, 1, 3);
    cv.convertScaleAbs(sobelx, xabs);
    cv.convertScaleAbs(sobely, yabs);
    cv.addWeighted(xabs, 0.5, yabs, 0.5, 0, energy);
    // cv.imshow('imageCanvas', energy);
    let ans = findSeam(energy);
    for (let x = image.rows - 1; x >= 0; x--) {
        let row = x;
        let col = ans[image.rows - x - 1];
        image.data[row * image.cols * 4 + col * 4] = 255;
        image.data[row * image.cols * 4 + col * 4 + 1] = 0;
        image.data[row * image.cols * 4 + col * 4 + 2] = 0;
        image.data[row * image.cols * 4 + col * 4 + 3] = 255;
    }
    cv.imshow('imageCanvas', image);

    for (let x = image.rows - 1; x >= 0; x--) {
        let row = x;
        let dcol = ans[image.rows - x - 1];
        for (let y = 0; y < image.cols; y++) {
            if (y !== dcol) {
                let col = y;
                if (y > dcol) {
                    col--;
                }
                ima.data[row * image.cols * 4 + col * 4] = image.data[row * image.cols * 4 + y * 4];
                ima.data[row * image.cols * 4 + col * 4 + 1] = image.data[row * image.cols * 4 + y * 4 + 1];
                ima.data[row * image.cols * 4 + col * 4 + 2] = image.data[row * image.cols * 4 + y * 4 + 2];
                ima.data[row * image.cols * 4 + col * 4 + 3] = image.data[row * image.cols * 4 + y * 4 + 3];
            }
        }
    }

    image.delete();
    energy.delete();
    gray.delete();
    sobelx.delete();
    sobely.delete();
}

function findSeam(energy){
    // DAG shortest path
    let x_max = energy.rows;
    let y_max = energy.cols;
    let cost = [];
    let prev = new Array(x_max * y_max);
    for (let i = 0; i < y_max; i++) {
        cost.push(energy.data[i]);
    }
    for (let i = y_max; i < x_max * y_max; i++) {
        cost.push(32767);
    }
    let cur_index = 0;
    for (let x = 0; x < x_max - 1; x++) {
        for (let y = 0; y < y_max; y++) {
            for (let next_y = Math.max(0, y - 1); next_y <= Math.min(y_max - 1, y + 1); next_y++) {
                let next_index = (x + 1) * y_max + next_y;
                let new_cost = cost[cur_index] + energy.data[next_index];
                if (new_cost < cost[next_index]) {
                    cost[next_index] = new_cost;
                    prev[next_index] = y;
                }
            }
            cur_index++;
        }
    }
    let final_cost = 32767;
    let final_col = -1;
    for (let y = 0; y < y_max; y++) {
        if (cost[cur_index] < final_cost) {
            final_cost = cost[cur_index];
            final_col = y;
        }
        cur_index++;
    }
    let result = [final_col];
    for (let x = x_max - 1; x > 0; x--) {
        result.push(prev[(x - 1) * y_max + result[result.length - 1]]);
    }
    return result;
}