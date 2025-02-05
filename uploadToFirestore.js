import "./config.js";
import { getFirestore } from "firebase-admin/firestore";
import { readJsonFile } from "./utils.js";
import { initialiseFirestore } from "./firebase-utils.js";

initialiseFirestore();

const db = getFirestore(); // Reference to the Firestore database

const data = readJsonFile(process.env.MAPPED_FOR_UPLOAD_JSON);

// Run the upload
uploadData()
  .then(() => console.log("Data upload complete"))
  .catch(error => console.error("Error uploading data:", error));

async function uploadData() {
  await addCollection("users", "username");
  await addCollection("plushies", "name");
}

async function addCollection(collectionName, identifier) {
  const collection = db.collection(collectionName);

  for (let doc of data.filter(item => item.collection === collectionName)) {
    try {
      await collection.doc(doc.doc).set(doc.data);
      console.log(`Added: ${doc.data[identifier]}`);
    } catch (err) {
      console.log("Error adding:", err);
    }
  }
}
