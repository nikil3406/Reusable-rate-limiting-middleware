
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
        if (typeof clientId !== "string" || clientId.trim() === "") {
            throw new Error("A valid clientId is required");
        }

        const currentTime = Date.now();

        const windowId = Math.floor(
            currentTime / this.windowMs
        );

        const key = `${clientId}:window:${windowId}`;

        const currentCount = this.store.get(key);

        if (currentCount >= this.maxRequests) {
            return {
                allowed: false,
                limit: this.maxRequests,
                remaining: 0,
                resetAt: (windowId + 1) * this.windowMs
            };
        }

        const updatedCount = this.store.increment(key);

        return {
            allowed: true,
            limit: this.maxRequests,
            remaining: this.maxRequests - updatedCount,
            resetAt: (windowId + 1) * this.windowMs
        };
    }
}

export default FixedWindow;
