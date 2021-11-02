require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const { writeFileSync } = require("fs");
const { join } = require("path");
const supabase = createClient("https://zibatrytslwkcndzjbuk.supabase.co", process.env.SUPABASE_TOKEN);

// get all data from table "records"
supabase
    .from("records")
    .select()
    .then((data) => {
        writeFileSync(join(__dirname, "data.json"), JSON.stringify(data.body, null, 2));
    });
