import { elm } from "./utils";
const pages = ["testcase", "preprocessor", "source-0", "source-1", "check"];

let current = "";

if (!current) switchPage(pages[0]);

function switchPage(page) {
    if (page === current) return;

    if (current !== "") {
        elm(`.page.current`).classList.remove("current");
        elm(`.nav-item.selected`).classList.remove("selected");
    }

    elm(`#${page}-page`).classList.add("current");
    elm(`#${page}-nav`).classList.add("selected");

    current = page;
}

export { switchPage, pages };
