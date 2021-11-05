module.exports = async (ctx, next) => {
    const startT = Date.now();
    await next();
    const ms = Date.now() - startT;
    console.log("\033[95m" + "[WatchDog]" + "\033[m", `${ctx.method} ${ctx.url} -`, ms, "ms");
};
