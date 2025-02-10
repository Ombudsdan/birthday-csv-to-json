import "../config.js";
import {
  readJsonFile,
  writeDataToCsvFile,
  appendFile,
  doesFileExist,
} from "../utils.js";

export class CsvToJsonService {
  builder;

  constructor(selectedBuilder) {
    this.builder = selectedBuilder;
  }

  /** Sets up and checks the necessary files and objects before proceeding */
  setupFilesAndObjects() {
    // If an input CSV file is missing, handle the error
    if (!doesFileExist(process.env.SOURCE_CSV)) {
      console.error(
        `Error: The input CSV file "${process.env.SOURCE_CSV}" does not exist.`
      );
      process.exit(1); // Exit the script with an error code
    }

    // If an output CSV file exists, load in that existing data
    if (doesFileExist(process.env.MAPPED_FROM_CSV_JSON)) {
      this.builder.data =
        readJsonFile(process.env.MAPPED_FROM_CSV_JSON) ?? this.builder.data;
    }

    // If an error CSV doesn't exist, create one with headers
    if (!doesFileExist(process.env.ERRORS_CSV)) {
      writeDataToCsvFile(
        process.env.ERRORS_CSV,
        this.builder.columnHeadings.join(",") + "\n"
      );
    }
  }

  writeFailedRowsToCsv() {
    if (this.builder.failedRows.length > 0) {
      const csvContent = this.builder.failedRows
        .map((entry) => {
          const test = this.builder.columnHeadings
            .map((heading) => entry[heading] || "undefined")
            .join(",");
          return test;
        })
        .join("\n");

      // Append instead of overwriting
      appendFile(process.env.ERRORS_CSV, csvContent);
    }
  }
}
