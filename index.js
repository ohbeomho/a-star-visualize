// TODO: Change to MinHeap implementation
class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    push(item) {
        this.queue.push(item);
        this.queue.sort((a, b) => a.totalCost - b.totalCost);
    }

    pop() {
        return this.queue.shift();
    }

    get top() {
        return this.queue[0];
    }

    get isEmpty() {
        return this.queue.length === 0;
    }
}

const GRID_WIDTH = 50;
const GRID_HEIGHT = 50;

const grid = [];
const table = document.createElement("table");

for (let i = 0; i < GRID_HEIGHT; i++) {
    grid.push(
        Array.from({ length: GRID_WIDTH }, () => ({
            domElement: document.createElement("td"),
            isWall: false,
            cost: 0,
            hCost: 0, // heuristic cost (현재 노드에서 목표 노드까지 예상되는 비용(거리))
            totalCost: 0, // cost + heuristic cost
            parent: null,
        })),
    );

    const tableRow = document.createElement("tr");

    for (let j = 0; j < GRID_WIDTH; j++)
        tableRow.appendChild(grid[i][j].domElement);

    table.appendChild(tableRow);
}
