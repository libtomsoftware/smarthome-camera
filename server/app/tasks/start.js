const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const root = process.env.PWD;
const CONFIG = require("../config");
const TASKS_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/tasks";
const UPLOAD_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/upload";
const FILES_PATH = root + "/server/app/files/";
const DATA_PATH = root + "/shared/data/";

function getResultDetails(data) {
  let resultDetails = "";

  resultDetails += data.csvExists ? "+" : "-";
  resultDetails += data.imageExists ? "+" : "-";
  resultDetails += data.videoExists ? "+" : "-";

  return resultDetails;
}

module.exports = async (task) => {
  if (task.progress === "comissioned" && task.type === "upload") {
    const { data } = await axios.post(TASKS_URL, {
      ...task,
      progress: "pending",
    });

    if (data.progress === "pending") {
      const formData = new FormData();
      const imagePath = FILES_PATH + task.id + ".jpg";
      const imageExists = fs.existsSync(imagePath);
      const videoPath = FILES_PATH + task.id + ".h264";
      const videoExists = fs.existsSync(videoPath);
      const csvPath = DATA_PATH + task.id + ".csv";
      const csvExists = fs.existsSync(csvPath);

      if (!imageExists && !csvExists && !videoExists) {
        return;
      }

      if (csvExists) {
        formData.append("csv", fs.createReadStream(csvPath));
      }

      if (imageExists) {
        formData.append("image", fs.createReadStream(imagePath));
      }

      if (videoExists) {
        formData.append("video", fs.createReadStream(videoPath));
      }

      try {
        axios
          .post(UPLOAD_URL, formData, {
            headers: {
              ...formData.getHeaders(),
            },
          })
          .then(({ data }) => {
            axios.post(TASKS_URL, {
              ...task,
              progress: data.result,
              details: getResultDetails(data),
            });

            if (data.result === "success") {
              fs.remove(csvPath, () => {
                fs.remove(imagePath, () => {
                  fs.remove(videoPath);
                });
              });
            }
          });
      } catch (error) {
        console.log("Error", error);
      }
    }
  }
};
