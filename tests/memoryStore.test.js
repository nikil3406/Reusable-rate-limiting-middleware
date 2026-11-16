
import test from "node:test";
import assert from "node:assert/strict";

import MemoryStore from "../src/stores/memoryStore.js";

test("should return 0 for a non-existing key", () => {
    const store = new MemoryStore();

    assert.equal(store.get("user:101"), 0);
});

test("should store and retrieve a value", () => {
    const store = new MemoryStore();

    store.set("user:101", 5);

    assert.equal(store.get("user:101"), 5);
});

test("should increment a counter", () => {
    const store = new MemoryStore();

    assert.equal(store.increment("user:101"), 1);
    assert.equal(store.increment("user:101"), 2);
    assert.equal(store.increment("user:101"), 3);
});

test("should maintain separate counters for different clients", () => {
    const store = new MemoryStore();

    store.increment("user:101");
    store.increment("user:101");
    store.increment("user:102");

    assert.equal(store.get("user:101"), 2);
    assert.equal(store.get("user:102"), 1);
});
