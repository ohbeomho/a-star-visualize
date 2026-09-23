// h(n) = n에서 목표 지점까지의 Heuristic 비용 (간편 추론된 비용)
// g(n) = 시작 위치에서 n까지 든 비용
// f(n) = g(n) + h(n)

/** @typedef {{x: number, y: number}} Position  */
/** @typedef {{f: number, pos: Position}} OpenSetNode */
/** @typedef {PriorityQueue<OpenSetNode>} OpenSet */

/**
 * @template T
 */
class PriorityQueue {
    /**
     * @param {(a: T, b: T) => number} comp
     */
    constructor(comp) {
        /** @type {T[]} */
        this.queue = [];
        this.comp = comp;
    }

    /**
     * @param {T} item
     */
    push(item) {
        this.queue.push(item);
        this.queue.sort(this.comp);
    }

    /**
     * @returns {T}
     */
    pop() {
        return this.queue.shift();
    }

    /**
     * @returns {boolean}
     */
    get isEmpty() {
        return this.queue.length === 0;
    }

    /**
     * @returns {number}
     */
    get size() {
        return this.queue.length;
    }
}

function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

const GRID_WIDTH = 30,
    GRID_HEIGHT = 30;

const dx = [-1, 1, 0, 0],
    dy = [0, 0, -1, 1];

// 근처 위치에서 특정 위치로 가는 데 소모되는 비용
const cost = Array.from({ length: GRID_HEIGHT }, () =>
    Array.from(
        { length: GRID_WIDTH },
        () => Math.floor(Math.random() * 20) + 1,
    ),
);

/**
 * @param {Position} start
 * @param {Position} goal
 * @returns {{path: Position[], cost: number}}
 */
function aStar(start, goal) {
    // 시작 위치에서 특정 위치로 가는 데 가장 비용이 적게 드는 경로의 비용 기록 (Closed set)
    const g = Array.from({ length: GRID_HEIGHT }, () =>
        new Array(GRID_WIDTH).fill(1e9),
    );
    g[start.y][start.x] = 0;

    /** @type {OpenSet} */
    // 비용이 계산 될 노드들 (f(n) 기준으로 정렬)
    const openSet = new PriorityQueue((a, b) => a.f - b.f);
    openSet.push({ f: 0, pos: start });

    const parent = new Map();
    const getKey = (pos) => pos.x * 10000 + pos.y;
    const getPath = (pos) => {
        const path = [];
        let curr = pos,
            currKey = getKey(curr);

        while (true) {
            path.push(curr);
            curr = parent.get(currKey);

            if (!curr) break;

            currKey = getKey(curr);
        }

        return path.toReversed();
    };

    while (!openSet.isEmpty) {
        const curr = openSet.pop();

        if (curr.pos.x === goal.x && curr.pos.y === goal.y)
            return { path: getPath(curr.pos), cost: g[goal.y][goal.x] };

        for (let i = 0; i < 4; i++) {
            const nx = curr.pos.x + dx[i],
                ny = curr.pos.y + dy[i];

            if (nx < 0 || ny < 0 || nx >= GRID_WIDTH || ny >= GRID_HEIGHT)
                continue;

            const gNext = g[curr.pos.y][curr.pos.x] + cost[ny][nx];

            if (gNext < g[ny][nx]) {
                g[ny][nx] = gNext;
                parent.set(getKey({ x: nx, y: ny }), curr.pos);

                openSet.push({
                    f: gNext + manhattan({ x: nx, y: ny }, goal),
                    pos: { x: nx, y: ny },
                });
            }
        }
    }

    return { path: null, cost: -1 };
}

const table = document.querySelector("table");
const grid = Array.from({ length: GRID_HEIGHT }, () => new Array(GRID_WIDTH));

for (let i = 0; i < GRID_HEIGHT; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < GRID_WIDTH; j++) {
        const cell = document.createElement("td");
        cell.textContent = String(cost[i][j]);
        row.appendChild(cell);

        grid[i][j] = cell;
    }

    table.appendChild(row);
}

const { path, minCost } = aStar(
    { x: 0, y: 0 },
    { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 },
);
for (let pos of path) {
    grid[pos.y][pos.x].classList.add("path");
}

// For testing
export default {
    aStar,
};
