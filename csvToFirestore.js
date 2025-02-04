import { execSync } from "child_process";

// Map CSV content to JSON
runScript("convert");

// Pause for 1 second then map that JSON to a shape appropriate for firestore
setTimeout(() => runScript("firestore"), 1000);

function runScript(script) {
  execSync(`npm run ${script}`, { stdio: "inherit" });
}
