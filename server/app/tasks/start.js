const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const root = process.env.PWD;
const CONFIG = require("../config");
const TASKS_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/tasks";
const UPLOAD_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/upload";
const FILES_PATH = root + "/server/app/files/";
const DATA_PATH = root + "/shared/data/";

module.exports = async (task) => {
  if (task.progress === "comissioned" && task.type === "upload") {
    const { data } = await axios.post(TASKS_URL, {
      ...task,
      progress: "pending",
    });

    if (data.progress === "pending") {
      const formData = new FormData();

      formData.append(
        "image",
        fs.createReadStream(FILES_PATH + task.timestamp + ".jpg")
      );

      formData.append(
        "csv",
        fs.createReadStream(DATA_PATH + task.timestamp + ".csv")
      );

      //   formData.append(
      //     "video",
      //     fs.createReadStream(FILES_PATH + task.timestamp + ".h264")
      //   );

      const { data } = await axios.post(UPLOAD_URL, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      if (data.result === "success") {
        axios.post(TASKS_URL, {
          ...task,
          progress: "finished",
        });
      }
    }
  }
};
