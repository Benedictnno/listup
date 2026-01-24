const ReferralService = require('../services/referral.service');

class ReferralTrackingController {

    /**
     * GET /r/:code
     * Tracks the click and redirects to home.
     */
    async handleRedirect(req, res) {
        try {
            const { code } = req.params;
            const ip = req.ip || req.connection.remoteAddress;
            const ua = req.headers['user-agent'] || 'unknown';

            // Track click
            const clickId = await ReferralService.trackClick(code, ip, ua);

            // Set cookie if tracking started
            // Note: We'll overwrite if they click a new link, which is fair. 
            // Only set if we actually got a clickId (meaning valid code).
            if (clickId) {
                // Secure cookie, 24h expiry
                res.cookie('ref_click_id', clickId, {
                    maxAge: 24 * 60 * 60 * 1000,
                    httpOnly: false, // Frontend needs to read it? Or we can check it via API? 
                    // If httpOnly: false, frontend can read "ref_click_id" to start timer.
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax'
                });
            }

            // Redirect to signup page
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const targetUrl = `${frontendUrl}/signup`;
            return res.redirect(targetUrl);

        } catch (error) {
            console.error('Referral Redirect Error:', error);
            // Fallback redirect even if error
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const targetUrl = `${frontendUrl}/signup`;
            return res.redirect(targetUrl);
        }
    }

    /**
     * POST /api/referral/qualify
     * Called by frontend after engagement timer.
     */
    async qualifyClick(req, res) {
        try {
            // 1. Try to get clickId from Cookie
            const clickId = req.cookies?.ref_click_id || req.body.clickId;

            if (!clickId) {
                return res.status(400).json({ success: false, message: 'No click ID found' });
            }

            const result = await ReferralService.qualifyClick(clickId);

            if (result.success) {
                return res.json({ success: true });
            } else {
                return res.status(400).json({ success: false, message: result.reason });
            }

        } catch (error) {
            console.error('Qualify Click Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * GET /api/referral/leaderboard
     * Public leaderboard stats.
     */
    async getLeaderboard(req, res) {
        try {
            const leaderboard = await ReferralService.getLeaderboard();
            return res.json({ success: true, data: leaderboard });
        } catch (error) {
            console.error('Leaderboard Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
}

module.exports = new ReferralTrackingController();
