# birthday-csv-to-json
A tool to convert Plushie Birthdays from CSV to JSON format for DB import.

## Requirements
- `input.csv` file with the headings "Username", "Plushie Name" and "dob"

## Output
The success JSON output will be as follows:
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

## Key Files
- `input.csv` - the user uploaded CSV file
- `output.json` - the result of the successful conversions
- `errors.csv` - the result of the failed conversions

## How to use
- Run `npm install` before starting.
- Add your `input.csv` file to the root directory (alongside `index.js`). Ensure all headings are correct.
- To convert the file run `npm run convert` in the terminal.

