const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { loadEnv } = require("../config/env");

function createAccessToken(user) {
  const env = loadEnv();
  return jwt.sign(
    { sub: user.id, tokenType: "access" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN, issuer: "premium-salon-os", audience: "salon-os-api" }
  );
}

function verifyAccessToken(token) {
  const env = loadEnv();
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "premium-salon-os",
    audience: "salon-os-api"
  });
}

function createRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshExpiryDate() {
  const days = loadEnv().REFRESH_TOKEN_DAYS;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

module.exports = {
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshExpiryDate
};
