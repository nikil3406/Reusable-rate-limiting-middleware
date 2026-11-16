
import test from "node:test";
import assert from "node:assert/strict";

import MemoryStore from "../src/stores/memoryStore.js";
import SlidingWindowCounter from "../src/algorithms/slidingWindowCounter.js";

test("should allow requests within the configured limit", () => {
    const limiter = new SlidingWindowCounter({
        store: new MemoryStore(),
        windowMs: 60000,
        maxRequests: 3,
        now: () => 1000
    });

    assert.equal(limiter.consume("user:101").allowed, true);
    assert.equal(limiter.consume("user:101").allowed, true);
    assert.equal(limiter.consume("user:101").allowed, true);

    const fourth = limiter.consume("user:101");

    assert.equal(fourth.allowed, false);
    assert.equal(fourth.remaining, 0);
});

test("should account for previous window requests", () => {
    let currentTime = 59000;

    const store = new MemoryStore();

    const limiter = new SlidingWindowCounter({
        store,
        windowMs: 60000,
        maxRequests: 10,
        now: () => currentTime
    });

    // Insert 8 requests into the previous window.
    store.set("user:101:sliding-counter:0", 8);

    // Current window is 25% elapsed.
    currentTime = 75000;

    const result = limiter.consume("user:101");

    // Previous contribution: 8 * 0.75 = 6.
    // Current contribution after request: 1.
    assert.equal(result.estimatedCount, 7);
    assert.equal(result.allowed, true);
});

test("should reject requests when estimated count reaches limit", () => {
    let currentTime = 75000;

    const store = new MemoryStore();

    const limiter = new SlidingWindowCounter({
        store,
        windowMs: 60000,
        maxRequests: 10,
        now: () => currentTime
    });

    // Previous window contribution = 9 * 0.75 = 6.75.
    store.set("user:101:sliding-counter:0", 9);

    // Add three current-window requests.
    store.set("user:101:sliding-counter:1", 3);

    const result = limiter.consume("user:101");

    // Estimated count = 6.75 + 3 = 9.75.
    // The next request would result in 10.75.
    assert.equal(result.allowed, true);
    assert.equal(result.estimatedCount, 10.75);
});

test("should maintain independent counters for different clients", () => {
    const limiter = new SlidingWindowCounter({
        store: new MemoryStore(),
        windowMs: 60000,
        maxRequests: 1,
        now: () => 1000
    });

    limiter.consume("user:101");

    const firstClient = limiter.consume("user:101");
    const secondClient = limiter.consume("user:102");

    assert.equal(firstClient.allowed, false);
    assert.equal(secondClient.allowed, true);
});

test("should reject invalid client IDs", () => {
    const limiter = new SlidingWindowCounter({
        store: new MemoryStore(),
        windowMs: 60000,
        maxRequests: 5
    });

    assert.throws(
        () => limiter.consume(""),
        /clientId/
    );
});
