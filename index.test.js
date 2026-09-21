import { jest } from "@jest/globals";

const width = 30;
const height = 30;

/** Loads the module with a predictable grid-cost sequence. */
async function loadAStar(costs = []) {
    let index = 0;
    jest.spyOn(Math, "random").mockImplementation(
        () => (costs[index++] ?? 0) / 20,
    );

    const module = await import(`./index.js?test=${crypto.randomUUID()}`);
    Math.random.mockRestore();
    return module.default.aStar;
}

function expectValidPath(path, start, goal) {
    expect(path[0]).toEqual(start);
    expect(path.at(-1)).toEqual(goal);

    for (const position of path) {
        expect(position.x).toBeGreaterThanOrEqual(0);
        expect(position.x).toBeLessThan(width);
        expect(position.y).toBeGreaterThanOrEqual(0);
        expect(position.y).toBeLessThan(height);
    }

    for (let index = 1; index < path.length; index++) {
        const previous = path[index - 1];
        const current = path[index];
        expect(Math.abs(current.x - previous.x) + Math.abs(current.y - previous.y)).toBe(1);
    }
}

describe("aStar", () => {
    test("returns a zero-cost, one-position path when start and goal match", async () => {
        const aStar = await loadAStar();

        expect(aStar({ x: 4, y: 7 }, { x: 4, y: 7 })).toEqual({
            path: [{ x: 4, y: 7 }],
            cost: 0,
        });
    });

    test("finds a contiguous path between two positions", async () => {
        const aStar = await loadAStar();
        const start = { x: 0, y: 0 };
        const goal = { x: 3, y: 2 };

        const result = aStar(start, goal);

        expect(result.cost).toBeGreaterThan(0);
        expectValidPath(result.path, start, goal);
    });

    test("uses the lowest-cost route when a direct step is expensive", async () => {
        const costs = new Array(width * height).fill(0);
        // index = y * width + x; a value of 19 produces a movement cost of 20.
        costs[1] = 19;
        const aStar = await loadAStar(costs);

        const result = aStar({ x: 0, y: 0 }, { x: 2, y: 0 });

        expect(result.cost).toBe(4);
        expect(result.path).toEqual([
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 2, y: 0 },
        ]);
    });

    test("handles routes that start or end at the grid boundary", async () => {
        const aStar = await loadAStar();
        const start = { x: 0, y: height - 1 };
        const goal = { x: width - 1, y: 0 };

        const result = aStar(start, goal);

        expectValidPath(result.path, start, goal);
    });
});
