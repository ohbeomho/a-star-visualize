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
// When using A* in grid, there could be many paths with same f(n).
// This is small multiplier to break ties in favor of shorter paths.
const p = 1 / (GRID_WIDTH + GRID_HEIGHT);

const dx = [-1, 1, 0, 0],
    dy = [0, 0, -1, 1];

const start = { x: 0, y: 0 },
    goal = { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 };

const weight = Array.from({ length: GRID_HEIGHT }, () =>
    Array.from(
        { length: GRID_WIDTH },
        () => Math.floor(Math.random() * 20) + 1,
    ),
);
let weighted = true;

// A* is just dijkstra with f(n)
/**
 * @param {Position} start
 * @param {Position} goal
 * @returns {{ path: Position[] | null, cost: number }}
 */
function aStar(start, goal) {
    /** @type {number[][]} */
    const g = Array.from({ length: GRID_HEIGHT }, () =>
        new Array(GRID_WIDTH).fill(Infinity),
    );
    g[start.y][start.x] = 0;

    /** @type {OpenSet} */
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

        grid[curr.pos.y][curr.pos.x].classList.add("visited");

        if (curr.pos.x === goal.x && curr.pos.y === goal.y)
            return { path: getPath(curr.pos), cost: g[goal.y][goal.x] };

        for (let i = 0; i < 4; i++) {
            const nx = curr.pos.x + dx[i],
                ny = curr.pos.y + dy[i];

            if (
                nx < 0 ||
                ny < 0 ||
                nx >= GRID_WIDTH ||
                ny >= GRID_HEIGHT ||
                grid[ny][nx].classList.contains("wall")
            )
                continue;

            const gNext =
                g[curr.pos.y][curr.pos.x] + (weighted ? weight[ny][nx] : 1);

            if (gNext < g[ny][nx]) {
                g[ny][nx] = gNext;
                parent.set(getKey({ x: nx, y: ny }), curr.pos);

                openSet.push({
                    f: gNext + manhattan({ x: nx, y: ny }, goal) * (1 + p),
                    pos: { x: nx, y: ny },
                });
            }
        }
    }

    return { path: null, cost: -1 };
}

/**
 * @param {Position} start
 * @param {Position} goal
 * @returns {{ path: Position[] | null, cost: number }}
 */
function dijkstra(start, goal) {
    const g = Array.from({ length: GRID_HEIGHT }, () =>
        new Array(GRID_WIDTH).fill(Infinity),
    );
    g[start.y][start.x] = 0;

    const openSet = new PriorityQueue((a, b) => a.g - b.g);
    openSet.push({ g: g[start.y][start.x], pos: start });

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

        grid[curr.pos.y][curr.pos.x].classList.add("visited");

        if (curr.pos.x === goal.x && curr.pos.y === goal.y)
            return { path: getPath(curr.pos), cost: g[goal.y][goal.x] };

        for (let i = 0; i < 4; i++) {
            const nx = curr.pos.x + dx[i],
                ny = curr.pos.y + dy[i];

            if (
                nx < 0 ||
                ny < 0 ||
                nx >= GRID_WIDTH ||
                ny >= GRID_HEIGHT ||
                grid[ny][nx].classList.contains("wall")
            )
                continue;

            const gNext = curr.g + (weighted ? weight[ny][nx] : 1);

            if (gNext < g[ny][nx]) {
                g[ny][nx] = gNext;
                parent.set(getKey({ x: nx, y: ny }), curr.pos);

                openSet.push({ g: gNext, pos: { x: nx, y: ny } });
            }
        }
    }

    return { path: null, cost: -1 };
}

function disableButtons() {
    buttons.forEach((button) => (button.disabled = true));
}

function enableButtons() {
    buttons.forEach((button) => (button.disabled = false));
}

/**
 * @param {boolean | undefined} removeWall
 */
function resetGrid(removeWall) {
    const removeClasses = ["path", "visited"];
    if (removeWall) removeClasses.push("wall");

    for (let i = 0; i < GRID_HEIGHT; i++)
        for (let j = 0; j < GRID_WIDTH; j++)
            grid[i][j].classList.remove(...removeClasses);
}

function regenerateWeight() {
    resetGrid();

    for (let i = 0; i < GRID_HEIGHT; i++) {
        for (let j = 0; j < GRID_WIDTH; j++) {
            weight[i][j] = Math.floor(Math.random() * 20) + 1;
            grid[i][j].textContent = String(weight[i][j]);
        }
    }
}

function toggleWeight() {
    resetGrid();

    weighted = !weighted;

    for (let i = 0; i < GRID_HEIGHT; i++) {
        for (let j = 0; j < GRID_WIDTH; j++)
            grid[i][j].classList.toggle("weighted");
    }
}

/**
 * @param {"dijkstra" | "astar"} type
 */
function findPath(type) {
    if (type !== "dijkstra" && type !== "astar") return;

    resetGrid();

    const pathFindingFunc = type === "dijkstra" ? dijkstra : aStar;
    const { path, cost: minCost } = pathFindingFunc(start, goal);

    if (!path) {
        alert("No path found.");
        return;
    }

    document.querySelector("#cost").textContent = String(minCost);

    disableButtons();

    for (let i = 0; i < path.length; i++)
        setTimeout(
            () => grid[path[i].y][path[i].x].classList.add("path"),
            (i + 1) * 20,
        );

    setTimeout(enableButtons, (path.length + 1) * 20);
}

const table = document.querySelector("table");
const grid = Array.from({ length: GRID_HEIGHT }, () => new Array(GRID_WIDTH));
const modeDisplay = document.querySelector("#mode");
const astarButton = document.querySelector("#astar"),
    dijkstraButton = document.querySelector("#dijkstra"),
    resetButton = document.querySelector("#reset"),
    resetAllButton = document.querySelector("#reset-all"),
    regenerateButton = document.querySelector("#regen-weight"),
    toggleButton = document.querySelector("#toggle-weight"),
    changeModeButton = document.querySelector("#change-mode");

const buttons = [
    astarButton,
    dijkstraButton,
    resetButton,
    resetAllButton,
    regenerateButton,
    toggleButton,
    changeModeButton,
];

for (let i = 0; i < GRID_HEIGHT; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < GRID_WIDTH; j++) {
        const cell = document.createElement("td");
        cell.textContent = String(weight[i][j]);
        cell.classList.add("weighted");
        const wallChange = () => cell.classList[mode]("wall");
        cell.addEventListener("mousedown", wallChange);
        cell.addEventListener("mouseenter", () => mousedown && wallChange());
        row.appendChild(cell);

        grid[i][j] = cell;
    }

    table.appendChild(row);
}

grid[start.y][start.x].classList.add("start");
grid[goal.y][goal.x].classList.add("goal");

astarButton.addEventListener("click", () => findPath("astar"));
dijkstraButton.addEventListener("click", () => findPath("dijkstra"));

resetButton.addEventListener("click", () => resetGrid());
resetAllButton.addEventListener("click", () => resetGrid(true));

regenerateButton.addEventListener("click", regenerateWeight);
toggleButton.addEventListener("click", toggleWeight);

let mousedown = false;
window.addEventListener("mousedown", () => (mousedown = true));
window.addEventListener("mouseup", () => (mousedown = false));

let mode = "add";
changeModeButton.addEventListener("click", () => {
    mode = mode === "add" ? "remove" : "add";
    modeDisplay.textContent = mode;
});

// For testing
export default {
    aStar,
    dijkstra,
};
