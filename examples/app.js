
import express from "express";

import {
    authLimiter,
    readLimiter,
    writeLimiter
} from "./limiters.js";

const app = express();

app.use(express.json());


// ==========================================
// Demo Authentication Middleware
// ==========================================
// Replace this with your actual JWT middleware
// when integrating Sentinel into Gully News.

function authenticateToken(req, res, next) {
    const userId = req.header("x-demo-user-id");

    if (!userId) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    req.user = {
        id: userId
    };

    next();
}


// ==========================================
// Public API
// ==========================================
// No rate limiter attached.

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Sentinel protected API"
    });
});


// ==========================================
// Authentication APIs
// ==========================================
// Uses authLimiter.

app.post("/api/auth/login", authLimiter, (req, res) => {
    res.json({
        message: "Login endpoint"
    });
});

app.post("/api/auth/register", authLimiter, (req, res) => {
    res.json({
        message: "Register endpoint"
    });
});


// ==========================================
// Read APIs
// ==========================================
// Uses readLimiter.

app.get(
    "/api/posts",
    authenticateToken,
    readLimiter,
    (req, res) => {
        res.json({
            posts: ["Post 1", "Post 2", "Post 3"]
        });
    }
);


// ==========================================
// Write APIs
// ==========================================
// Uses writeLimiter.

app.post(
    "/api/posts",
    authenticateToken,
    writeLimiter,
    (req, res) => {
        res.json({
            message: "Post created successfully"
        });
    }
);

app.delete(
    "/api/posts/:id",
    authenticateToken,
    writeLimiter,
    (req, res) => {
        res.json({
            message: `Post ${req.params.id} deleted successfully`
        });
    }
);


// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
