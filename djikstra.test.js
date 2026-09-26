import { expectValidPath, height, loadPathfinder, width } from "./test-utils.js";

describe("dijkstra", () => {
    test("returns a zero-cost, one-position path when start and goal match", async () => {
        const dijkstra = await loadPathfinder("dijkstra");

        expect(dijkstra({ x: 4, y: 7 }, { x: 4, y: 7 })).toEqual({
            path: [{ x: 4, y: 7 }],
            cost: 0,
        });
    });

    test("finds a contiguous path between two positions", async () => {
        const dijkstra = await loadPathfinder("dijkstra");
        const start = { x: 0, y: 0 };
        const goal = { x: 3, y: 2 };

        const result = dijkstra(start, goal);

        expect(result.cost).toBeGreaterThan(0);
        expectValidPath(result.path, start, goal);
    });

    test("uses the lowest-cost route when a direct step is expensive", async () => {
        const costs = new Array(width * height).fill(0);
        // index = y * width + x; a value of 19 produces a movement cost of 20.
        costs[1] = 19;
        const dijkstra = await loadPathfinder("dijkstra", costs);

        const result = dijkstra({ x: 0, y: 0 }, { x: 2, y: 0 });

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
        const dijkstra = await loadPathfinder("dijkstra");
        const start = { x: 0, y: height - 1 };
        const goal = { x: width - 1, y: 0 };

        const result = dijkstra(start, goal);

        expectValidPath(result.path, start, goal);
    });
});
