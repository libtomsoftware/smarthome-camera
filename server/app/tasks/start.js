const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const root = process.env.PWD;
const CONFIG = require("../config");
const TASKS_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/tasks";
const UPLOAD_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/upload";
const FILES_PATH = root + "/server/app/files/";
const DATA_PATH = root + "/shared/data/";
const { exec } = require("child_process");

const attemptCommand = (task) => {
  console.warn("task", task);
  if (task.command) {
    axios
      .post(TASKS_URL, {
        ...task,
        progress: "success",
      })
      .then(({ data }) => {
        console.warn("data", data);
        if (data.progress === "success") {
          exec(task.command, (err, stdout, stderr) => {
            if (err) {
              console.error(
                `Node couldn't execute the command: ${task.command}`
              );
              return;
            }

            console.log(`Command executed, stdout: ${stdout}`);
            console.log(`Command executed, stderr: ${stderr}`);
          });
        }
      })
      .catch((error) => {
        console.log("Error", error);
      });
  }
};

const attemptUpload = async (task) => {
  const { data } = await axios.post(TASKS_URL, {
    ...task,
    progress: "pending",
  });

  if (data.progress === "pending") {
    const formData = new FormData();
    const imagePath = FILES_PATH + task.id + ".jpg";
    const imageExists = fs.existsSync(imagePath);
    const videoPath = FILES_PATH + task.id + ".mp4";
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
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        })
        .then(({ data }) => {
          axios.post(TASKS_URL, {
            ...task,
            progress: data.result,
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
};

module.exports = (task) => {
  if (task.progress === "comissioned" && task.type === "upload") {
    attemptUpload(task);
  }

  if (task.progress === "comissioned" && task.type === "command") {
    attemptCommand(task);
  }
};
