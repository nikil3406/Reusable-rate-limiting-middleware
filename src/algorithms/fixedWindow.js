import fixedWindowOperation from "../stores/operations/fixedWindow.operation.js";

class FixedWindow {
    constructor({ store, windowMs, maxRequests }) {
        if (!store) {
            throw new Error("A storage instance is required");
        }

        if (!Number.isFinite(windowMs) || windowMs <= 0) {
            throw new Error("windowMs must be a positive number");
        }

        if (!Number.isInteger(maxRequests) || maxRequests <= 0) {
            throw new Error("maxRequests must be a positive integer");
        }

        this.store = store;
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    consume(clientId) {
        if (
            typeof clientId !== "string" ||
            clientId.trim() === ""
        ) {
            throw new Error("A valid clientId is required");
        }

        const currentTime = Date.now();

        // Identify the current fixed time window.
        const windowId = Math.floor(
            currentTime / this.windowMs
        );

        // Generate a unique key for this client and window.
        const key = `${clientId}:window:${windowId}`;

        // Calculate when this window expires.
        const resetAt = (windowId + 1) * this.windowMs;

        const result = fixedWindowOperation(this.store, {
            key,
            maxRequests: this.maxRequests,
            ttlMs: resetAt - currentTime
        });

        const remaining = Math.max(
            0,
            this.maxRequests - result.count
        );

        return {
            allowed: result.allowed,
            limit: this.maxRequests,
            remaining,
            resetAt
        };
    }
}

export default FixedWindow;