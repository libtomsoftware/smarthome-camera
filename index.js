const fs = require("fs-extra");
const configExists = fs.existsSync(".env.json"); //eslint-disable-line no-sync

if (!configExists) {
  console.error("No .env.json file detected, booting aborted!");
} else {
  require("dot-env");
  console.log(".env.json file detected and loaded, booting...");
  require("./server/boot");
}
