import "./config.js";
import { createReadStream } from "fs";
import csv from "csv-parser";
import { PlushieCsvService } from "./services/plushieCsvService.js";
import { CsvToJsonService } from "./services/csvToJsonService.js";

const converter = new CsvToJsonService(new PlushieCsvService());

converter.setupFilesAndObjects();

createReadStream(process.env.SOURCE_CSV)
  .pipe(csv())
  .on("data", (row) => converter.builder.convertCsvRowToObject(row))
  .on("end", () => {
    converter.writeFailedRowsToCsv();
    converter.builder.mapObjectsToJson();
  });
