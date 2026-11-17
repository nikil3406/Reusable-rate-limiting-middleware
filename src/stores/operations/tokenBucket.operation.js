
function tokenBucketOperation(store, {
    key,
    capacity,
    refillRate,
    cost = 1,
    now
}) {
    // Retrieve existing bucket state.
    let state = store.get(key, null);

    // Initialize a new bucket.
    if (
        !state ||
        typeof state !== "object" ||
        !Number.isFinite(state.tokens) ||
        !Number.isFinite(state.lastRefillTime)
    ) {
        state = {
            tokens: capacity,
            lastRefillTime: now
        };
    }

    // Calculate elapsed time.
    const elapsedTime = Math.max(
        0,
        now - state.lastRefillTime
    );

    // Refill tokens.
    const tokensToAdd =
        (elapsedTime / 1000) * refillRate;

    const availableTokens = Math.min(
        capacity,
        state.tokens + tokensToAdd
    );

    // Check whether the request is allowed.
    const allowed = availableTokens >= cost;

    const remainingTokens = allowed
        ? availableTokens - cost
        : availableTokens;

    // Calculate retry time.
    const retryAfterMs = allowed
        ? 0
        : Math.ceil(
            ((cost - availableTokens) / refillRate) * 1000
        );

    // Persist updated bucket state.
    store.set(key, {
        tokens: remainingTokens,
        lastRefillTime: now
    });

    return {
        allowed,
        limit: capacity,
        remaining: Math.floor(remainingTokens),
        retryAfterMs,
        resetAt: Math.ceil(
            now +
            ((capacity - remainingTokens) / refillRate) * 1000
        )
    };
}

export default tokenBucketOperation;
