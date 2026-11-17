class StoreInterface {
    get(key, defaultValue = undefined) {
        throw new Error("get() must be implemented");
    }

    set(key, value, ttlMs = null) {
        throw new Error("set() must be implemented");
    }

    delete(key) {
        throw new Error("delete() must be implemented");
    }
}

export default StoreInterface;