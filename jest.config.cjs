module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  setupFiles: ["<rootDir>/jest.setup.js"], // Add setup file
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  testMatch: ["<rootDir>/src/__tests__/**/*.test.[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/"],
};