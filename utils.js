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
