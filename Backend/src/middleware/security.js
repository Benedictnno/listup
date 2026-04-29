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
 * Allow only Cloudflare-originated traffic.
 *
 * Security rationale: req.ips / X-Forwarded-For can be forged by anyone who
 * sends a request directly to the origin with a crafted header. The only
 * unforgeable source of truth is req.socket.remoteAddress — the IP of the
 * process that actually opened the TCP connection to this server. With
 * app.set('trust proxy', 1) that is always the immediate upstream peer
 * (Cloudflare's edge node in production). We validate that peer against the
 * published Cloudflare IP ranges.
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
    // 3. The actual TCP peer — cannot be spoofed via headers.
    const remoteIp = (req.socket.remoteAddress || "").replace(/^::ffff:/, "");

    // 4. Static allowlist check (dev boxes / internal tools)
    const allowedIps = (process.env.ALLOWED_DIRECT_IPS || "")
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean);
    if (allowedIps.includes(remoteIp)) {
      return next();
    }

    // 5. In production the TCP peer MUST be a Cloudflare edge node.
    if (process.env.NODE_ENV === "production") {
      const isCloudflare = CLOUDFLARE_IP_RANGES.some((range) =>
        ipRangeCheck(remoteIp, range)
      );

      if (!isCloudflare) {
        console.warn(
          `[SECURITY-DENIED] Non-Cloudflare TCP peer: ${remoteIp}`
        );
        return res.status(403).json({
          error: "Direct IP access restricted. Please access through the domain.",
        });
      }

      // cf-connecting-ip is injected by Cloudflare — its absence means the
      // request bypassed the Cloudflare proxy layer somehow.
      if (!req.headers["cf-connecting-ip"]) {
        console.warn(
          `[SECURITY-DENIED] Missing cf-connecting-ip from Cloudflare peer ${remoteIp}`
        );
        return res
          .status(403)
          .json({ error: "Access Denied. Cloudflare headers missing." });
      }
    }

    return next();
  } catch (err) {
    console.error("Cloudflare security error:", err);
    // Fail closed in production
    if (process.env.NODE_ENV === "production") {
      return res.status(500).json({ error: "Security check failed" });
    }
    return next();
  }
}

module.exports = {
  cloudflareSecurity,
};
