
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

        // Identify the current fixed window.
        const windowId = Math.floor(
            currentTime / this.windowMs
        );

        const windowStart = windowId * this.windowMs;

        // Calculate elapsed time in the current window.
        const elapsedTime = currentTime - windowStart;

        // Calculate the proportion of the previous window
        // that overlaps with the rolling window.
        const previousWindowWeight =
            (this.windowMs - elapsedTime) / this.windowMs;

        const currentKey =
            `${clientId}:sliding-counter:${windowId}`;

        const previousKey =
            `${clientId}:sliding-counter:${windowId - 1}`;

        const currentCount = this.store.get(currentKey);

        const previousCount = this.store.get(previousKey);

        // Estimate requests in the rolling window.
        const estimatedCount =
            previousCount * previousWindowWeight +
            currentCount;

        const allowed = estimatedCount < this.maxRequests;

        // Only increment the current counter when allowed.
        let updatedCount = currentCount;

        if (allowed) {
            updatedCount++;
            this.store.set(currentKey, updatedCount);
        }

        // Calculate the updated estimated count.
        const updatedEstimatedCount =
            previousCount * previousWindowWeight +
            updatedCount;

        const remaining = Math.max(
            0,
            Math.floor(
                this.maxRequests - updatedEstimatedCount
            )
        );

        // Calculate the earliest approximate retry time.
        let retryAfterMs = 0;

        if (!allowed) {
            const requiredPreviousWeight =
                this.maxRequests - currentCount;

            const requiredElapsedTime =
                this.windowMs *
                (1 - requiredPreviousWeight / previousCount);

            const nextAllowedTime =
                windowStart + requiredElapsedTime;

            retryAfterMs = Math.max(
                0,
                Math.ceil(nextAllowedTime - currentTime)
            );
        }

        return {
            allowed,
            limit: this.maxRequests,
            remaining,
            estimatedCount: updatedEstimatedCount,
            retryAfterMs,
            resetAt: windowStart + this.windowMs
        };
    }
}

export default SlidingWindowCounter;
