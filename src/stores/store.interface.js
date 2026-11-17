
class StoreInterface {
    async get(key) {
        throw new Error("get() must be implemented");
    }

    async set(key, value, ttlMs = null) {
        throw new Error("set() must be implemented");
    }

    async delete(key) {
        throw new Error("delete() must be implemented");
    }

    async atomicUpdate(key, operation, args = {}) {
        throw new Error("atomicUpdate() must be implemented");
    }
}

export default StoreInterface;
