import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

const serviceAccountPath = path.resolve(__dirname, "firebase-service-account.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export const authAdmin = admin.auth();
