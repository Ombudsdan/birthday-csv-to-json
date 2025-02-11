import "./config.js";
import { FirebaseService } from "./services/firebaseService.js";
import { getFirestore } from "firebase-admin/firestore";
import { readJsonFile } from "./utils.js";

export class FirestoreService {
  firestoreDb;
  uploadData;

  constructor() {
    new FirebaseService().initialise(); // Initialise Firebase Admin
    this.firestoreDb = getFirestore(); // Initialise Connection to Firestore Database Service
  }

  setUploadData(file) {
    this.uploadData = readJsonFile(file);
    return this;
  }

  async uploadCollections(collectionNames = []) {
    collectionNames
      .forEach(async collectionName => {
        return await this.#addCollection(collectionName);
      })
      .then(() => console.log("Data upload complete"))
      .catch(error => console.error("Error uploading data:", error));
  }

  async #addCollection(collectionName) {
    if (this.uploadData) {
      const firestoreCollection = this.firestoreDb.collection(collectionName);
      const jsonCollections = this.uploadData.filter(
        data => data.collection === collectionName
      );

      for (const { doc, data } of jsonCollections) {
        try {
          await firestoreCollection.doc(doc).set(data);
        } catch (err) {
          console.log("Error adding:", err);
        }
      }
    } else {
      throw new Error(
        "No upload data is set. Make sure to have called setUploadData(file name) before attempting to add the data to a collection."
      );
    }
  }
}
