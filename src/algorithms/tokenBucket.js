
class TokenBucket {
    constructor({
        store,
        capacity,
        refillRate,
        now = Date.now
    }) {
        if (!store) {
            throw new Error("A storage instance is required");
        }

        if (!Number.isInteger(capacity) || capacity <= 0) {
            throw new Error("capacity must be a positive integer");
        }

        if (!Number.isFinite(refillRate) || refillRate <= 0) {
            throw new Error("refillRate must be a positive number");
        }

        if (typeof now !== "function") {
            throw new Error("now must be a function");
        }

        this.store = store;
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.now = now;
    }

    consume(clientId, cost = 1) {
        if (
            typeof clientId !== "string" ||
            clientId.trim() === ""
        ) {
            throw new Error("A valid clientId is required");
        }

        if (
            !Number.isFinite(cost) ||
            cost <= 0 ||
            cost > this.capacity
        ) {
            throw new Error("cost must be positive and no greater than capacity");
        }

        const currentTime = this.now();
        const key = `${clientId}:token-bucket`;

        let state = this.store.get(key);

        // Initialize a new client's bucket as full.
        if (!state || typeof state !== "object") {
            state = {
                tokens: this.capacity,
                lastRefillTime: currentTime
            };
        }

        // Calculate elapsed time since the last refill.
        const elapsedTime = Math.max(
            0,
            currentTime - state.lastRefillTime
        );

        // Refill tokens based on elapsed time.
        const tokensToAdd =
            (elapsedTime / 1000) * this.refillRate;

        const availableTokens = Math.min(
            this.capacity,
            state.tokens + tokensToAdd
        );

        // Check whether the request can be served.
        const allowed = availableTokens >= cost;

        const remainingTokens = allowed
            ? availableTokens - cost
            : availableTokens;

        // Calculate how long the client must wait if blocked.
        const retryAfterMs = allowed
            ? 0
            : Math.ceil(
                ((cost - availableTokens) / this.refillRate) * 1000
            );

        // Save the updated bucket state.
        this.store.set(key, {
            tokens: remainingTokens,
            lastRefillTime: currentTime
        });

        return {
            allowed,
            limit: this.capacity,
            remaining: Math.floor(remainingTokens),
            retryAfterMs,
            resetAt: Math.ceil(
                currentTime +
                ((this.capacity - remainingTokens) / this.refillRate) * 1000
            )
        };
    }
}

export default TokenBucket;
