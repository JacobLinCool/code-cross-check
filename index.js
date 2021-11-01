require("dotenv").config();
const Koa = require("koa");
const compress = require("koa-compress");
const Router = require("koa-router");
const koaBody = require("koa-body");
const mount = require("koa-mount");
const static = require("koa-static");
const { Checker } = require("testcase-x");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://zibatrytslwkcndzjbuk.supabase.co", process.env.SUPABASE_TOKEN);

const app = new Koa();

// #region API
const apiServer = new Koa();
const apiRouter = new Router();

apiRouter.post("/cross-check", async (ctx) => {
    const { body } = ctx.request;
    Object.keys(body).forEach((key) => (body[key] = body[key].trim()));
    console.log(
        Object.keys(body)
            .map((key) => `${key}: ${body[key].length}`)
            .join(", ")
    );
    const StartTime = Date.now();
    const checker = new Checker();
    const result = await checker
        .genTestcase(requireFromString(body.testcase))
        .setPreprocessor(requireFromString(body.preprocessor))
        .source(body.source_0)
        .source(body.source_1)
        .go();
    console.log(`[Checker ${checker.id}] Time:`, Date.now() - StartTime, "ms");
    const hash = md5(`${md5(body.testcase)}-${md5(body.preprocessor)}-${md5(body.source_0)}-${md5(body.source_1)}-${md5(JSON.stringify(result))}`);
    console.log("HASH:", hash);
    supabase
        .from("records")
        .insert([{ testcase: body.testcase, preprocessor: body.preprocessor, source_0: body.source_0, source_1: body.source_1, result, hash }])
        .then(({ data, error }) => {
            if (error) console.log("[Supabase Error]", error);
            else console.log("[Supabase]", "Size: " + JSON.stringify(data).length);
        });
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

function md5(str) {
    return require("crypto").createHash("md5").update(str).digest("hex");
}

// #endregion
