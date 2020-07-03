const axios = require("axios");
const fs = require("fs-extra");
const CONFIG = require("./config");
const tasks = require("./tasks");
const STATUS_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/status";
const REPORT_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/report";
const sharedDataPath = "./shared/data/";

let checkStateTimeout;
let checkDataTimeout;

const checkStateSuccessRetryInterval = 5000; //5 secs
const checkDataSuccessRetryInterval = 60000; //60 secs
const failureRetryInterval = 1800 * 1000; //30 mins

const checkState = async () => {
  checkStateTimeout = null;

  try {
    const status = await axios.get(STATUS_URL);
    const { is_armed, is_enabled } = status.data;

    fs.writeFileSync(
      "./shared/settings/status.txt",
      `${is_enabled},${is_armed}`
    );

    checkStateTimeout = setTimeout(checkState, checkStateSuccessRetryInterval);
  } catch (error) {
    console.warn("Error when loading status, aborting...");
    console.warn("Error details:", error.toJSON().message);

    checkStateTimeout = setTimeout(checkState, failureRetryInterval);
  }
};

const checkData = async () => {
  checkDataTimeout = null;

  try {
    const dataFiles = fs.readdirSync(sharedDataPath);
    const report = [];

    dataFiles.forEach((file) => {
      const fileContent = fs
        .readFileSync(sharedDataPath + file, "utf8")
        .split(",");

      report.push({
        device: fileContent[0],
        timestamp: fileContent[1],
        image: fileContent[2],
        video: fileContent[3],
      });
    });

    const { data } = await axios.post(REPORT_URL, report);

    if (data.role && data.role === "task") {
      tasks.start(data.details);
    }

    checkDataTimeout = setTimeout(checkData, checkDataSuccessRetryInterval);
  } catch (error) {
    console.warn("Error when checking local data, aborting...");
    console.warn("Error details:", error);

    checkDataTimeout = setTimeout(checkData, failureRetryInterval);
  }
};

module.exports = {
  checkState,
  checkData,
};
