import admin from "firebase-admin";

declare global {
  // eslint-disable-next-line no-var
  var __FIREBASE_ADMIN__: admin.app.App | undefined;
}

if (!global.__FIREBASE_ADMIN__) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  admin.initializeApp(
    projectId && clientEmail && privateKey
      ? {
          credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        }
      : {}
  );
  global.__FIREBASE_ADMIN__ = admin.app();
}

export const adminApp = global.__FIREBASE_ADMIN__!;
export const db = admin.firestore();
export const bucket = admin.storage().bucket();
export const auth = admin.auth();
