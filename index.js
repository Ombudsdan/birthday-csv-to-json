import {
  createReadStream,
  writeFileSync,
  existsSync,
  readFileSync,
  appendFileSync,
} from "fs";
import csv from "csv-parser";
import { randomBytes } from "crypto";

const INPUT_CSV_FILE = "input.csv";
const OUTPUT_CSV_FILE = "output.json";
const ERROR_CSV_FILE = "errors.csv";

const tempUsers = [];
const tempPlushies = [];
const failedEntries = [];
const existingRows = [];

let outputJsonData = { users: {}, plushies: {} };

// If an input CSV file is missing, handle the error
if (!existsSync(INPUT_CSV_FILE)) {
  console.error(
    `Error: The input CSV file "${INPUT_CSV_FILE}" does not exist.`
  );
  process.exit(1); // Exit the script with an error code
}

// If an output CSV file exists, load in that existing data
if (existsSync(OUTPUT_CSV_FILE)) {
  try {
    const fileContent = readFileSync(OUTPUT_CSV_FILE, "utf8").trim();
    if (fileContent) {
      outputJsonData = JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Error reading existing JSON data:", err);
  }
}

// If an error CSV doesn't exist, create one
if (!existsSync(ERROR_CSV_FILE)) {
  writeFileSync(ERROR_CSV_FILE, "Username,Plushie Name,dob\n"); // Create with headers
}

createReadStream(INPUT_CSV_FILE)
  .pipe(csv())
  .on("data", row => {
    const plushie = {
      username: trimWhitespace(row["Username"]),
      name: trimWhitespace(row["Plushie Name"]),
      dob: trimWhitespace(row["dob"]),
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
    if (findExistingPlushie(plushie)) {
      existingRows.push(plushie); // This will not be added
    } else {
      // If not found, add to tempPlushies
      tempUsers.push(plushie.username);
      tempPlushies.push(plushie);
    }
  })
  .on("end", () => {
    // Write all failed rows to a CSV file
    const noOfFailedEntries = failedEntries.length;
    if (noOfFailedEntries > 0) {
      writeFailureCsvFile();
    }

    // Write all new rows to a JSON file
    writeJsonFile();

    console.log(
      `${tempPlushies.length} New (Added) | ${existingRows.length} Existing (Skipped) | ${failedEntries.length} Failed.`
    );
  });

function writeJsonFile() {
  tempUsers.forEach(username => {
    // Get the current user's id if the user already exists
    let userId = Object.keys(outputJsonData.users).find(
      id => outputJsonData.users[id].username === username
    );

    // Add a new user if there is no matching user id
    if (!userId) {
      userId = generateId();
      outputJsonData.users[userId] = { username };
    }

    tempPlushies
      .filter(plushie => {
        // Find all plushies for this user which haven't been added yet
        return plushie.username === username && !findExistingPlushie(plushie);
      })
      .forEach(plushie => {
        // Loop through adding the unique results
        outputJsonData.plushies[generateId()] = {
          name: plushie.name,
          userId: `/users/${userId}`,
          dob: plushie.dob,
        };
      });
  });

  // Write the final product to the JSON file
  writeFileSync(OUTPUT_CSV_FILE, JSON.stringify(outputJsonData, null, 2));
}

/** Adds any failed rows to the CSV for correction */
function writeFailureCsvFile() {
  if (failedEntries.length === 0) return; // Prevent writing an empty file

  const failedCsvContent = failedEntries
    .map(entry => `${entry.Username},${entry["Plushie Name"]},${entry.dob}`)
    .join("\n");

  appendFileSync(ERROR_CSV_FILE, failedCsvContent + "\n"); // Append instead of overwriting
}

function findExistingPlushie(plushie) {
  return Object.values(outputJsonData.plushies).find(
    matchingPlushie =>
      matchingPlushie.name === plushie.name &&
      matchingPlushie.dob === plushie.dob
  );
}

/**  Helper function to generate a unique 20 character ID */
function generateId() {
  return randomBytes(10).toString("hex"); // 20 characters long
}

// Trim whitespace and remove any surrounding quotes
function trimWhitespace(str) {
  return str?.trim().replace(/^['"]+|['"]+$/g, "") || null;
}
