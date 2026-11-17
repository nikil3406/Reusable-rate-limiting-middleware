
import StoreInterface from "./store.interface.js";

class MemoryStore extends StoreInterface {
    constructor({ now = Date.now } = {}) {
        super();

        this.store = new Map();
        this.now = now;
    }

    get(key, defaultValue = 0) {
        const entry = this.store.get(key);

        if (!entry) {
            return defaultValue;
        }

        // Check whether the entry has expired.
        if (
            entry.expiresAt !== null &&
            entry.expiresAt <= this.now()
        ) {
            this.store.delete(key);
            return defaultValue;
        }

        return entry.value;
    }

    set(key, value, ttlMs = null) {
        if (
            ttlMs !== null &&
            (!Number.isFinite(ttlMs) || ttlMs < 0)
        ) {
            throw new Error("ttlMs must be a non-negative number or null");
        }

        const expiresAt = ttlMs === null
            ? null
            : this.now() + ttlMs;

        this.store.set(key, {
            value,
            expiresAt
        });
    }

    delete(key) {
        return this.store.delete(key);
    }

    // Existing methods retained for compatibility.
    increment(key) {
        const currentCount = this.get(key);
        const updatedCount = currentCount + 1;

        this.set(key, updatedCount);

        return updatedCount;
    }

    consume(key, maxRequests) {
        const currentCount = this.get(key);

        if (currentCount >= maxRequests) {
            return {
                allowed: false,
                count: currentCount
            };
        }

        const updatedCount = currentCount + 1;

        this.set(key, updatedCount);

        return {
            allowed: true,
            count: updatedCount
        };
    }
}

export default MemoryStore;
