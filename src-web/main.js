import "./tailwind.css";
import "./style.css";
import setUp from "./setup";
import { switchPage, pages } from "./switcher";
import { elm, readFile } from "./utils";
import { removeSW } from "./service";
import * as storage from "./storage";

let downloadable = null;

(async () => {
    const { testcase_editor, preprocessor_editor, source_0_editor, source_1_editor } = await setUp();

    setupListeners({ editor: { testcase: testcase_editor, preprocessor: preprocessor_editor, "source-0": source_0_editor, "source-1": source_1_editor } });

    await checkHash({ testcase_editor, preprocessor_editor, source_0_editor, source_1_editor });

    elm("#container").style.opacity = 1;
})();

function setupListeners({ editor }) {
    pages.forEach((page) => {
        elm(`#${page}-nav`).addEventListener("click", () => {
            switchPage(page);
        });
    });

    elm("#check").addEventListener("click", () =>
        crossCheck({
            testcase: editor.testcase.getValue(),
            preprocessor: editor.preprocessor.getValue(),
            source_0: editor["source-0"].getValue(),
            source_1: editor["source-1"].getValue(),
            timeout: +elm("#timeout").value || 5000,
        })
    );
    elm("#download").addEventListener("click", downloadResult);

    ["testcase", "preprocessor", "source-0", "source-1"].forEach((type) => {
        elm(`#${type}-file`).addEventListener("change", async (e) => {
            editor[type].setValue(await readFile(e.target.files[0]));
        });
        elm(`#${type}-fetch`).addEventListener("click", async () => {
            popup(async (val) => editor[type].setValue(await fetchCode(val)));
        });
    });

    elm("#settings-open").addEventListener("click", openSettings);
    elm("#settings-close").addEventListener("click", closeSettings);
    elm("#remove-sw").addEventListener("click", removeSW);

    elm("#trim-long-testcase").checked = storage.get("trim-long-testcase");
    elm("#trim-long-testcase").addEventListener("click", () => {
        storage.set("trim-long-testcase", elm("#trim-long-testcase").checked);
    });
}

function popup(callback) {
    elm("#container").style.filter = "blur(5px) grayscale(0.5)";
    elm("#popup").style.display = "flex";
    elm("#popup-input").focus();
    elm("#popup-input").onkeydown = async (e) => {
        e.target.value = e.target.value.trim();
        if (e.key === "Enter") {
            e.target.disabled = true;
            e.target.onkeydown = null;
            if (e.target.value) await callback(e.target.value);
            e.target.value = "";
            e.target.disabled = false;
            elm("#popup").style.display = "none";
            elm("#container").style.filter = "blur(0px) grayscale(0)";
        }
    };
}

function openSettings() {
    elm("#container").style.filter = "blur(5px) grayscale(0.5)";
    elm("#settings").style.display = "flex";
    setTimeout(() => (elm("#settings-body").style.opacity = 1), 0);
}

function closeSettings() {
    elm("#container").style.filter = "blur(0px) grayscale(0)";
    elm("#settings-body").style.opacity = 0;
    setTimeout(() => {
        elm("#settings").style.display = "none";
    }, 300);
}

async function fetchCode(url) {
    try {
        if (url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/([^]+)/)) {
            const [, owner, repo, branch, file] = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/([^]+)/);
            return await fetch(`https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${file}`).then((res) => res.text());
        }
        return await fetch(url).then((res) => res.text());
    } catch (e) {
        return "";
    }
}

