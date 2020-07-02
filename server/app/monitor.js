const axios = require("axios");
const fs = require("fs-extra");
const CONFIG = require("./config");
const STATUS_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/status";

let isArmedTimeout;

const successTimeout = 5000; //5 secs
const failureTimeout = 1800 * 1000; //30 mins

const isArmed = async () => {
  isArmedTimeout = null;

  try {
    const status = await axios.get(STATUS_URL);
    const { is_armed, is_enabled } = status.data;

    fs.writeFileSync("./shared/data/is_armed.txt", is_armed);
    fs.writeFileSync("./shared/data/settings.txt", `${is_enabled},${is_armed}`);

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
