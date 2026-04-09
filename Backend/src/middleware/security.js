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

    // We need to check the entire chain of IPs if we are behind multiple proxies (e.g. Cloudflare -> Vercel -> Backend)
    // req.ips contains all IPs in X-Forwarded-For if 'trust proxy' is on
    const ipChain =
      req.ips.length > 0 ? req.ips : [req.ip.replace(/^::ffff:/, "")];

    // 4. Whitelist check (e.g. for development or specific internal tools)
    const allowedIps = (process.env.ALLOWED_DIRECT_IPS || "")
      .split(",")
      .map((ip) => ip.trim());
    if (ipChain.some((ip) => allowedIps.includes(ip))) {
      return next();
    }

    // 5. If we are in production, we MUST verify that at least ONE IP in the chain is from Cloudflare
    if (process.env.NODE_ENV === "production") {
      const hasCloudflareIp = ipChain.some((ip) =>
        CLOUDFLARE_IP_RANGES.some((range) => ipRangeCheck(ip, range)),
      );

      if (!hasCloudflareIp) {
        console.warn(
          `[SECURITY-DENIED] No Cloudflare IP found in chain: ${ipChain.join(", ")}`,
        );
        console.warn(`Headers: ${JSON.stringify(req.headers)}`);
        return res.status(403).json({
          error:
            "Direct IP access restricted. Please access through the domain.",
          debug_info:
            process.env.DEBUG_SECURITY === "true"
              ? { ipChain, hasCloudflareIp }
              : undefined,
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
