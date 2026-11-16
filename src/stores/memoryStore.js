
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
}

export default MemoryStore;
