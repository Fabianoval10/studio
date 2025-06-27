'use server';

import admin from 'firebase-admin';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

try {
  if (admin.apps.length === 0 && serviceAccountJson) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
    });
    console.log('[firebase-admin.ts] Firebase Admin SDK initialized successfully.');
  } else if (!serviceAccountJson) {
    console.warn(
      '[firebase-admin.ts] WARNING: FIREBASE_SERVICE_ACCOUNT_JSON is not set in environment variables. ' +
      'Firestore operations will fail. Make sure to set it in your .env or .env.local file.'
    );
  }
} catch (error: any) {
  console.error('[firebase-admin.ts] Firebase Admin initialization error:', error.message);
}

const db = admin.firestore();

export { db };
