// require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimiter = require("./middleware/rateLimiter");
const apiRoutes = require("./api");
const {
    errorHandler,
    notFoundHandler,
    validationErrorHandler,
} = require("./middleware");

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST", 'PATCH', "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// General API rate limit
app.use(
    "/api/",
    rateLimiter({
        limit: 200,
        windowMs: 15 * 60 * 1000,
    })
);

app.options("*", cors());  // Handle all OPTIONS requests

app.use("/api", apiRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));


app.get("/", (req, res) => {
    res.send("Welcome to the SolPulse API!");
});

app.get("/favicon.ico", (req, res) => {
    res.sendStatus(204);
});

// Error handlers
app.use(validationErrorHandler);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;