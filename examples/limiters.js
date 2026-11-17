import MemoryStore from "../src/stores/memoryStore.js";
import TokenBucket from "../src/algorithms/tokenBucket.js";
import SlidingWindowCounter from "../src/algorithms/slidingWindowCounter.js";
import { createMiddleware } from "./limiterMiddleware.js";

export const authLimiter = createMiddleware(
    new SlidingWindowCounter({
        store: new MemoryStore(),
        windowMs: 15 * 60 * 1000,
        maxRequests: 10
    }),
    "ip"
);

export const readLimiter = createMiddleware(
    new TokenBucket({
        store: new MemoryStore(),
        capacity: 100,
        refillRate: 5
    }),
    "user-or-ip"
);

export const writeLimiter = createMiddleware(
    new TokenBucket({
        store: new MemoryStore(),
        capacity: 10,
        refillRate: 0.5
    }),
    "user-or-ip"
);