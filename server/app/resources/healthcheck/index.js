const responder = require("../../responder");

module.exports = async (req, res) => {
  const { origin } = req.headers;
  const status = {
    status: "OK",
  };

  responder.send(res, origin, status, 200);
};
