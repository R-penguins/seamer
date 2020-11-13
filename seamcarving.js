function findSeam(energy){
    let x_max = energy.rows;
    let y_max = energy.cols;
    let cost = new cv.Mat(x_max, y_max, cv.CV_16S);
    let prev = cost.clone();
    for (i = 0; i < x_max * y_max; i++) {
        cost.data[i] = 255;
    }
    let queue = new PriorityQueue();
    queue.enqueue(-1, 0);
}