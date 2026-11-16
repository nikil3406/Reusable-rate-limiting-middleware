
import express from "express";
import { rateLimiter } from "../src/index.js";

const app = express();

app.use(express.json());

app.use(rateLimiter({
    windowMs: 60000,
    maxRequests: 5,
    keyStrategy: "user-or-ip"
}));

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Sentinel protected API"
    });
});

app.get("/api/posts", (req, res) => {
    res.json({
        posts: ["Post 1", "Post 2", "Post 3"]
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
