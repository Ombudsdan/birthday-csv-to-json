# birthday-csv-to-json
A tool to convert Plushie Birthdays from CSV to JSON format for DB import.

## Requirements
- `input.csv` file with the headings "Username", "Plushie Name" and "dob"

## Output
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

The output from jsonToFirestore will be as follows:
```
[
   { "collection": "users", "doc": "userId1", "data": { "username": "Alice" } },
   { "collection": "users", "doc": "userId2", "data": { "username": "Bob" } },
   { "collection": "plushies", "doc": "plushieId1", "data": { "name": "Teddy", "userId": "userId1", "dob": "2023-05-10" } },
   { "collection": "plushies", "doc": "plushieId2", "data": { "name": "Bunny", "userId": "userId2", "dob": "2022-08-15" } }
 ]
```
Which flattens the objects into two different shapes, either a user collection or a plushie collection.

## Key Files
- `input.csv` - the user uploaded CSV file
- `mapped-from-csv.json` - the result of the successful conversions from CSV to JSON
- `mapped-from-json-for-firestorm.json` - the result of a successful mapping of JSON to a format appropriate for importing to Firestorm
- `errors.csv` - the result of the failed conversions

## How to use
- Run `npm install` before starting.
- Add your `input.csv` file to the root directory (alongside `csvToJson.js`). Ensure all headings are correct.
- To convert the file from CSV run `npm run convert` in the terminal.
- To map the JSON to a format appropriate for Firestorm, run `npm run firestorm` in the terminal.
- To convert the CSV file straight to a format appropriate for Firestorm, run `npm run convert:all` in the terminal.

