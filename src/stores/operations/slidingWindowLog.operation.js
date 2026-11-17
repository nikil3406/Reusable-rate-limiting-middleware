function slidingWindowLogOperation(store, {
    key,
    currentTime,
    windowMs,
    maxRequests
}) {
    const windowStart = currentTime - windowMs;

    // Retrieve the client's previous request timestamps.
    const storedTimestamps = store.get(key, []);

    const timestamps = Array.isArray(storedTimestamps)
        ? storedTimestamps
        : [];

    // Remove timestamps outside the rolling window.
    const validTimestamps = timestamps.filter(
        timestamp => timestamp > windowStart
    );

    const currentCount = validTimestamps.length;

    // Check whether another request can be accepted.
    const allowed = currentCount < maxRequests;

    if (allowed) {
        validTimestamps.push(currentTime);
    }

    // Persist timestamps with a TTL to avoid stale entries.
    store.set(key, validTimestamps, windowMs);

    const remaining = Math.max(
        0,
        maxRequests - validTimestamps.length
    );

    const retryAfterMs = allowed
        ? 0
        : Math.max(
            0,
            validTimestamps[0] + windowMs - currentTime
        );

    const resetAt = validTimestamps.length > 0
        ? validTimestamps[0] + windowMs
        : currentTime + windowMs;

    return {
        allowed,
        limit: maxRequests,
        remaining,
        retryAfterMs,
        resetAt
    };
}

export default slidingWindowLogOperation;