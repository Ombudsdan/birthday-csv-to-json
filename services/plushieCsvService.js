import {
  generateId,
  trim,
  isEmptyObject,
  isInvalidObject,
  matchAllowedHeadingLabels,
  writeDataToJsonFile,
} from "../utils.js";

export class PlushieCsvService {
  data = { users: {}, plushies: {} };
  users = [];
  plushies = [];
  columnHeadings = ["dob", "username", "name"];
  existingRows = [];
  failedRows = [];
  allUniqueUsernames = [];

  convertCsvRowToObject(row) {
    if (isEmptyObject(row)) {
      return; // Skip empty rows
    }

    this.#createPlushie(row);
  }

  mapObjectsToJson() {
    this.#getAllUniqueUsernames();

    this.allUniqueUsernames.forEach((currentUsername) => {
      const currentUserId =
        this.#findCurrentUserId(currentUsername) ??
        this.#addNewUser(currentUsername);

      this.plushies
        .filter((plushie) => this.#isNewPlushie(plushie, currentUsername))
        .forEach((plushie) => this.#addNewPlushie(plushie, currentUserId));
    });

    writeDataToJsonFile(process.env.MAPPED_FROM_CSV_JSON, this.data);

    const completionMessages = [
      `${this.plushies.length} New (Added)`,
      `${this.existingRows.length} Existing (Skipped)`,
      `${this.failedRows.length} Failed.`,
    ];
    console.log(completionMessages.join(" | "));
  }

  // Private Methods

  #setPlushieProps(row) {
    return {
      dob: this.#getValueByHeading(row, "dob"),
      username: this.#getValueByHeading(row, "username"),
      name: this.#getValueByHeading(row, "name"),
    };
  }

  #createPlushie(row) {
    const plushie = this.#setPlushieProps(row);
    const isExistingPlushie = this.#doesPlushieExist(plushie);
    const isInvalidPlushie = isInvalidObject(plushie);

    if (!isExistingPlushie && !isInvalidPlushie) {
      this.users.push(plushie);
      this.plushies.push(plushie);
    } else if (isExistingPlushie) {
      this.existingRows.push(plushie);
    } else {
      this.#logFailedRow(row);
    }
  }

  #getAllUniqueUsernames() {
    this.allUniqueUsernames = [...new Set(this.users.map((u) => u.username))];
  }

  #findCurrentUserId(currentUsername) {
    return Object.keys(this.data.users).find(
      (id) => this.data.users[id].username === currentUsername
    );
  }

  #addNewUser(currentUsername) {
    const userId = generateId();
    this.data.users[userId] = { username: currentUsername };
    return userId;
  }

  #isNewPlushie(plushie, currentUsername) {
    return (
      plushie.username === currentUsername && !this.#doesPlushieExist(plushie)
    );
  }

  #addNewPlushie(plushie, currentUserId) {
    const plushieId = generateId();

    this.data.plushies[plushieId] = {
      name: plushie.name,
      userId: `/users/${currentUserId}`,
      dob: plushie.dob,
    };
  }

  #doesPlushieExist(plushie) {
    return Object.values(this.data.plushies).find(
      (matchingPlushie) =>
        matchingPlushie.name === plushie.name &&
        matchingPlushie.dob === plushie.dob
    );
  }

  /** Adds any failed rows to the CSV for correction */
  #logFailedRow(row) {
    if (!this.failedRows.includes(row)) {
      const test = {
        dob: this.#getValueByHeading(row, "dob"),
        username: this.#getValueByHeading(row, "username"),
        name: this.#getValueByHeading(row, "name"),
      };
      this.failedRows.push(test);
    }
  }

  #getValueOfHeading(row, property) {
    const stu = {
      dob: {
        label: "Date of Birth",
        allowedHeadings: ["date of birth", "dob"],
      },
      username: {
        label: "Username",
        allowedHeadings: ["username", "user"],
      },
      name: {
        label: "Plushie Name",
        allowedHeadings: ["plushie name", "name"],
      },
    };

    return Object.keys(row).find((x) =>
      matchAllowedHeadingLabels(x, stu[property].allowedHeadings)
    );
  }

  /** Gets the matching row value from the row heading.
   * Since there's some margin for error surrounding the name of the heading from the CSV, this function adds some flexibility in the CSV column naming.
   * This ensures that case-insensitive names and different possible headings are detected and mapped. */
  #getValueByHeading(row, property) {
    const matchedHeader = this.#getValueOfHeading(row, property);
    return matchedHeader ? trim(row[matchedHeader]) : undefined;
  }
}
