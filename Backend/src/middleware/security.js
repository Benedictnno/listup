// middleware/security.js
const ipRangeCheck = require("ip-range-check");

/**
 * Cloudflare edge IP ranges (latest from: https://www.cloudflare.com/ips/)
 */
const CLOUDFLARE_IP_RANGES = [
  // IPv4
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
  // IPv6
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
];

/**
 * Extract Cloudflare-reported client IP.
 */
function extractClientIp(req) {
  return req.headers["cf-connecting-ip"] || null;
}

/**
 * Allow only Cloudflare-originated traffic.
 */
function cloudflareSecurity(req, res, next) {
  // 1. Allow OPTIONS preflight requests to bypass security checks
  if (req.method === "OPTIONS") {
    return next();
  }

  // 2. Environment bypass (useful for local development or maintenance)
  if (process.env.BYPASS_CLOUDFLARE_SECURITY === "true") {
    return next();
  }

  try {
    // 3. Extract the IP provided by Cloudflare
    const cfIp = extractClientIp(req);
    const edgeIp = req.ip.replace(/^::ffff:/, ""); // Normalize IPv4-mapped-IPv6

    // 4. Whitelist check (e.g. for development or specific internal tools)
    const allowedIps = (process.env.ALLOWED_DIRECT_IPS || "")
      .split(",")
      .map((ip) => ip.trim());
    if (allowedIps.includes(edgeIp)) {
      return next();
    }

    // 5. If we are in production, we MUST verify the source is Cloudflare
    if (process.env.NODE_ENV === "production") {
      const isCloudflare = CLOUDFLARE_IP_RANGES.some((range) =>
        ipRangeCheck(edgeIp, range),
      );

      if (!isCloudflare) {
        console.warn(
          `[SECURITY-DENIED] Non-Cloudflare IP attempted direct access: ${edgeIp}`,
        );
        return res
          .status(403)
          .json({
            error:
              "Direct IP access restricted. Please access through the domain.",
          });
      }

      if (!cfIp) {
        console.warn(
          `[SECURITY-DENIED] Cloudflare header missing from edge IP: ${edgeIp}`,
        );
        return res
          .status(403)
          .json({ error: "Access Denied. Cloudflare headers missing." });
      }
    }

    return next();
  } catch (err) {
    console.error("Cloudflare security error:", err);
    // On error, we fail closed in production for security
    if (process.env.NODE_ENV === "production") {
      return res.status(500).json({ error: "Security check failed" });
    }
    return next();
  }
}

module.exports = {
  cloudflareSecurity,
};
