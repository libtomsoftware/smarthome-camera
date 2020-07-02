const axios = require("axios");
const fs = require("fs-extra");
const CONFIG = require("./config");
const STATUS_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/status";

let checkStateTimeout;

const successTimeout = 5000; //5 secs
const failureTimeout = 1800 * 1000; //30 mins

const checkState = async () => {
  checkStateTimeout = null;

  try {
    const status = await axios.get(STATUS_URL);
    const { is_armed, is_enabled } = status.data;

    fs.writeFileSync("./shared/settings/is_armed.txt", is_armed);
    fs.writeFileSync(
      "./shared/settings/status.txt",
      `${is_enabled},${is_armed}`
    );

    checkStateTimeout = setTimeout(checkState, successTimeout);
  } catch (error) {
    console.warn("Error when loading status, aborting...");
    console.warn("Error details:", error.toJSON().message);

    checkStateTimeout = setTimeout(checkState, failureTimeout);
  }
};

module.exports = {
  checkState,
};
