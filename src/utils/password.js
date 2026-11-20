const bcrypt = require("bcrypt");
const { loadEnv } = require("../config/env");

async function hashPassword(password) {
  return bcrypt.hash(password, loadEnv().BCRYPT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { hashPassword, verifyPassword };
