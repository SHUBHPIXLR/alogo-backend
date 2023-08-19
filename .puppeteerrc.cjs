const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
// const newDirectory = __dirname + "/../"
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};