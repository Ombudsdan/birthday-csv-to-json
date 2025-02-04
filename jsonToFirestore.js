import { readJsonFile, writeDataToJsonFile, doesFileExist } from "./utils.js";

const SOURCE_JSON_FILE = "mapped-from-csv.json";
const OUTPUT_JSON_FILE = "mapped-from-json-for-firestorm.json";

// [
//   { "collection": "users", "doc": "userId1", "data": { "username": "Alice" } },
//   { "collection": "users", "doc": "userId2", "data": { "username": "Bob" } },
//   { "collection": "plushies", "doc": "plushieId1", "data": { "name": "Teddy", "userId": "userId1", "dob": "2023-05-10" } },
//   { "collection": "plushies", "doc": "plushieId2", "data": { "name": "Bunny", "userId": "userId2", "dob": "2022-08-15" } }
// ]

if (doesFileExist(SOURCE_JSON_FILE)) {
  try {
    const json = readJsonFile(SOURCE_JSON_FILE);
    const mappedCollections = mapDocToCollection(json);

    writeDataToJsonFile(OUTPUT_JSON_FILE, mappedCollections);
  } catch (err) {
    console.error("Error reading existing JSON data:", err);
  }
}

function mapDocToCollection(json) {
  let mappedCollections = [];
  Object.entries(json).forEach(([collectionName, collectionData]) =>
    Object.entries(collectionData).forEach(([docName, docData]) =>
      mappedCollections.push({
        collection: collectionName,
        doc: docName,
        data: docData,
      })
    )
  );
  console.log(`${mappedCollections.length} Mapped Collections`);
  return mappedCollections;
}
