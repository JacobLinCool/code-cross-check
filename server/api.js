const { existsSync, rmSync } = require("fs");
const { join } = require("path");
const Koa = require("koa");
const Router = require("koa-router");
const { Checker } = require("testcase-x");
const { md5 } = require("./utils");
const JSVM = require("./sandbox");
const db = require("./database");

const apiServer = new Koa();
const apiRouter = new Router();

apiRouter.post("/cross-check", async (ctx) => {
    const { body } = ctx.request;

    ["testcase", "preprocessor", "source_0", "source_1"].forEach((key) => (body[key] = body[key].trim()));
    const timeout = Math.max(Math.min(body.timeout || 5_000, 10_000), 100);

    log(
        Object.keys(body)
            .map((key) => `${key}: ${body[key].length || body[key]}`)
            .join(", ")
    );

    let ERROR = "ERROR";
    const checker = new Checker();
    try {
        const StartTime = Date.now();

        ERROR = "TESTCASE_GENERATOR_ERROR";
        const testcase_generator = JSVM(body.testcase);

        ERROR = "PREPROCESSOR_ERROR";
        const preprocessor = JSVM(body.preprocessor);

        ERROR = "TESTING_ERROR";
        const result = await checker
            .genTestcase(testcase_generator)
            .setPreprocessor(preprocessor)
            .source(body.source_0)
            .source(body.source_1)
            .go({ timeout, gccFlags: ["-O2", "-lm", "-std=gnu99"] });
        const time = Date.now() - StartTime;
        log(`Test Time:`, time, "ms");
        if (!result) throw new Error("Testing Failed.");

        ERROR = "ERROR";
        const hash = md5(
            `${md5(body.testcase)}-${md5(body.preprocessor)}-${md5(body.source_0)}-${md5(body.source_1)}-${md5(JSON.stringify(result))}`
        ).toLowerCase();
        log("HASH:", hash);

        if (body.testcase && body.preprocessor && body.source_0 && body.source_1 && result)
            db.store({ hash, time, result, testcase: body.testcase, preprocessor: body.preprocessor, source_0: body.source_0, source_1: body.source_1 }).catch(
                (err) => console.error(err)
            );

        ctx.body = JSON.stringify({ result, hash, time }, null, 2);
    } catch (err) {
        const dir = join(process.cwd(), `tc-tmp-${checker.id}`);
        if (existsSync(dir)) rmSync(dir);
        console.error(err);
        ctx.body = JSON.stringify({ error: ERROR, message: err.message }, null, 2);
    }
});

apiRouter.get("/retrieve", async (ctx) => {
    const { hash } = ctx.request.query;
    const data = await db.retrieve(hash).catch((err) => console.error(err));

    if (data && data.length) ctx.body = JSON.stringify(data[0]);
    else ctx.body = JSON.stringify({ error: "Not Found" });
});

apiServer.use(apiRouter.routes()).use(async (ctx) => {
    if (!ctx.body) ctx.body = JSON.stringify({ error: "ERROR" });
    ctx.type = "application/json";
});

function log(...msg) {
    console.log("\033[96m" + "[API]" + "\033[m", ...msg);
}

module.exports = apiServer;
