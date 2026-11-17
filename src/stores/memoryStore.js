import StoreInterface from "./store.interface.js";

class MemoryStore extends StoreInterface {
    constructor({ now = Date.now } = {}) {
        super();

        if (typeof now !== "function") {
            throw new Error("now must be a function");
        }

        this.store = new Map();
        this.now = now;
    }

    get(key, defaultValue = undefined) {
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
            throw new Error(
                "ttlMs must be a non-negative number or null"
            );
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
}

export default MemoryStore;