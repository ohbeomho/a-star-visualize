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

    while (!openSet.isEmpty) {}

    return { path: [], cost: 0 };
}
