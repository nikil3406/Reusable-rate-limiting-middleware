
class MemoryStore {
    constructor() {
        this.store = new Map();
    }

    get(key) {
        return this.store.get(key) ?? 0;
    }

    set(key, value) {
        this.store.set(key, value);
    }

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
