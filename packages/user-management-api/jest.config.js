module.exports = {
     "moduleFileExtensions": [
          "js",
          "json",
          "ts"
     ],
     "preset": "@trendyol/jest-testcontainers",
     "rootDir": "src",
     "testRegex": ".*\\.spec\\.ts$",
     "transform": {
          "^.+\\.(t|j)s$": "ts-jest"
     },
     "collectCoverageFrom": [
          "**/*.(t|j)s"
     ],
     "coverageDirectory": "../coverage"
};