// middleware/security.js
const ipRangeCheck = require("ip-range-check");

/**
 * Cloudflare edge IP ranges (from: https://api.cloudflare.com/client/v4/ips)
 */
const CLOUDFLARE_IP_RANGES = [
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
  "172.64.0.0/13",
  "131.0.72.0/22",
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
  try {
    const clientIp = extractClientIp(req);

    // No Cloudflare header = someone hit Render directly
    if (!clientIp) {
      return res.status(403).json({
        status: "forbidden",
        message: "Request rejected: must pass through Cloudflare.",
      });
    }

    // Validate the ORIGIN IP (Cloudflare edge → your backend)
    const edgeIp = req.ip;

    const isCloudflare = CLOUDFLARE_IP_RANGES.some((range) =>
      ipRangeCheck(edgeIp, range)
    );

    if (!isCloudflare) {
      return res.status(403).json({
        status: "forbidden",
        message: "Request blocked: origin is not Cloudflare.",
      });
    }

    // Passed all checks
    return next();
  } catch (err) {
    console.error("Cloudflare security error:", err);
    return res.status(500).json({
      message: err.message || "Internal security error",
    });
  }
}

module.exports = {
  cloudflareSecurity,
};
