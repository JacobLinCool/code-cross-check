const compress = require("koa-compress");

module.exports = compress({
    filter(content_type) {
        return /text|json|javascript|css/i.test(content_type);
    },
    threshold: 2048,
    gzip: { flush: require("zlib").constants.Z_SYNC_FLUSH },
    deflate: { flush: require("zlib").constants.Z_SYNC_FLUSH },
    br: false,
});
