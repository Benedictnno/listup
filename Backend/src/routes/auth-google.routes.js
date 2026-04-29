const router = require('express').Router();
const passport = require('passport');
const { sign } = require('../lib/jwt');
const { getFrontendUrl } = require('../utils/url');
require('../config/passport-google');

router.get(
  '/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${getFrontendUrl()}/login?error=google_failed`,
  }),
  (req, res) => {
    const user = req.user;

    const token = sign({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${getFrontendUrl()}/dashboard`);
  }
);

module.exports = router;
