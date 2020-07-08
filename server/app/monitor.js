const axios = require("axios");
const fs = require("fs-extra");
const CONFIG = require("./config");
const tasks = require("./tasks");
const STATUS_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/status";
const REPORT_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/reports";
const sharedDataPath = "./shared/data/";
const { exec } = require("child_process");

let checkStateTimeout;
let checkDataTimeout;

const checkStateSuccessRetryInterval = 10000; //5 secs
const checkDataSuccessRetryInterval = 60000; //60 secs
const failureRetryInterval = 1800 * 1000; //30 mins

const checkState = async () => {
  checkStateTimeout = null;

  try {
    const status = await axios.get(
      `${STATUS_URL}?id=${CONFIG.DEVICE_ID}&type=${CONFIG.DEVICE_TYPE}&name=${CONFIG.DEVICE_NAME}`
    );
    const { is_armed, is_enabled, task } = status.data;

    if (is_enabled === "0" && CONFIG.STOP_SOUND_COMMAND) {
      exec(CONFIG.STOP_SOUND_COMMAND);
    }

    fs.writeFileSync(
      "./shared/settings/status.txt",
      `${is_enabled},${is_armed}`
    );

    if (task) {
      tasks.start(task);
    }

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

    if (dataFiles.length) {
      const report = [];

      dataFiles.forEach((file) => {
        const fileContent = fs
          .readFileSync(sharedDataPath + file, "utf8")
          .split(",");

        if (fileContent && fileContent.length) {
          const reportData = {
            device: fileContent[0],
            timestamp: fileContent[1],
            image: fileContent[2],
            video: fileContent[3],
          };

          if (reportData.device && reportData.timestamp && reportData.image) {
            report.push(reportData);
          }
        }
      });

      const { data } = await axios.post(REPORT_URL, report);

      if (data.role && data.role === "task") {
        tasks.start(data.details);
      }
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
