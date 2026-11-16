
import test from "node:test";
import assert from "node:assert/strict";

import identifyClient from "../src/identity/clientIdentifier.js";

test("should identify authenticated users", () => {
    const req = {
        user: { id: 101 },
        ip: "192.168.1.10"
    };

    assert.equal(
        identifyClient(req, "user"),
        "user:101"
    );
});

test("should identify clients using IP", () => {
    const req = {
        ip: "192.168.1.10"
    };

    assert.equal(
        identifyClient(req, "ip"),
        "ip:192.168.1.10"
    );
});

test("should prefer user ID when authenticated", () => {
    const req = {
        user: { id: 101 },
        ip: "192.168.1.10"
    };

    assert.equal(
        identifyClient(req),
        "user:101"
    );
});

test("should fall back to IP for unauthenticated users", () => {
    const req = {
        ip: "192.168.1.10"
    };

    assert.equal(
        identifyClient(req),
        "ip:192.168.1.10"
    );
});

test("should reject missing user ID in user strategy", () => {
    const req = {
        ip: "192.168.1.10"
    };

    assert.throws(
        () => identifyClient(req, "user"),
        /Authenticated user ID/
    );
});

test("should reject requests without an identifiable client", () => {
    assert.throws(
        () => identifyClient({}),
        /Unable to identify client/
    );
});
