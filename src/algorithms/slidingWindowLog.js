import slidingWindowLogOperation from "../stores/operations/slidingWindowLog.operation.js";

class SlidingWindowLog {
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
        const key = `${clientId}:sliding-window-log`;

        return slidingWindowLogOperation(this.store, {
            key,
            currentTime,
            windowMs: this.windowMs,
            maxRequests: this.maxRequests
        });
    }
}

export default SlidingWindowLog;