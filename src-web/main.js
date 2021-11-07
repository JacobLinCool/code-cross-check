import "./tailwind.css";
import "./style.css";
import setUp from "./setup";
import { switchPage, pages } from "./switcher";
import "./service";

(async () => {
    let downloadable = null;

    const { testcase_editor, preprocessor_editor, source_0_editor, source_1_editor } = await setUp();

    pages.forEach((page) => {
        document.querySelector(`#${page}-nav`).addEventListener("click", () => {
            switchPage(page);
        });
    });

    document.querySelector("#check").addEventListener("click", crossCheck);
    document.querySelector("#download").addEventListener("click", downloadResult);
    document.querySelector("#testcase-file").addEventListener("change", async (e) => {
        testcase_editor.setValue(await readFile(e.target.files[0]));
    });
    document.querySelector("#preprocessor-file").addEventListener("change", async (e) => {
        preprocessor_editor.setValue(await readFile(e.target.files[0]));
    });
    document.querySelector("#source-0-file").addEventListener("change", async (e) => {
        source_0_editor.setValue(await readFile(e.target.files[0]));
    });
    document.querySelector("#source-1-file").addEventListener("change", async (e) => {
        source_1_editor.setValue(await readFile(e.target.files[0]));
    });
    document.querySelector("#testcase-fetch").addEventListener("click", async () => {
        popup(async (val) => testcase_editor.setValue(await fetchCode(val)));
    });
    document.querySelector("#preprocessor-fetch").addEventListener("click", async () => {
        popup(async (val) => preprocessor_editor.setValue(await fetchCode(val)));
    });
    document.querySelector("#source-0-fetch").addEventListener("click", async () => {
        popup(async (val) => source_0_editor.setValue(await fetchCode(val)));
    });
    document.querySelector("#source-1-fetch").addEventListener("click", async () => {
        popup(async (val) => source_1_editor.setValue(await fetchCode(val)));
    });
    [...document.querySelectorAll(".label")].forEach((label) => {
        label.addEventListener("click", (e) => {
            if (label !== e.target) return;
            const wrap = e.target.parentElement.querySelector(".editor-wrap");
            if (wrap.classList.contains("h-0")) {
                wrap.classList.remove("h-0");
                wrap.classList.add("h-72");
            } else {
                wrap.classList.remove("h-72");
                wrap.classList.add("h-0");
            }
        });
    });

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
                document.querySelector("#result").innerHTML = data.result ? viewable(data.result) : "";
                document.querySelector("#download").style.display = "";
                setHash(data.hash);
                if (data.timeout) document.querySelector("#timeout").value = data.timeout;
                switchPage("check");
                console.log("Retrieved", data.hash, JSON.stringify(data).length);
            } else {
                console.log("No data found");
            }
        }
    }

    document.querySelector("#container").style.opacity = 1;

    async function crossCheck() {
        const testcase = testcase_editor.getValue();
        const preprocessor = preprocessor_editor.getValue();
        const source_0 = source_0_editor.getValue();
        const source_1 = source_1_editor.getValue();
        const timeout = +document.querySelector("#timeout").value || 5000;

        const api = fetch("/api/cross-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ testcase, preprocessor, source_0, source_1, timeout }),
        })
            .then((res) => res.json())
            .catch(() => null);

        document.querySelector("#check").disabled = true;
        document.querySelector("#download").style.display = "none";
        setHash("");
        document.querySelector("#result").innerHTML = "It May Take A Few Moments. Please Wait.";
        document.querySelector("#result").scrollIntoView({ behavior: "smooth", block: "center" });
        const dots = setInterval(() => {
            document.querySelector("#result").innerHTML += ".";
        }, 1000);
        const result = await api;
        clearInterval(dots);
        if (result && result.result) {
            downloadable = result.result;
            document.querySelector("#download").style.display = "";
            document.querySelector("#result").innerHTML = viewable(result.result);
            setHash(result.hash);
            console.log(result);
        } else {
            document.querySelector("#result").innerHTML = "Something Went Wrong. Please Try Again.";
            if (result.error) document.querySelector("#result").innerHTML += `<br>${result.error}<br>${result.message}`;
        }
        document.querySelector("#result").scrollIntoView({ behavior: "smooth", block: "start" });
        document.querySelector("#check").disabled = false;
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

    function viewable({ diff, same }) {
        const diffs = Object.values(diff).reduce((acc, cur) => acc + cur.length, 0);
        const sames = Object.values(same).reduce((acc, cur) => acc + cur.length, 0);
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
                                  .map((v) => `TESTCASE: ${v.testcase}<br>STDOUTS:<br><b class="text-nord11">${v.stdouts.join("<br>")}</b>`)
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
                                  .map((v) => `TESTCASE: ${v.testcase}<br>STDOUT: <b class="success">${v.stdouts[0]}</b>`)
                                  .join("<br>---<br>")}`
                      )
                      .join("<br>")
                : "None"
        }</p>`;
        return html;
    }

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    function popup(callback) {
        document.querySelector("#container").style.filter = "blur(5px) grayscale(0.5)";
        document.querySelector("#popup").style.display = "flex";
        document.querySelector("#popup-input").focus();
        document.querySelector("#popup-input").onkeydown = async (e) => {
            e.target.value = e.target.value.trim();
            if (e.key === "Enter") {
                e.target.disabled = true;
                e.target.onkeydown = null;
                if (e.target.value) await callback(e.target.value);
                e.target.value = "";
                e.target.disabled = false;
                document.querySelector("#popup").style.display = "none";
                document.querySelector("#container").style.filter = "blur(0px)";
            }
        };
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
        document.querySelector("#hash").innerHTML = hash;
        const url = window.location.origin + window.location.pathname + "#" + hash;
        document.querySelector("#hash").href = url;
    }
})();
