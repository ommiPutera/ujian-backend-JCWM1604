const jwt = require("jsonwebtoken");

module.exports = {
  createAccessToken: (data) => {
    const key = "primarykey";
    const token = jwt.sign(data, key);
    return token
  }
}