const prisma = require('../lib/prisma');
const { sign } = require('../lib/jwt');
const { getFirebaseAdmin } = require('../lib/firebaseAdmin');
const { addToGoogleSheet } = require('../utils/googleSheets');

/**
 * POST /auth/firebase-google
 * Body: { idToken: string }
 *
 * Verifies the Firebase ID token, upserts the user as USER role,
 * issues an HttpOnly JWT cookie, and returns user data + isNewUser flag.
 */
exports.firebaseGoogleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    console.log('[FirebaseAuth] Received auth request');

    if (!idToken) {
      console.warn('[FirebaseAuth] Missing idToken in request body');
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    // 1. Verify token with Firebase Admin
    const admin = getFirebaseAdmin();
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
      console.log('[FirebaseAuth] Token verified for UID:', decoded.uid);
    } catch (err) {
      console.error('[FirebaseAuth] Token verification failed:', err.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired Google token' });
    }

    const { email, name, picture, uid } = decoded;
    console.log('[FirebaseAuth] Processing user:', email);

    if (!email) {
      console.warn('[FirebaseAuth] Google account missing email:', uid);
      return res.status(400).json({ success: false, message: 'Google account has no email address' });
    }

    // 2. Upsert user
    let isNewUser = false;
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Existing user — auto-verify email if not already
      if (!user.isEmailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true, emailVerifiedAt: new Date() },
        });
      }
    } else {
      // New user — create as USER role
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          password: '',           // No password for OAuth users
          profileImage: picture || null,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          role: 'USER',
          source: 'google',
        },
      });
      console.log(`[FirebaseAuth] Created new user: ${email} (${user.id}) with role: ${user.role}`);

      // Sync to Google Sheets if configured
      try {
        await addToGoogleSheet(user.name, '', user.email, '', 'USER (Google Sign-In)');
      } catch (sheetError) {
        console.error('[FirebaseAuth] Failed to sync new user to Google Sheets:', sheetError.message);
      }
    }

    // 3. Issue JWT + set cookie
    const token = sign({ id: user.id, email: user.email, name: user.name, role: user.role });

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      data: {
        isNewUser,
        user: {
          id:             user.id,
          name:           user.name,
          email:          user.email,
          role:           user.role,
          isKYCVerified:  user.isKYCVerified,
          listingLimit:   user.listingLimit,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Firebase Google auth error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during Google sign-in' });
  }
};
