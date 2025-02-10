import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { randomBytes } from "crypto";

export function readJsonFile(file) {
  let result;
  try {
    const fileContent = getFileContent(file);
    if (fileContent) {
      result = JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Error reading existing JSON data:", err);
  }
  return result;
}

function getFileContent(file) {
  return readFileSync(file, "utf8").trim();
}

export function appendFile(file, data) {
  appendFileSync(file, data + "\n");
}

export function writeDataToCsvFile(file, data) {
  writeFileSync(file, data + "\n");
}

export function writeDataToJsonFile(file, data) {
  writeFileSync(file, convertToJson(data));
}

export function doesFileExist(file) {
  return existsSync(file);
}

function convertToJson(data) {
  return JSON.stringify(data, null, 2);
}

/** Trim whitespace and remove any surrounding quotes */
export function trim(str) {
  return str?.trim().replace(/^['"]+|['"]+$/g, "") || null;
}

/**  Helper function to generate a unique 20 character ID */
export function generateId() {
  return randomBytes(10).toString("hex"); // 20 characters long
}

/** Check for any missing required fields */
export function isInvalidObject(row) {
  return Object.values(row).filter((val) => !val).length > 0;
}

/** Skip completely empty rows */
export function isEmptyObject(row) {
  const allValues = Object.values(row);
  return allValues.filter((val) => !val).length === allValues.length;
}

/** This adds some flexibility in the CSV column naming, for example allowing "username" or "user". */
export function matchAllowedHeadingLabels(text, allowedWords) {
  // Escape special characters and join with "|"
  const pattern = allowedWords
    .map((word) => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
    .join("|");

  // Create regex dynamically
  const regex = new RegExp(`\\b(${pattern})\\b`, "gi"); // \b ensures whole word match

  return text.match(regex); // Returns matches or an empty array if none found
}
