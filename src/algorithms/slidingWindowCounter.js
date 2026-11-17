import slidingWindowCounterOperation from "../stores/operations/slidingWindowCounter.operation.js";

class SlidingWindowCounter {
    constructor({
        store,
        windowMs,
        maxRequests,
        now = Date.now
    }) {
        if (!store) {
            throw new Error("A storage instance is required");
        }

        if (!Number.isFinite(windowMs) || windowMs <= 0) {
            throw new Error("windowMs must be a positive number");
        }

        if (!Number.isInteger(maxRequests) || maxRequests <= 0) {
            throw new Error("maxRequests must be a positive integer");
        }

        if (typeof now !== "function") {
            throw new Error("now must be a function");
        }

        this.store = store;
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.now = now;
    }

    consume(clientId) {
        if (
            typeof clientId !== "string" ||
            clientId.trim() === ""
        ) {
            throw new Error("A valid clientId is required");
        }

        const currentTime = this.now();

        const windowId = Math.floor(
            currentTime / this.windowMs
        );

        const currentKey =
            `${clientId}:sliding-counter:${windowId}`;

        const previousKey =
            `${clientId}:sliding-counter:${windowId - 1}`;

        return slidingWindowCounterOperation(this.store, {
            currentKey,
            previousKey,
            currentTime,
            windowMs: this.windowMs,
            maxRequests: this.maxRequests
        });
    }
}

export default SlidingWindowCounter;