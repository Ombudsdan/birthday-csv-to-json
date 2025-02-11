import "./config.js";
import { FirestoreService } from "./services/firestoreService.js";

new FirestoreService()
  .setUploadData(process.env.MAPPED_FOR_UPLOAD_JSON)
  .uploadCollections(["users", "plushies"]);
