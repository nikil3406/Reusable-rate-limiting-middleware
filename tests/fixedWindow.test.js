
import test from "node:test";
import assert from "node:assert/strict";

import MemoryStore from "../src/stores/memoryStore.js";
import FixedWindow from "../src/algorithms/fixedWindow.js";

test("should allow requests within the limit", () => {
    const store = new MemoryStore();

    const limiter = new FixedWindow({
        store,
        windowMs: 60000,
        maxRequests: 3
    });

    const first = limiter.consume("user:101");
    const second = limiter.consume("user:101");
    const third = limiter.consume("user:101");

    assert.equal(first.allowed, true);
    assert.equal(second.allowed, true);
    assert.equal(third.allowed, true);

    assert.equal(third.remaining, 0);
});

test("should block requests exceeding the limit", () => {
    const store = new MemoryStore();

    const limiter = new FixedWindow({
        store,
        windowMs: 60000,
        maxRequests: 2
    });

    limiter.consume("user:101");
    limiter.consume("user:101");

    const third = limiter.consume("user:101");

    assert.equal(third.allowed, false);
    assert.equal(third.remaining, 0);
});

test("should maintain independent counters for clients", () => {
    const store = new MemoryStore();

    const limiter = new FixedWindow({
        store,
        windowMs: 60000,
        maxRequests: 2
    });

    limiter.consume("user:101");
    limiter.consume("user:101");

    const result = limiter.consume("user:102");

    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 1);
});

test("should reject invalid client IDs", () => {
    const limiter = new FixedWindow({
        store: new MemoryStore(),
        windowMs: 60000,
        maxRequests: 5
    });

    assert.throws(() => limiter.consume(""), /clientId/);
});
