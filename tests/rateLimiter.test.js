
import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import { rateLimiter } from "../src/index.js";

// 1. Fixed Window
test("should support Fixed Window through Express middleware", async () => {
    const app = express();

    app.use(rateLimiter({
        algorithm: "fixed-window",
        options: {
            windowMs: 60000,
            maxRequests: 2
        }
    }));

    app.get("/", (req, res) => {
        res.json({ message: "Success" });
    });

    const first = await request(app).get("/");
    const second = await request(app).get("/");
    const third = await request(app).get("/");

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
});

// 2. Token Bucket
test("should support Token Bucket through Express middleware", async () => {
    const app = express();

    app.use(rateLimiter({
        algorithm: "token-bucket",
        options: {
            capacity: 2,
            refillRate: 1
        }
    }));

    app.get("/", (req, res) => {
        res.json({ message: "Success" });
    });

    const first = await request(app).get("/");
    const second = await request(app).get("/");
    const third = await request(app).get("/");

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
});

// 3. Sliding Window Log
test("should support Sliding Window Log through Express middleware", async () => {
    const app = express();

    app.use(rateLimiter({
        algorithm: "sliding-window-log",
        options: {
            windowMs: 60000,
            maxRequests: 1
        }
    }));

    app.get("/", (req, res) => {
        res.json({ message: "Success" });
    });

    const first = await request(app).get("/");
    const second = await request(app).get("/");

    assert.equal(first.status, 200);
    assert.equal(second.status, 429);
});

// 4. Sliding Window Counter
test("should support Sliding Window Counter through Express middleware", async () => {
    const app = express();

    app.use(rateLimiter({
        algorithm: "sliding-window-counter",
        options: {
            windowMs: 60000,
            maxRequests: 1
        }
    }));

    app.get("/", (req, res) => {
        res.json({ message: "Success" });
    });

    const first = await request(app).get("/");
    const second = await request(app).get("/");

    assert.equal(first.status, 200);
    assert.equal(second.status, 429);
});

// 5. Reject unsupported algorithms
test("should reject unsupported algorithms", () => {
    assert.throws(
        () => rateLimiter({
            algorithm: "unknown",
            options: {}
        }),
        /Unsupported rate limiting algorithm/
    );
});

// 6. Reject algorithm-specific options that do not belong
test("should reject unsupported algorithm options", () => {
    assert.throws(
        () => rateLimiter({
            algorithm: "token-bucket",
            options: {
                capacity: 10,
                refillRate: 2,
                windowMs: 60000
            }
        }),
        /Unsupported options/
    );
});

// 7. Reject missing Token Bucket configuration
test("should reject missing required Token Bucket options", () => {
    assert.throws(
        () => rateLimiter({
            algorithm: "token-bucket",
            options: {
                capacity: 10
            }
        }),
        /refillRate/
    );
});

// 8. Reject invalid Fixed Window configuration
test("should reject invalid Fixed Window configuration", () => {
    assert.throws(
        () => rateLimiter({
            algorithm: "fixed-window",
            options: {
                windowMs: 60000,
                maxRequests: 0
            }
        }),
        /maxRequests/
    );
});

// 9. Reject invalid Sliding Window Log configuration
test("should reject invalid Sliding Window Log configuration", () => {
    assert.throws(
        () => rateLimiter({
            algorithm: "sliding-window-log",
            options: {
                windowMs: -1000,
                maxRequests: 10
            }
        }),
        /windowMs/
    );
});

// 10. Reject invalid Sliding Window Counter configuration
test("should reject invalid Sliding Window Counter configuration", () => {
    assert.throws(
        () => rateLimiter({
            algorithm: "sliding-window-counter",
            options: {
                windowMs: 60000,
                maxRequests: -5
            }
        }),
        /maxRequests/
    );
});

// 11. Verify default algorithm configuration
test("should use Fixed Window when no algorithm is specified", async () => {
    const app = express();

    app.use(rateLimiter({
        options: {
            windowMs: 60000,
            maxRequests: 1
        }
    }));

    app.get("/", (req, res) => {
        res.json({ message: "Success" });
    });

    const first = await request(app).get("/");
    const second = await request(app).get("/");

    assert.equal(first.status, 200);
    assert.equal(second.status, 429);
});

// 12. Verify rate limit response headers
test("should return rate limit headers", async () => {
    const app = express();

    app.use(rateLimiter({
        algorithm: "fixed-window",
        options: {
            windowMs: 60000,
            maxRequests: 2
        }
    }));

    app.get("/", (req, res) => {
        res.json({ message: "Success" });
    });

    const response = await request(app).get("/");

    assert.equal(response.status, 200);
    assert.equal(response.headers["ratelimit-limit"], "2");
    assert.equal(response.headers["ratelimit-remaining"], "1");
    assert.ok(response.headers["ratelimit-reset"]);
});
