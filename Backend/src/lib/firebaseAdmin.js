const admin = require('firebase-admin');

let initialized = false;

function getFirebaseAdmin() {
  if (!initialized) {
    const projectId    = process.env.FIREBASE_PROJECT_ID;
    const clientEmail  = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey   = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.error('[FirebaseAdmin] Missing variables:', { projectId, clientEmail, hasPrivateKey: !!privateKey });
      throw new Error(
        'Missing Firebase Admin env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
      );
    }

    console.log('[FirebaseAdmin] Initializing with project:', projectId);
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      console.error('[FirebaseAdmin] Private key format looks invalid (missing BEGIN header)');
    } else {
      console.log('[FirebaseAdmin] Private key header found, length:', privateKey.length);
    }

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });

    initialized = true;
  }
  return admin;
}

module.exports = { getFirebaseAdmin };
