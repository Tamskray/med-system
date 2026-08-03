export default {
  testEnvironment: "node",
  testMatch: ["**/*.test.js", "**/*.spec.js", "**/*.test.ts", "**/*.spec.ts"],
  collectCoverageFrom: [
    "controllers/**/*.{js,ts}",
    "services/**/*.{js,ts}",
    "!**/*.test.js",
    "!**/*.spec.js",
    "!**/*.test.ts",
    "!**/*.spec.ts",
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { presets: ["@babel/preset-env"] }],
    "^.+\\.ts$": ["babel-jest", { presets: ["@babel/preset-env", "@babel/preset-typescript"] }],
  },
};
