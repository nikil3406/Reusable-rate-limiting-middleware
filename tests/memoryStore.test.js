import { test } from "node:test";
import assert from "node:assert/strict";

import MemoryStore from "../src/stores/memoryStore.js";

test("should return 0 for a non-existing key", () => {
    const store = new MemoryStore();

    assert.equal(store.get("missing"), 0);
});

test("should store and retrieve a value", () => {
    const store = new MemoryStore();

    store.set("name", "Sentinel");

    assert.equal(store.get("name"), "Sentinel");
});

test("should support storing objects", () => {
    const store = new MemoryStore();

    const state = {
        tokens: 5,
        lastRefillTime: 1000
    };

    store.set("bucket", state);

    assert.deepEqual(store.get("bucket"), state);
});

test("should maintain separate values for different clients", () => {
    const store = new MemoryStore();

    store.set("client-1:requests", 5);
    store.set("client-2:requests", 10);

    assert.equal(store.get("client-1:requests"), 5);
    assert.equal(store.get("client-2:requests"), 10);
});

test("should expire an entry after its TTL", () => {
    let currentTime = 1000;

    const store = new MemoryStore({
        now: () => currentTime
    });

    store.set("temporary", "value", 500);

    assert.equal(store.get("temporary"), "value");

    currentTime = 1500;

    assert.equal(store.get("temporary"), 0);
});

test("should not expire an entry without TTL", () => {
    let currentTime = 1000;

    const store = new MemoryStore({
        now: () => currentTime
    });

    store.set("permanent", "value");

    currentTime = 100000;

    assert.equal(store.get("permanent"), "value");
});

test("should delete an existing entry", () => {
    const store = new MemoryStore();

    store.set("key", "value");

    assert.equal(store.delete("key"), true);
    assert.equal(store.get("key"), 0);
});

test("should return false when deleting a missing key", () => {
    const store = new MemoryStore();

    assert.equal(store.delete("missing"), false);
});

test("should reject negative TTL values", () => {
    const store = new MemoryStore();

    assert.throws(
        () => store.set("key", "value", -100),
        /ttlMs must be a non-negative number or null/
    );
});

test("should reject non-finite TTL values", () => {
    const store = new MemoryStore();

    assert.throws(() => store.set("key", "value", Infinity));
    assert.throws(() => store.set("key", "value", NaN));
});

test("should support a custom default value", () => {
    const store = new MemoryStore();

    assert.equal(
        store.get("missing", null),
        null
    );
});