function fixedWindowOperation(store, {
    key,
    maxRequests,
    ttlMs
}) {
    // Retrieve the request count for this client's current window.
    const currentCount = store.get(key, 0);

    // Check whether another request can be accepted.
    const allowed = currentCount < maxRequests;

    // Increment only when the request is allowed.
    const updatedCount = allowed
        ? currentCount + 1
        : currentCount;

    // Persist the updated count.
    // TTL removes this window's entry after the window expires.
    store.set(key, updatedCount, ttlMs);

    return {
        allowed,
        count: updatedCount
    };
}

export default fixedWindowOperation;