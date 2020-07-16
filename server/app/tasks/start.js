const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const root = process.env.PWD;
const CONFIG = require("../config");
const URL = CONFIG.SMARTHOME_PROXY_URL || CONFIG.SMARTHOME_CENTRAL_URL;
const TASKS_URL = URL + "/tasks";
const UPLOAD_URL = CONFIG.SMARTHOME_CENTRAL_URL + "/upload";
const FILES_PATH = root + "/server/app/files/";
const DATA_PATH = root + "/shared/data/";
const { exec } = require("child_process");

let tasksInProgress = [];

const attemptCommand = (task) => {
  if (task.command) {
    axios
      .post(TASKS_URL, {
        ...task,
        progress: "success",
      })
      .then(({ data }) => {
        if (data.progress === "success") {
          tasksInProgress = tasksInProgress.filter((item) => item !== task.id);

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
  const formData = new FormData();
  const imagePath = FILES_PATH + task.id + ".jpg";
  const imageExists = fs.existsSync(imagePath);
  const mp4VideoPath = FILES_PATH + task.id + ".mp4";
  const mp4VideoExists = fs.existsSync(mp4VideoPath);
  const h264VideoPath = FILES_PATH + task.id + ".h264";
  const csvPath = DATA_PATH + task.id + ".csv";
  const csvExists = fs.existsSync(csvPath);

  if (!imageExists && !csvExists && !mp4VideoExists) {
    return;
  }

  if (csvExists) {
    formData.append("csv", fs.createReadStream(csvPath));
  }

  if (imageExists) {
    formData.append("image", fs.createReadStream(imagePath));
  }

  if (mp4VideoExists) {
    formData.append("video", fs.createReadStream(mp4VideoPath));
  }

  try {
    axios
      .post(TASKS_URL, {
        ...task,
        progress: "pending",
      })
      .then(() => {
        axios
          .post(UPLOAD_URL, formData, {
            headers: {
              ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          })
          .then(({ data }) => {
            if (data.result === "success") {
              axios.post(TASKS_URL, {
                ...task,
                progress: data.result,
              });

              tasksInProgress = tasksInProgress.filter(
                (item) => item !== task.id
              );

              fs.remove(csvPath, () => {
                fs.remove(imagePath, () => {
                  fs.remove(mp4VideoPath, () => {
                    const h264VideoExists = fs.existsSync(h264VideoPath);

                    if (h264VideoExists) {
                      fs.remove(h264VideoPath);
                    }
                  });
                });
              });
            }
          });
      });
  } catch (error) {
    console.log("Error", error);
  }
};

module.exports = (task) => {
  if (tasksInProgress.includes(task.id)) {
    return;
  }

  tasksInProgress.push(task.id);

  if (task.progress === "comissioned" && task.type === "upload") {
    attemptUpload(task);
  }

  if (task.progress === "comissioned" && task.type === "command") {
    attemptCommand(task);
  }
};
