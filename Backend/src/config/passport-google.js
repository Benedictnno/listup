const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const prisma = require('../lib/prisma');
const { sign } = require('../lib/jwt');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email from Google profile'), null);
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          if (!user.isEmailVerified) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { isEmailVerified: true, emailVerifiedAt: new Date() },
            });
          }
        } else {
          user = await prisma.user.create({
            data: {
              name: profile.displayName || email.split('@')[0],
              email,
              password: '',
              profileImage: profile.photos?.[0]?.value || null,
              isEmailVerified: true,
              emailVerifiedAt: new Date(),
              role: 'USER',
              source: 'google',
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
