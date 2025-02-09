# birthday-csv-to-json
A tool to convert Plushie Birthdays from CSV to JSON format for DB import.

## Requirements
- `.env` file with the necessary environment variables.
- A file for the `SOURCE_CSV`, mapped accordingly in the `.env` file.
- A file for the `GOOGLE_APPLICATION_CREDENTIALS`, with the secret account credentials downloaded from Firebase (if uploading to Firestore).
- Add your required files to the root directory. 

## Environment Variables
These are all of the current environment variables used in the application. This secrion is split into:
- Required Files - where the scripts that use them will break if they're not provided.
- Optional Files - where the application will auto-generate a file of a matching name if one is not provided.
Regardless of whether the optional files are present, all environment variables will need a file name assigning to them prior to running associated scripts.

### Required Files
- `SOURCE_CSV={fileName}.csv` - the user uploaded CSV file. Must contain the headings "Username", "Plushie Name" and "dob".
- `GOOGLE_APPLICATION_CREDENTIALS={fileName}.json` - the secret account credentials for Firebase.
  
### Optional Files
- `MAPPED_FROM_CSV_JSON={fileName}.json` - the result of the successful conversions from CSV to JSON.
- `MAPPED_FOR_UPLOAD_JSON={fileName}.json` - the result of a successful mapping of JSON to a format appropriate for importing to Firestorm.
- `ERRORS_CSV={fileName}.csv` - the result of the failed conversions.

## Scripts
- `npm run convert` - converts the CSV file to a JSON following an entity-relationship (ER) model.
- `npm run firestore` - converts the ER .json file to a document-oriented (DO) model suitable for uploading to Firestore.
- `npm run upload` - uploads the DO .json file to Firestore, using the credentials associated with `GOOGLE_APPLICATION_CREDENTIALS`.
- `npm rum convert:all` - converts the CSV file straight to a DO .json file (essentially skipping the need to run `npm run convert`).

## Output
The following sections document the expected JSON output from associated scripts.

### npm run convert
The success JSON output from csvToJson will be as follows:
```
{
   users: {
      "userId": {
         username: string
      }
   }
   plushies: {
      "plushieId": {
         name: string,
         userId: reference (`/users/{userId}'),
         dob: string
      }
   }
}
```
Existing records are skipped. All failed rows will be added to an `errors.csv` file for review and retry.

### npm run firestore
```
[
   { "collection": "users", "doc": "userId1", "data": { "username": "Alice" } },
   { "collection": "users", "doc": "userId2", "data": { "username": "Bob" } },
   { "collection": "plushies", "doc": "plushieId1", "data": { "name": "Teddy", "userId": "userId1", "dob": "2023-05-10" } },
   { "collection": "plushies", "doc": "plushieId2", "data": { "name": "Bunny", "userId": "userId2", "dob": "2022-08-15" } }
 ]
```
Which flattens the objects into two different shapes, either a user collection or a plushie collection.
