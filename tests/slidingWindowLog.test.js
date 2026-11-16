
import test from "node:test";
import assert from "node:assert/strict";

import MemoryStore from "../src/stores/memoryStore.js";
import SlidingWindowLog from "../src/algorithms/slidingWindowLog.js";

test("should allow requests within the limit", () => {
    const limiter = new SlidingWindowLog({
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

test("should reject requests exceeding the limit", () => {
    const limiter = new SlidingWindowLog({
        store: new MemoryStore(),
        windowMs: 60000,
        maxRequests: 2,
        now: () => 1000
    });

    limiter.consume("user:101");
    limiter.consume("user:101");

    const result = limiter.consume("user:101");

    assert.equal(result.allowed, false);
    assert.equal(result.retryAfterMs, 60000);
});

test("should remove expired timestamps", () => {
    let currentTime = 1000;

    const limiter = new SlidingWindowLog({
        store: new MemoryStore(),
        windowMs: 60000,
        maxRequests: 2,
        now: () => currentTime
    });

    limiter.consume("user:101");
    limiter.consume("user:101");

    // Move forward beyond the original 60-second window.
    currentTime = 61001;

    const result = limiter.consume("user:101");

    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 1);
});

test("should use independent request logs for different clients", () => {
    const limiter = new SlidingWindowLog({
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
    const limiter = new SlidingWindowLog({
        store: new MemoryStore(),
        windowMs: 60000,
        maxRequests: 5
    });

    assert.throws(
        () => limiter.consume(""),
        /clientId/
    );
});

test("should allow a request when the oldest timestamp expires", () => {
    let currentTime = 1000;

    const limiter = new SlidingWindowLog({
        store: new MemoryStore(),
        windowMs: 60000,
        maxRequests: 2,
        now: () => currentTime
    });

    limiter.consume("user:101");
    currentTime += 1000;
    limiter.consume("user:101");

    // The first request is now exactly outside the window.
    currentTime = 61000;

    const result = limiter.consume("user:101");

    assert.equal(result.allowed, true);
});