async function retrieve(hash) {
    try {
        const data = await fetch("/api/retrieve?hash=" + hash).then((res) => res.json());
        if (data.error) throw new Error(data.error);
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function setHash(hash) {
    elm("#hash").innerHTML = hash;
    const url = window.location.origin + window.location.pathname + "#" + hash;
    elm("#hash").href = url;
}

function viewable({ diff, same }) {
    const diffs = Object.values(diff).reduce((acc, cur) => acc + cur.length, 0);
    const sames = Object.values(same).reduce((acc, cur) => acc + cur.length, 0);

    const trim_tc = storage.get("trim-long-testcase");

    let html = `<p>There are <b class="${diffs ? "text-nord11" : "text-nord10"}">${diffs}</b> different result${diffs > 1 ? "s" : ""} and <b class="${
        sames ? "text-nord10" : "text-nord11"
    }">${sames}</b> same result${sames > 1 ? "s" : ""} between two programs.</p>---<br>`;
    html += `<p>DIFFERENT RESULTS:<br>${
        diffs
            ? Object.entries(diff)
                  .filter(([key, val]) => val.length)
                  .map(
                      ([key, val]) =>
                          `<b>[${key}]</b><br>${val
                              .map(
                                  (v) =>
                                      `TESTCASE: ${
                                          trim_tc && v.testcase.length > 30
                                              ? v.testcase.substr(0, 20) + " ... " + v.testcase.substr(v.testcase.length - 10)
                                              : v.testcase
                                      }<br>STDOUTS:<br><b class="text-nord11">${v.stdouts.join("<br>")}</b>`
                              )
                              .join("<br>---<br>")}`
                  )
                  .join("<br>")
            : "None"
    }</p><br>`;
    html += `<p>SAME RESULTS:<br>${
        sames
            ? Object.entries(same)
                  .filter(([key, val]) => val.length)
                  .map(
                      ([key, val]) =>
                          `<b>[${key}]</b><br>${val
                              .map(
                                  (v) =>
                                      `TESTCASE: ${
                                          trim_tc && v.testcase.length > 30
                                              ? v.testcase.substr(0, 20) + " ... " + v.testcase.substr(v.testcase.length - 10)
                                              : v.testcase
                                      }<br>STDOUT:<br><b class="success">${v.stdouts[0]}</b>`
                              )
                              .join("<br>---<br>")}`
                  )
                  .join("<br>")
            : "None"
    }</p>`;
    return html;
}

function downloadResult() {
    if (downloadable) {
        const blob = new Blob([JSON.stringify(downloadable, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "result.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

async function crossCheck({ testcase, preprocessor, source_0, source_1, timeout }) {
    const api = fetch("/api/cross-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testcase, preprocessor, source_0, source_1, timeout }),
    })
        .then((res) => res.json())
        .catch(() => null);

    elm("#check").disabled = true;
    elm("#download").style.display = "none";
    setHash("");
    elm("#result").innerHTML = "It May Take A Few Moments. Please Wait.";
    elm("#result").scrollIntoView({ behavior: "smooth", block: "center" });
    const dots = setInterval(() => {
        elm("#result").innerHTML += ".";
    }, 1000);
    const result = await api;
    clearInterval(dots);
    if (result && result.result) {
        downloadable = result.result;
        elm("#download").style.display = "";
        elm("#result").innerHTML = viewable(result.result);
        setHash(result.hash);
        console.log(result);
    } else {
        elm("#result").innerHTML = "Something Went Wrong. Please Try Again.";
        if (result.error) elm("#result").innerHTML += `<br>${result.error}<br>${result.message}`;
    }
    elm("#result").scrollIntoView({ behavior: "smooth", block: "start" });
    elm("#check").disabled = false;
}

async function checkHash({ testcase_editor, preprocessor_editor, source_0_editor, source_1_editor }) {
    if (window.location.hash) {
        const hash = window.location.hash.substr(1, 32);
        if (hash.length === 32) {
            const data = await retrieve(hash);
            if (data) {
                downloadable = data.result || "";
                testcase_editor.setValue(data.testcase);
                preprocessor_editor.setValue(data.preprocessor);
                source_0_editor.setValue(data.source_0);
                source_1_editor.setValue(data.source_1);
                elm("#result").innerHTML = data.result ? viewable(data.result) : "";
                elm("#download").style.display = "";
                setHash(data.hash);
                if (data.timeout) elm("#timeout").value = data.timeout;
                switchPage("check");
                console.log("Retrieved", data.hash, JSON.stringify(data).length);
            } else {
                console.log("No data found");
            }
        }
    }
}
