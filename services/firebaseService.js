import "../config.js";
import path from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { readJsonFile } from "../utils.js";

export class FirebaseService {
  initialise() {
    const serviceAccountPath = path.join(
      process.cwd(),
      process.env.GOOGLE_APPLICATION_CREDENTIALS
    );

    const serviceAccountData = readJsonFile(serviceAccountPath);
    try {
      initializeApp({ credential: cert(serviceAccountData) });
      console.log("Firebase Admin initialised");
    } catch {
      throw new Error("Firebase Admin failed to initialise");
    }
  }
}
