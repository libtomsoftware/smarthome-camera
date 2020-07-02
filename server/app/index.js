const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const monitor = require("./monitor");
const app = express();
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(routes());

monitor.checkState();

module.exports = app;
