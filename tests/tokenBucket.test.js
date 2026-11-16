
import test from "node:test";
import assert from "node:assert/strict";

import MemoryStore from "../src/stores/memoryStore.js";
import TokenBucket from "../src/algorithms/tokenBucket.js";

test("should initially allow requests up to bucket capacity", () => {
    const limiter = new TokenBucket({
        store: new MemoryStore(),
        capacity: 3,
        refillRate: 1,
        now: () => 1000
    });

    assert.equal(limiter.consume("user:101").allowed, true);
    assert.equal(limiter.consume("user:101").allowed, true);
    assert.equal(limiter.consume("user:101").allowed, true);

    const fourth = limiter.consume("user:101");

    assert.equal(fourth.allowed, false);
    assert.equal(fourth.remaining, 0);
    assert.equal(fourth.retryAfterMs, 1000);
});

test("should refill tokens over time", () => {
    let currentTime = 1000;

    const limiter = new TokenBucket({
        store: new MemoryStore(),
        capacity: 2,
        refillRate: 1,
        now: () => currentTime
    });

    limiter.consume("user:101");
    limiter.consume("user:101");

    assert.equal(
        limiter.consume("user:101").allowed,
        false
    );

    // Advance time by one second.
    currentTime += 1000;

    const result = limiter.consume("user:101");

    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 0);
});

test("should not exceed bucket capacity after refill", () => {
    let currentTime = 1000;

    const limiter = new TokenBucket({
        store: new MemoryStore(),
        capacity: 3,
        refillRate: 2,
        now: () => currentTime
    });

    limiter.consume("user:101");

    // Advance time by 10 seconds.
    currentTime += 10000;

    const result = limiter.consume("user:101");

    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 2);
});

test("should maintain independent buckets for different clients", () => {
    const limiter = new TokenBucket({
        store: new MemoryStore(),
        capacity: 1,
        refillRate: 1,
        now: () => 1000
    });

    limiter.consume("user:101");

    const firstClient = limiter.consume("user:101");
    const secondClient = limiter.consume("user:102");

    assert.equal(firstClient.allowed, false);
    assert.equal(secondClient.allowed, true);
});

test("should preserve fractional tokens during refill", () => {
    let currentTime = 1000;

    const limiter = new TokenBucket({
        store: new MemoryStore(),
        capacity: 2,
        refillRate: 0.5,
        now: () => currentTime
    });

    limiter.consume("user:101");
    limiter.consume("user:101");

    currentTime += 1000;

    const result = limiter.consume("user:101");

    assert.equal(result.allowed, false);
    assert.equal(result.retryAfterMs, 1000);

    currentTime += 1000;

    const nextResult = limiter.consume("user:101");

    assert.equal(nextResult.allowed, true);
});

test("should reject invalid client IDs", () => {
    const limiter = new TokenBucket({
        store: new MemoryStore(),
        capacity: 5,
        refillRate: 1
    });

    assert.throws(
        () => limiter.consume(""),
        /clientId/
    );
});

test("should reject invalid request costs", () => {
    const limiter = new TokenBucket({
        store: new MemoryStore(),
        capacity: 5,
        refillRate: 1
    });

    assert.throws(
        () => limiter.consume("user:101", 0),
        /cost/
    );

    assert.throws(
        () => limiter.consume("user:101", 6),
        /cost/
    );
});
