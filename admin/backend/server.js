require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendors");
const listingRoutes = require("./routes/listings");
const dashboardRoutes = require("./routes/dashboard");
const usersRoutes = require("./routes/users");
const addressesRoutes = require("./routes/addresses");
const categoriesRoutes = require("./routes/categories");
const advertisementsRoutes = require("./routes/advertisements");
const uploadsRoutes = require("./routes/uploads");
const kycRoutes = require("./routes/kyc");

const app = express();
const PORT = process.env.ADMIN_PORT || 4001;

// 1. Trust proxy configuration (MUST BE ABSOLUTE TOP for accurate IP/Header resolution)
app.set("trust proxy", true);

// 2. Early Preflight Handshake (Bypasses all subsequent logic)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.get("origin");
    console.log(
      `[ADMIN-PREFLIGHT] Path: ${req.originalUrl}, Origin: ${origin}, IP: ${req.ip}`,
    );
  }
  next();
});

// 3. Dynamic CORS configuration
const whitelist = [
  "http://localhost:3001", // Admin frontend
  "http://localhost:3002", // Main frontend
  "http://localhost:3000", // Main frontend
  "https://listup-admin.vercel.app", // Admin production
  "https://listup-admin-vdf5.onrender.app", // Admin backend itself
  "https://listup.ng",
  "https://www.listup.ng",
  "https://api.listup.ng",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);

    if (whitelist.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.warn("Admin CORS Blocked for origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Cookie parsing middleware
app.use(cookieParser());

// 4. Security & Logging
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// 5. Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
// app.use(morgan('combined'));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "ListUp Admin Backend",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/advertisements", advertisementsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/referrals", require("./routes/referrals"));
app.use("/api/features", require("./routes/features"));
app.use("/api/payouts", require("./routes/admin-payouts.routes"));
app.use("/api/partners", require("./routes/partner-analytics.routes"));
app.use("/api/settings", require("./routes/settings.routes"));
app.use("/api/audit", require("./routes/audit"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors,
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Admin backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
