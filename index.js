const Koa = require("koa");
const compress = require("koa-compress");
const Router = require("koa-router");
const koaBody = require("koa-body");
const mount = require("koa-mount");
const static = require("koa-static");
const { Checker } = require("testcase-x");

const app = new Koa();

// #region API
const apiServer = new Koa();
const apiRouter = new Router();

apiRouter.post("/cross-check", async (ctx) => {
    const { body } = ctx.request;
    console.log(body);
    const StartTime = Date.now();
    const checker = new Checker();
    const result = await checker
        .genTestcase(requireFromString(body.testcase))
        .setPreprocessor(requireFromString(body.preprocessor))
        .source(body.source_0)
        .source(body.source_1)
        .go();
    console.log(`[Checker ${checker.id}] Time:`, Date.now() - StartTime, "ms");
    ctx.body = JSON.stringify(result, null, 2);
    ctx.type = "application/json";
});

apiServer.use(apiRouter.routes());
// #endregion

app.use(koaBody())
    .use(
        compress({
            filter(content_type) {
                return /text/i.test(content_type);
            },
            threshold: 2048,
            gzip: { flush: require("zlib").constants.Z_SYNC_FLUSH },
            deflate: { flush: require("zlib").constants.Z_SYNC_FLUSH },
            br: true,
        })
    )
    .use(mount("/api", apiServer))
    .use(mount("/", static("./web")))
    .listen(3000);

console.log("Server started on port 3000");

// #region Utils

function requireFromString(src) {
    const Module = require("module");
    const m = new Module();
    m._compile(src, "");
    return m.exports;
}

// #endregion
