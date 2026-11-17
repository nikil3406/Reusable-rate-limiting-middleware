
import identifyClient from "../src/identity/clientIdentifier.js";

export function createMiddleware(limiter, keyStrategy = "user-or-ip") {
    return function (req, res, next) {
        try {
            const clientId = identifyClient(req, keyStrategy);

            const result = limiter.consume(clientId);

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

                res.set("Retry-After", String(retryAfterSeconds));

                return res.status(429).json({
                    error: "Too Many Requests",
                    message: "You have exceeded the request limit.",
                    retryAfter: retryAfterSeconds
                });
            }

            return next();
        } catch (error) {
            return next(error);
        }
    };
}
