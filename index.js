require("./server");

process.on("uncaughtException", async (err) => {
    console.log("\033[1;91m" + "[Uncaught Exception] " + "\033[0m" + err.stack);
    console.log("\033[1;91m" + "[Uncaught Exception] " + "\033[0m" + "Memory:", process.memoryUsage());
    console.log("\033[1;91m" + "[Uncaught Exception] " + "\033[0m" + "CPU:", process.cpuUsage());
    console.log("\033[1;91m" + "[Uncaught Exception] " + "\033[0m" + "Uptime:", process.uptime(), "s");
});

process.on("close", async (code) => {
    console.log("\033[1;94m" + "[Exit] " + "\033[0m" + "Code:", code);
    console.log("\033[1;94m" + "[Exit] " + "\033[0m" + "Memory:", process.memoryUsage());
    console.log("\033[1;94m" + "[Exit] " + "\033[0m" + "CPU:", process.cpuUsage());
    console.log("\033[1;94m" + "[Exit] " + "\033[0m" + "Uptime:", process.uptime(), "s");
});
