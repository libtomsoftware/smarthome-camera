const app = require("./app");
const port = process.env.PORT || 5001;

app.listen(port, () =>
  console.log(`SmartHome Camera App is listening on port ${port}.`)
);
