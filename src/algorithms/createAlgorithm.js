
import FixedWindow from "./fixedWindow.js";
import TokenBucket from "./tokenBucket.js";
import SlidingWindowLog from "./slidingWindowLog.js";
import SlidingWindowCounter from "./slidingWindowCounter.js";

function validateOptions(options, allowedOptions, algorithm) {
    if (
        options === null ||
        typeof options !== "object" ||
        Array.isArray(options)
    ) {
        throw new Error("Algorithm options must be an object");
    }

    const unknownOptions = Object.keys(options).filter(
        key => !allowedOptions.includes(key)
    );

    if (unknownOptions.length > 0) {
        throw new Error(
            `Unsupported options for ${algorithm}: ${unknownOptions.join(", ")}`
        );
    }
}

function createAlgorithm({
    algorithm = "fixed-window",
    store,
    options = {}
}) {
    switch (algorithm) {
        case "fixed-window": {
            validateOptions(
                options,
                ["windowMs", "maxRequests"],
                algorithm
            );

            return new FixedWindow({
                store,
                windowMs: options.windowMs ?? 60000,
                maxRequests: options.maxRequests ?? 100
            });
        }

        case "token-bucket": {
            validateOptions(
                options,
                ["capacity", "refillRate"],
                algorithm
            );

            return new TokenBucket({
                store,
                capacity: options.capacity,
                refillRate: options.refillRate
            });
        }

        case "sliding-window-log": {
            validateOptions(
                options,
                ["windowMs", "maxRequests"],
                algorithm
            );

            return new SlidingWindowLog({
                store,
                windowMs: options.windowMs,
                maxRequests: options.maxRequests
            });
        }

        case "sliding-window-counter": {
            validateOptions(
                options,
                ["windowMs", "maxRequests"],
                algorithm
            );

            return new SlidingWindowCounter({
                store,
                windowMs: options.windowMs,
                maxRequests: options.maxRequests
            });
        }

        default:
            throw new Error(
                `Unsupported rate limiting algorithm: ${algorithm}`
            );
    }
}

export default createAlgorithm;
