const auditService = require("../services/audit.service");

/**
 * Middleware to automatically audit log certain requests.
 * @param {string} action - The action being performed (e.g., "DELETE_LISTING")
 * @param {string} targetType - The type of object being affected (e.g., "LISTING")
 */
const auditLog = (action, targetType) => {
  return async (req, res, next) => {
    // We wrap the original end method to log after the request is finished
    const originalEnd = res.end;

    res.end = function (chunk, encoding) {
      res.end = originalEnd;
      const response = res.end(chunk, encoding);

      // Only log successful or specifically interesting status codes
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user.id : null;
        const targetId = req.params.id || req.body.id || null;

        // Extract metadata if needed (exclude sensitive info)
        const metadata = { ...req.body };
        delete metadata.password;
        delete metadata.token;

        auditService.log({
          userId,
          action,
          targetType,
          targetId,
          metadata,
          req,
        });
      }

      return response;
    };

    next();
  };
};

module.exports = { auditLog };
