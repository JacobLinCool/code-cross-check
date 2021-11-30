const { createClient } = require("@supabase/supabase-js");

const supabase = createClient("https://zibatrytslwkcndzjbuk.supabase.co", process.env.SUPABASE_TOKEN);

const size_limit = {
    testcase: 32 * 1024,
    preprocessor: 32 * 1024,
    source_0: 32 * 1024,
    source_1: 32 * 1024,
    result: 512 * 1024,
};

async function store({ testcase, preprocessor, source_0, source_1, result, hash, timeout }) {
    try {
        const data = await retrieve(hash);
        if (data && data.length) return;
    } catch (err) {}

    return supabase
        .from("records")
        .insert([
            {
                testcase: testcase.length <= size_limit.testcase ? testcase : "",
                preprocessor: preprocessor.length <= size_limit.preprocessor ? preprocessor : "",
                source_0: source_0.length <= size_limit.source_0 ? source_0 : "",
                source_1: source_1.length <= size_limit.source_1 ? source_1 : "",
                result: JSON.stringify(result).length <= size_limit.result ? result : null,
                hash,
                timeout,
            },
        ])
        .then(({ data, error }) => {
            if (error) log(error);
            else log("Stored", "Size", JSON.stringify(data).length);
            return data;
        });
}

async function retrieve(hash) {
    return supabase
        .from("records")
        .select()
        .eq("hash", hash.toLowerCase())
        .then(({ data, error }) => {
            if (error) log(error);
            else log("Retrieve", hash, "Found", data.length);
            return data;
        });
}

function log(...msg) {
    return console.log("\033[94m" + "[Database]" + "\033[m", ...msg);
}

module.exports = { store, retrieve };
