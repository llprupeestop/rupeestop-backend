import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit"; // eslint-disable-line

dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookies", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Logging Middleware
app.use(morgan("dev"));

// Body Parsing Middlewares
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));

// Cookie Parsing Middleware
app.use(cookieParser());

// Rate Limiting

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests, please try again later.",
// });
// app.use(limiter);

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Hello, this is Rupeestop server!");
});

// Error Handling Middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

export { app };
