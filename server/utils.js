function md5(str) {
    return require("crypto").createHash("md5").update(str).digest("hex");
}

module.exports = { md5 };
