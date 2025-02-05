import "./config.js";
import path from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { readJsonFile } from "./utils.js";

export function initialiseFirestore() {
  let serviceAccountPath;
  let serviceAccountData;

  serviceAccountPath = path.join(
    process.cwd(),
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );

  try {
    serviceAccountData = readJsonFile(serviceAccountPath);
  } catch {
    return; // Error handling is in readJsonFile
  }

  try {
    initializeApp({ credential: cert(serviceAccountData) });
    console.log("Firebase Admin initialised");
  } catch {
    throw new Error("Firebase Admin failed to initialise");
  }
}
