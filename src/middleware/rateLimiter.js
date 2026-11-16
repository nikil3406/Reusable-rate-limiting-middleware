
import MemoryStore from "../stores/memoryStore.js";
import createAlgorithm from "../algorithms/createAlgorithm.js";
import identifyClient from "../identity/clientIdentifier.js";

function rateLimiter({
    algorithm = "fixed-window",
    options = {},
    keyStrategy = "user-or-ip",
    store = new MemoryStore()
} = {}) {
    const limiter = createAlgorithm({
        algorithm,
        store,
        options
    });

    return function (req, res, next) {
        let clientId;

        try {
            clientId = identifyClient(req, keyStrategy);
        } catch (error) {
            return next(error);
        }

        let result;

        try {
            result = limiter.consume(clientId);
        } catch (error) {
            return next(error);
        }

        res.set({
            "RateLimit-Limit": String(result.limit),
            "RateLimit-Remaining": String(result.remaining),
            "RateLimit-Reset": String(
                Math.ceil(result.resetAt / 1000)
            )
        });

        if (!result.allowed) {
            const retryAfterMs =
                result.retryAfterMs ??
                Math.max(0, result.resetAt - Date.now());

            const retryAfterSeconds = Math.ceil(
                retryAfterMs / 1000
            );

            res.set(
                "Retry-After",
                String(retryAfterSeconds)
            );

            return res.status(429).json({
                error: "Too Many Requests",
                message: "You have exceeded the request limit.",
                retryAfter: retryAfterSeconds
            });
        }

        return next();
    };
}

export { rateLimiter };
