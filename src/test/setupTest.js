const dotenv = require("dotenv");
const originalEnv = process.env;

process.env = {
  ...originalEnv,
  NODE_ENV: "local",
};

dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });
beforeAll(() => {
  jest.resetModules();
});

afterAll(() => {
  process.env = originalEnv;
});
