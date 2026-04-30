const router = require("express").Router();
const { body } = require("express-validator");
const passport = require("passport");
const AuthCtrl = require("../controllers/auth.controller");
const {
  loginLimiter,
  resendEmailLimiter,
} = require("../middleware/rateLimiter");
const { auditLog } = require("../middleware/audit.middleware");
const { auth } = require("../middleware/auth");

// USER or VENDOR registration
router.post(
  "/register",
  loginLimiter,
  auditLog("USER_REGISTER", "USER"),
  [
    // Basic user validation
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),

    body("phone")
      .optional()
      .customSanitizer((value) => {
        // Convert empty string to undefined so it's truly optional
        return value === "" ? undefined : value;
      })
      .trim()
      .isLength({ min: 10, max: 15 })
      .withMessage("Phone number must be between 10 and 15 characters"),

    // role field removed to prevent escalation - default is USER

    // Vendor-specific validation (only if role is VENDOR)
    body("storeName")
      .if(body("role").equals("VENDOR"))
      .trim()
      .notEmpty()
      .withMessage("Store name is required for vendor accounts")
      .isLength({ min: 2, max: 100 })
      .withMessage("Store name must be between 2 and 100 characters"),

    body("storeAddress")
      .if(body("role").equals("VENDOR"))
      .trim()
      .notEmpty()
      .withMessage("Store address is required for vendor accounts")
      .isLength({ min: 5, max: 200 })
      .withMessage("Store address must be between 5 and 200 characters"),

    body("businessCategory")
      .if(body("role").equals("VENDOR"))
      .trim()
      .notEmpty()
      .withMessage("Business category is required for vendor accounts")
      .isLength({ min: 2, max: 50 })
      .withMessage("Business category must be between 2 and 50 characters"),
  ],
  AuthCtrl.register,
);

// VENDOR registration (Strictly Validated)
router.post(
  "/register/vendor",
  loginLimiter,
  auditLog("VENDOR_REGISTER", "USER"),
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 100 }),

    body("email")
      .trim()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),

    body("password")
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required for vendors")
      .isLength({ min: 10, max: 15 }),

    body("storeName").trim().notEmpty().withMessage("Store name is required"),

    body("storeAddress")
      .trim()
      .notEmpty()
      .withMessage("Store address is required"),

    body("businessCategory")
      .trim()
      .notEmpty()
      .withMessage("Business category is required"),

    body("referralCode").optional().isString(),
  ],
  AuthCtrl.registerVendor,
);

router.post(
  "/login",
  loginLimiter,
  auditLog("USER_LOGIN", "USER"),
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),

    body("password").notEmpty().withMessage("Password is required"),
  ],
  passport.authenticate("local", { session: false }),
  AuthCtrl.login,
);

// Get current authenticated user (cookie-based)
router.get("/me", AuthCtrl.getMe);

// Password reset routes
router.post(
  "/forgot-password",
  loginLimiter,
  auditLog("FORGOT_PASSWORD", "USER"),
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
  ],
  AuthCtrl.forgotPassword,
);

router.post(
  "/verify-reset-code",
  loginLimiter,
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("code")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be exactly 6 digits"),
  ],
  AuthCtrl.verifyResetCode,
);

router.post(
  "/reset-password",
  loginLimiter,
  auditLog("RESET_PASSWORD", "USER"),
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("code")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be exactly 6 digits"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  AuthCtrl.resetPassword,
);

// Email verification routes
router.get("/verify-email", AuthCtrl.verifyEmail);

router.post(
  "/resend-verification",
  resendEmailLimiter,
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
  ],
  AuthCtrl.resendVerificationEmail,
);

// Logout route
router.post("/logout", (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
});

// Update Profile
router.put(
  "/update-profile",
  auth,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phone").optional().trim(),
  ],
  AuthCtrl.updateProfile
);

// Change Password
router.put(
  "/change-password",
  auth,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  AuthCtrl.changePassword
);

module.exports = router;
