
import MemoryStore from "../stores/memoryStore.js";
import FixedWindow from "../algorithms/fixedWindow.js";
import identifyClient from "../identity/clientIdentifier.js";

function rateLimiter({
    windowMs = 60000,
    maxRequests = 100,
    keyStrategy = "user-or-ip",
    store = new MemoryStore()
} = {}) {

    const algorithm = new FixedWindow({
        store,
        windowMs,
        maxRequests
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
            result = algorithm.consume(clientId);
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
            return res.status(429).json({
                error: "Too Many Requests",
                message: "You have exceeded the request limit.",
                retryAfter: Math.max(
                    0,
                    Math.ceil((result.resetAt - Date.now()) / 1000)
                )
            });
        }

        next();
    };
}

export { rateLimiter };
