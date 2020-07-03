module.exports = {
  CONSTANTS: {
    HTTP_CODE: {
      OK: 200,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      INTERNAL_SERVER_ERROR: 500,
      BAD_GATEWAY: 502,
    },
  },
  DEVICE_ID: process.env.DEVICE_ID,
  DEVICE_TYPE: process.env.DEVICE_TYPE,
  DEVICE_NAME: process.env.DEVICE_NAME,
  SMARTHOME_CENTRAL_URL: process.env.SMARTHOME_CENTRAL_URL,
};
