export default {
  testEnvironment: "node",
  testMatch: ["**/*.test.js", "**/*.spec.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "services/**/*.js",
    "!**/*.test.js",
    "!**/*.spec.js",
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { presets: ["@babel/preset-env"] }],
  },
};
