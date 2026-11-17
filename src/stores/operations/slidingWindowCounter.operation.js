function slidingWindowCounterOperation(store, {
    currentKey,
    previousKey,
    currentTime,
    windowMs,
    maxRequests
}) {
    const windowId = Math.floor(currentTime / windowMs);
    const windowStart = windowId * windowMs;

    // Time elapsed in the current fixed window.
    const elapsedTime = currentTime - windowStart;

    // Calculate the previous window's contribution.
    const previousWindowWeight =
        (windowMs - elapsedTime) / windowMs;

    const currentCount = store.get(currentKey, 0);
    const previousCount = store.get(previousKey, 0);

    // Estimate requests in the rolling window.
    const estimatedCount =
        previousCount * previousWindowWeight +
        currentCount;

    const allowed = estimatedCount < maxRequests;

    let updatedCount = currentCount;

    if (allowed) {
        updatedCount++;

        // Keep the current window's count for use as
        // the previous window in the next time window.
        store.set(currentKey, updatedCount, windowMs * 2);
    }

    const updatedEstimatedCount =
        previousCount * previousWindowWeight +
        updatedCount;

    const remaining = Math.max(
        0,
        Math.floor(maxRequests - updatedEstimatedCount)
    );

    let retryAfterMs = 0;

    if (!allowed) {
        if (currentCount < maxRequests && previousCount > 0) {
            // The previous window's contribution must decay
            // until another request can be accepted.
            const requiredElapsedTime =
                windowMs *
                (1 - (maxRequests - currentCount) / previousCount);

            // Add 1ms because equality with the limit is still blocked.
            retryAfterMs = Math.max(
                1,
                Math.floor(requiredElapsedTime - elapsedTime) + 1
            );
        } else {
            // The current count itself has reached the limit.
            // Wait for the current window to roll over, then
            // allow the previous window's contribution to decay.
            const nextWindowElapsedTime = currentCount > 0
                ? windowMs * (1 - maxRequests / currentCount)
                : 0;

            retryAfterMs =
                windowMs -
                elapsedTime +
                Math.floor(nextWindowElapsedTime) +
                1;
        }
    }

    return {
        allowed,
        limit: maxRequests,
        remaining,
        estimatedCount: updatedEstimatedCount,
        retryAfterMs,
        resetAt: windowStart + windowMs
    };
}

export default slidingWindowCounterOperation;