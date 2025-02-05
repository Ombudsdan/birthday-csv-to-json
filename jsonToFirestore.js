import { readJsonFile, writeDataToJsonFile, doesFileExist } from "./utils.js";

if (doesFileExist(process.env.MAPPED_FROM_CSV_JSON)) {
  try {
    const json = readJsonFile(process.env.MAPPED_FROM_CSV_JSON);
    const mappedCollections = mapDocToCollection(json);

    writeDataToJsonFile(process.env.MAPPED_FOR_UPLOAD_JSON, mappedCollections);
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
