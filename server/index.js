require("dotenv").config();

const Koa = require("koa");
const mount = require("koa-mount");
const static = require("koa-static");
const { join } = require("path");

const WEB_DIR = join(__dirname, "..", "web");
console.log("\033[94m" + "WEB_DIR: " + WEB_DIR + "\033[m");

const app = new Koa()
    .use(require("./compress"))
    .use(require("./watchDog"))
    .use(require("koa-body")())
    .use(mount("/api", require("./api")))
    .use(mount("/", static(WEB_DIR)))
    .listen(3000);

console.log("\033[1;92m" + "Server started on port 3000" + "\033[m");

module.exports = app;
