const express = require("express");
const responder = require("./responder");
const resources = require("./resources");
const { healthcheck } = resources;

module.exports = function routes() {
  const routes = new express.Router();

  routes.get("/healthcheck", healthcheck);

  routes.all("*", (req, res) => responder.rejectNotFound(res));

  return routes;
};
