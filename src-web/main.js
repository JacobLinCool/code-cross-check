import "./tailwind.css";
import "./style.css";
import setUp from "./setup";

(async () => {
    let downloadable = null;

    const { testcase_editor, preprocessor_editor, source_0_editor, source_1_editor } = await setUp();
    document.querySelector("#check").addEventListener("click", crossCheck);
    document.querySelector("#download").addEventListener("click", downloadResult);
    document.querySelector("#testcase-file").addEventListener("change", async (e) => {
        testcase_editor.setValue(await readFile(e.target.files[0]));
    });
    document.querySelector("#preprocessor-file").addEventListener("change", async (e) => {
        preprocessor_editor.setValue(await readFile(e.target.files[0]));
    });
    document.querySelector("#source_0-file").addEventListener("change", async (e) => {
        source_0_editor.setValue(await readFile(e.target.files[0]));
    });
    document.querySelector("#source_1-file").addEventListener("change", async (e) => {
        source_1_editor.setValue(await readFile(e.target.files[0]));
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

    document.querySelector("#container").style.opacity = 1;

    async function crossCheck() {
        const testcase = testcase_editor.getValue();
        const preprocessor = preprocessor_editor.getValue();
        const source_0 = source_0_editor.getValue();
        const source_1 = source_1_editor.getValue();

        const api = fetch("/api/cross-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ testcase, preprocessor, source_0, source_1 }),
        }).then((res) => res.json());

        document.querySelector("#download").style.display = "none";
        document.querySelector("#result").innerHTML = "It May Take A Few Moments. Please Wait.";
        document.querySelector("#result").scrollIntoView({ behavior: "smooth", block: "center" });
        const dots = setInterval(() => {
            document.querySelector("#result").innerHTML += ".";
        }, 1000);
        const result = await api;
        clearInterval(dots);
        downloadable = result;
        document.querySelector("#download").style.display = "";
        document.querySelector("#result").innerHTML = viewable(result);
        document.querySelector("#result").scrollIntoView({ behavior: "smooth", block: "start" });
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
})();
