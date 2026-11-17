
class StoreInterface {
    get(key) {
        throw new Error("get() must be implemented");
    }

    set(key, value, ttlMs = null) {
        throw new Error("set() must be implemented");
    }

    delete(key) {
        throw new Error("delete() must be implemented");
    }

    atomicUpdate(operation, args = {}) {
        throw new Error("atomicUpdate() must be implemented");
    }
}

export default StoreInterface;
