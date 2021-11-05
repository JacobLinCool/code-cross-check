const pages = ["testcase", "preprocessor", "source-0", "source-1", "check"];

let current = "";

if (!current) switchPage(pages[0]);

function switchPage(page) {
    if (page === current) return;

    if (current !== "") {
        document.querySelector(`.page.current`).classList.remove("current");
        document.querySelector(`.nav-item.selected`).classList.remove("selected");
    }

    document.querySelector(`#${page}-page`).classList.add("current");
    document.querySelector(`#${page}-nav`).classList.add("selected");

    current = page;
}

export { switchPage, pages };
