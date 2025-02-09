import "./config.js";
import { createReadStream } from "fs";
import csv from "csv-parser";
import {
  readJsonFile,
  writeDataToCsvFile,
  writeDataToJsonFile,
  appendFile,
  trim,
  generateId,
  doesFileExist,
} from "./utils.js";

const users = [];
const plushies = [];
const failedEntries = [];
const existingRows = [];

let outputJsonData = { users: {}, plushies: {} };

setupFilesAndObjects();

createReadStream(process.env.SOURCE_CSV)
  .pipe(csv())
  .on("data", (row) => {
    const plushie = {
      username: trim(row["Username"]),
      name: trim(row["Plushie Name"]),
      dob: trim(row["dob"]),
    };

    // Skip completely empty rows
    if (!plushie.username && !plushie.name && !plushie.dob) {
      return;
    }

    // Check for any missing required fields
    if (!plushie.username || !plushie.name || !plushie.dob) {
      failedEntries.push(plushie);
      return;
    }

    // Check if plushie already exists in the output (based on name and dob)
    if (doesPlushieExist(plushie)) {
      existingRows.push(plushie); // This will not be added
    } else {
      // If not found, add to plushies
      users.push(plushie.username);
      plushies.push(plushie);
    }
  })
  .on("end", () => {
    if (failedEntries.length > 0) {
      writeFailureCsvFile();
    }

    // Loop through the relevant data, mapping it as necessary
    mapJsonObjects();

    // Write the mapped data to the JSON file
    writeDataToJsonFile(process.env.MAPPED_FROM_CSV_JSON, outputJsonData);

    console.log(
      `${plushies.length} New (Added) | ${existingRows.length} Existing (Skipped) | ${failedEntries.length} Failed.`
    );
  });

function mapJsonObjects() {
  users.forEach((currentUsername) => {
    const userId = setCurrentUserId(currentUsername);

    plushies
      // Find all plushies for this user which haven't been added yet)
      .filter(
        (plushie) =>
          plushie.username === currentUsername && !doesPlushieExist(plushie)
      )
      // Loop through adding the unique results
      .forEach((plushie) => {
        outputJsonData.plushies[generateId()] = {
          name: plushie.name,
          userId: `/users/${userId}`,
          dob: plushie.dob,
        };
      });
  });
}

function setCurrentUserId(currentUsername) {
  let userId = Object.keys(outputJsonData.users).find(
    (id) => outputJsonData.users[id].username === currentUsername
  );

  // Add a new user if there is no matching user id
  if (!userId) {
    userId = generateId();
    outputJsonData.users[userId] = { username: currentUsername };
  }
  return userId;
}

/** Adds any failed rows to the CSV for correction */
function writeFailureCsvFile() {
  if (failedEntries.length === 0) return; // Prevent writing an empty file

  const failedCsvContent = failedEntries
    .map((entry) => `${entry.Username},${entry["Plushie Name"]},${entry.dob}`)
    .join("\n");

  // Append instead of overwriting
  appendFile(process.env.ERRORS_CSV, failedCsvContent);
}

/** Sets up and checks the necessary files and objects before proceeding */
function setupFilesAndObjects() {
  // If an input CSV file is missing, handle the error
  if (!doesFileExist(process.env.SOURCE_CSV)) {
    console.error(
      `Error: The input CSV file "${process.env.SOURCE_CSV}" does not exist.`
    );
    process.exit(1); // Exit the script with an error code
  }

  // If an output CSV file exists, load in that existing data
  if (doesFileExist(process.env.MAPPED_FROM_CSV_JSON)) {
    outputJsonData =
      readJsonFile(process.env.MAPPED_FROM_CSV_JSON) ?? outputJsonData;
  }

  // If an error CSV doesn't exist, create one with headers
  if (!doesFileExist(process.env.ERRORS_CSV)) {
    writeDataToCsvFile(process.env.ERRORS_CSV, "Username,Plushie Name,dob\n");
  }
}

function doesPlushieExist(plushie) {
  return Object.values(outputJsonData.plushies).find(
    (matchingPlushie) =>
      matchingPlushie.name === plushie.name &&
      matchingPlushie.dob === plushie.dob
  );
}
