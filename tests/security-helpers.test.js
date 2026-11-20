const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createRefreshToken, hashRefreshToken
} = require("../src/utils/tokens");

test("refresh tokens are cryptographically random and hashed deterministically", () => {
  const first = createRefreshToken();
  const second = createRefreshToken();

  assert.equal(typeof first, "string");
  assert.ok(first.length >= 100);
  assert.notEqual(first, second);
  assert.equal(hashRefreshToken(first), hashRefreshToken(first));
  assert.notEqual(hashRefreshToken(first), first);
});
