const axios = require("axios");
const fs = require("fs-extra");
const CONFIG = require("./config");
const URL = CONFIG.SMARTHOME_CENTRAL_URL + "/status";

let isArmedTimeout;

const successTimeout = 5000;
const failureTimeout = 1800 * 1000; //30 mins

const isArmed = async () => {
  isArmedTimeout = null;

  try {
    const status = await axios.get(URL);

    fs.writeFileSync("./shared/data/is_armed.txt", status.data.is_armed);

    isArmedTimeout = setTimeout(isArmed, successTimeout);
  } catch (error) {
    console.warn("Error when loading status, aborting...");
    console.warn("Error details:", error.toJSON().message);

    isArmedTimeout = setTimeout(isArmed, failureTimeout);
  }
};

module.exports = {
  isArmed,
};
