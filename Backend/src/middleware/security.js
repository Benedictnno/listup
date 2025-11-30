// middleware/security.ts
import ipRangeCheck from "ip-range-check";

/**
 * Cloudflare official IP ranges (IPv4)
 * Source: https://api.cloudflare.com/client/v4/ips
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
 * Global middleware:
 * Allows ONLY traffic routed through Cloudflare.
 * Blocks ALL direct traffic to your Render origin URL.
 */
export function cloudflareSecurity(
  req,
  res,
  next
) {
  const clientIp = extractClientIp(req);

  const isFromCloudflare = CLOUDFLARE_IP_RANGES.some((range) =>
    ipRangeCheck(clientIp, range)
  );

  if (!isFromCloudflare) {
    return res.status(403).json({
      status: "forbidden",
      message:
        "Origin access blocked. Only Cloudflare edge traffic is permitted.",
    });
  }

  next();
}
