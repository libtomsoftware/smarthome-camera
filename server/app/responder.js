const CONFIG = require("./config");
const STATUS_CODE = CONFIG.CONSTANTS.HTTP_CODE;
const allowedOrigins = ["http://localhost:5000", "http://localhost:5001"];

function addHeaders(response, origin) {
  response.headers = {
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Content-Type": "application/json",
    "Access-Control-Allow-Credentials": "true",
  };

  if (allowedOrigins.includes(origin)) {
    response.headers = Object.assign({}, response.headers, {
      "Access-Control-Allow-Origin": origin,
    });
  }
}

class Responder {
  rejectUnauthorized(response, origin) {
    addHeaders(response, origin);
    response.sendStatus(STATUS_CODE.UNAUTHORIZED);
  }

  rejectBadGateway(response, origin) {
    addHeaders(response, origin);
    response.sendStatus(STATUS_CODE.BAD_GATEWAY);
  }

  rejectConflict(response, origin) {
    addHeaders(response, origin);
    response.sendStatus(STATUS_CODE.CONFLICT);
  }

  rejectNotFound(response, origin) {
    addHeaders(response, origin);
    response.sendStatus(STATUS_CODE.NOT_FOUND);
  }

  rejectBadRequest(response, origin) {
    addHeaders(response, origin);
    response.sendStatus(STATUS_CODE.BAD_REQUEST);
  }

  reject(response, origin, statusCode) {
    response.statusCode = statusCode;

    addHeaders(response, origin);

    response.send();
  }

  sendSuccess(response, origin) {
    addHeaders(response, origin);
    response.sendStatus(STATUS_CODE.OK);
  }

  send(response, origin, data, statusCode) {
    response.statusCode = statusCode || STATUS_CODE.OK;

    addHeaders(response, origin);

    response.send(data);
  }
}

module.exports = new Responder();
