import { jest } from "@jest/globals";

// Browser-like test environment

export const width = 30;
export const height = 30;

function createClassList() {
    const classes = new Set();

    return {
        add: (...names) => names.forEach((name) => classes.add(name)),
        contains: (name) => classes.has(name),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
        toggle: (name) => {
            if (classes.has(name)) {
                classes.delete(name);
                return false;
            }

            classes.add(name);
            return true;
        },
    };
}

function installDocument() {
    const elements = new Map();
    const createElement = () => ({
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        classList: createClassList(),
        textContent: "",
    });

    elements.set("table", createElement());
    for (const selector of [
        "#astar",
        "#dijkstra",
        "#reset",
        "#reset-all",
        "#regen-weight",
        "#toggle-weight",
        "#cost",
    ])
        elements.set(selector, createElement());

    globalThis.document = {
        createElement,
        querySelector: (selector) => elements.get(selector),
    };
}

/** Loads a pathfinder with a predictable grid-cost sequence. */
export async function loadPathfinder(name, costs = []) {
    installDocument();
    let index = 0;
    jest.spyOn(Math, "random").mockImplementation(
        () => (costs[index++] ?? 0) / 20,
    );

    const module = await import(`./index.js?test=${crypto.randomUUID()}`);
    Math.random.mockRestore();
    return module.default[name];
}

export function expectValidPath(path, start, goal) {
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
        expect(
            Math.abs(current.x - previous.x) + Math.abs(current.y - previous.y),
        ).toBe(1);
    }
}
