const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return done(null, false, { message: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return done(null, false, { message: 'Invalid credentials' });

      // minimize payload
      const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
      return done(null, safeUser);
    } catch (e) {
      return done(e);
    }
  })
);

module.exports = passport;
