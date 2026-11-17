
import tokenBucketOperation from "../stores/operations/tokenBucket.operation.js";

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
            throw new Error(
                "cost must be positive and no greater than capacity"
            );
        }

        const currentTime = this.now();

        const key = `${clientId}:token-bucket`;

        return tokenBucketOperation(this.store, {
            key,
            capacity: this.capacity,
            refillRate: this.refillRate,
            cost,
            now: currentTime
        });
    }
}

export default TokenBucket;
