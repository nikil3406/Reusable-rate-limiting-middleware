
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
        const windowStart = currentTime - this.windowMs;

        const key = `${clientId}:sliding-window-log`;

        // Retrieve the client's previous request timestamps.
        const storedTimestamps = this.store.get(key);

        const timestamps = Array.isArray(storedTimestamps)
            ? storedTimestamps
            : [];

        // Remove timestamps outside the rolling window.
        const validTimestamps = timestamps.filter(
            timestamp => timestamp > windowStart
        );

        const currentCount = validTimestamps.length;

        // Check whether the client has reached the limit.
        const allowed = currentCount < this.maxRequests;

        if (allowed) {
            validTimestamps.push(currentTime);
        }

        // Persist the updated timestamps.
        this.store.set(key, validTimestamps);

        const remaining = Math.max(
            0,
            this.maxRequests - validTimestamps.length
        );

        // Calculate when the next request can be accepted.
        const retryAfterMs = allowed
            ? 0
            : Math.max(
                0,
                validTimestamps[0] + this.windowMs - currentTime
            );

        const resetAt = validTimestamps.length > 0
            ? validTimestamps[0] + this.windowMs
            : currentTime + this.windowMs;

        return {
            allowed,
            limit: this.maxRequests,
            remaining,
            retryAfterMs,
            resetAt
        };
    }
}

export default SlidingWindowLog;
