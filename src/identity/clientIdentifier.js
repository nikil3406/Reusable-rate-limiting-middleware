
function identifyClient(req, strategy = "user-or-ip") {
    if (!req) {
        throw new Error("Request object is required");
    }

    switch (strategy) {
        case "user": {
            const userId = req.user?.id;

            if (userId === undefined || userId === null) {
                throw new Error("Authenticated user ID is required");
            }

            return `user:${userId}`;
        }

        case "ip": {
            const ip = req.ip;

            if (!ip) {
                throw new Error("Client IP address is required");
            }

            return `ip:${ip}`;
        }

        case "user-or-ip": {
            if (req.user?.id !== undefined && req.user?.id !== null) {
                return `user:${req.user.id}`;
            }

            if (req.ip) {
                return `ip:${req.ip}`;
            }

            throw new Error("Unable to identify client");
        }

        default:
            throw new Error(`Unsupported identity strategy: ${strategy}`);
    }
}

export default identifyClient;
